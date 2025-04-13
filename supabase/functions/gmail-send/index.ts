
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1";

// Environment variables
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create a Supabase client with the admin key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface EmailRequest {
  to: string;
  subject: string;
  message: string;
  cc?: string;
  bcc?: string;
  leadId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Parse request body
    const { to, subject, message, cc, bcc, leadId }: EmailRequest = await req.json();
    
    if (!to || !subject || !message || !leadId) {
      return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Get the user's Gmail credentials
    const { data: connectionData, error: connectionError } = await supabase
      .from('user_email_connections')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (connectionError || !connectionData) {
      console.error('Gmail connection not found:', connectionError?.message);
      return new Response(JSON.stringify({ 
        error: 'Gmail connection not found',
        details: connectionError?.message
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Check if the token is expired
    if (new Date(connectionData.token_expiry) < new Date()) {
      // Refresh the token
      console.log('Access token expired, refreshing...');
      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: '87876889304-5ee6ln0j3hjoh9hq4h604rjebomac9ua.apps.googleusercontent.com',
          client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET')!,
          refresh_token: connectionData.refresh_token,
          grant_type: 'refresh_token',
        }),
      });
      
      const refreshData = await refreshResponse.json();
      
      if (refreshData.error) {
        console.error('Failed to refresh token:', refreshData);
        return new Response(JSON.stringify({ 
          error: 'Failed to refresh token',
          details: refreshData.error_description || refreshData.error
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
      
      // Update the token in the database
      await supabase
        .from('user_email_connections')
        .update({
          access_token: refreshData.access_token,
          token_expiry: new Date(Date.now() + refreshData.expires_in * 1000).toISOString(),
        })
        .eq('id', connectionData.id);
      
      connectionData.access_token = refreshData.access_token;
      console.log('Token refreshed successfully');
    }

    // Create RFC822 email message
    let emailContent = `From: ${connectionData.email}\r\n`;
    emailContent += `To: ${to}\r\n`;
    
    if (cc) {
      emailContent += `Cc: ${cc}\r\n`;
    }
    
    if (bcc) {
      emailContent += `Bcc: ${bcc}\r\n`;
    }
    
    emailContent += `Subject: ${subject}\r\n\r\n`;
    emailContent += message;

    // Encode the message in base64
    const encodedMessage = btoa(emailContent)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Send the email using Gmail API
    console.log('Sending email via Gmail API...');
    const sendResponse = await fetch(
      'https://www.googleapis.com/gmail/v1/users/me/messages/send',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${connectionData.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          raw: encodedMessage,
        }),
      }
    );

    if (!sendResponse.ok) {
      const errorData = await sendResponse.json();
      console.error('Error sending email:', errorData);
      return new Response(JSON.stringify({ 
        error: 'Failed to send email',
        details: errorData.error?.message || 'Unknown error',
        status: sendResponse.status
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const responseData = await sendResponse.json();
    console.log('Email sent successfully, response:', responseData);

    // Store the sent email in the lead_emails table
    const { error: insertError } = await supabase
      .from('lead_emails')
      .insert({
        lead_id: leadId,
        user_id: user.id,
        gmail_message_id: responseData.id,
        sender: connectionData.email,
        recipient: to,
        subject: subject,
        body_text: message,
        date: new Date().toISOString(),
        is_sent: true,
      });

    if (insertError) {
      console.error('Error storing sent email:', insertError);
      // We continue even if storage fails, since the email was sent
    }

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: responseData.id 
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error) {
    console.error('Error in gmail-send function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      stack: (error as Error).stack
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
