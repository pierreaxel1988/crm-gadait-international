
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1";

// Replace these with your actual values
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create a Supabase client with the admin key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Get user from auth
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
    
    // Get the request parameters
    const { leadId, leadEmail } = await req.json();
    
    if (!leadId || !leadEmail) {
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
      return new Response(JSON.stringify({ error: 'Gmail connection not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
    
    // Check if the token is expired
    if (new Date(connectionData.token_expiry) < new Date()) {
      // Refresh the token
      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: '87876889304-jgq4aon6dia70esiul86hogss2l11e4d.apps.googleusercontent.com',
          client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET')!,
          refresh_token: connectionData.refresh_token,
          grant_type: 'refresh_token',
        }),
      });
      
      const refreshData = await refreshResponse.json();
      
      if (refreshData.error) {
        return new Response(JSON.stringify({ error: 'Failed to refresh token' }), {
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
    }
    
    // Get existing email IDs to avoid duplicates
    const { data: existingEmails } = await supabase
      .from('lead_emails')
      .select('gmail_message_id')
      .eq('lead_id', leadId);
    
    const existingIds = new Set((existingEmails || []).map(e => e.gmail_message_id));
    
    // Search for emails related to this lead
    // Build the Gmail query - look for emails to or from the lead's email
    const query = `to:${leadEmail} OR from:${leadEmail}`;
    const searchResponse = await fetch(
      `https://www.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}`,
      {
        headers: {
          'Authorization': `Bearer ${connectionData.access_token}`,
        },
      }
    );
    
    const searchData = await searchResponse.json();
    
    if (searchData.error) {
      return new Response(JSON.stringify({ error: 'Failed to search emails' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
    
    if (!searchData.messages || searchData.messages.length === 0) {
      return new Response(JSON.stringify({ message: 'No emails found', newEmails: 0 }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
    
    // Process each message (limit to 10 for performance)
    const messagesToProcess = searchData.messages.slice(0, 10);
    let newEmails = 0;
    
    for (const message of messagesToProcess) {
      if (existingIds.has(message.id)) {
        continue; // Skip emails we already have
      }
      
      // Get the full message
      const messageResponse = await fetch(
        `https://www.googleapis.com/gmail/v1/users/me/messages/${message.id}?format=full`,
        {
          headers: {
            'Authorization': `Bearer ${connectionData.access_token}`,
          },
        }
      );
      
      const messageData = await messageResponse.json();
      
      if (messageData.error) {
        console.error('Error fetching message:', messageData.error);
        continue;
      }
      
      // Extract relevant data from the message
      const headers = messageData.payload.headers;
      const subject = headers.find(h => h.name.toLowerCase() === 'subject')?.value || '';
      const from = headers.find(h => h.name.toLowerCase() === 'from')?.value || '';
      const to = headers.find(h => h.name.toLowerCase() === 'to')?.value || '';
      const date = headers.find(h => h.name.toLowerCase() === 'date')?.value || '';
      
      // Determine if the email was sent by the user
      const isSent = from.includes(connectionData.email);
      
      // Extract the message body
      let bodyText = '';
      let bodyHtml = '';
      
      // Function to process message parts recursively
      function processMessageParts(part) {
        if (part.mimeType === 'text/plain' && part.body.data) {
          bodyText = atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
        } else if (part.mimeType === 'text/html' && part.body.data) {
          bodyHtml = atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
        } else if (part.parts) {
          part.parts.forEach(processMessageParts);
        }
      }
      
      if (messageData.payload.body && messageData.payload.body.data) {
        // Handle single-part messages
        if (messageData.payload.mimeType === 'text/plain') {
          bodyText = atob(messageData.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
        } else if (messageData.payload.mimeType === 'text/html') {
          bodyHtml = atob(messageData.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
        }
      } else if (messageData.payload.parts) {
        // Handle multipart messages
        messageData.payload.parts.forEach(processMessageParts);
      }
      
      // Store the email in the database
      const { error: insertError } = await supabase
        .from('lead_emails')
        .insert({
          lead_id: leadId,
          user_id: user.id,
          gmail_message_id: message.id,
          sender: from,
          recipient: to,
          subject,
          snippet: messageData.snippet || '',
          body_html: bodyHtml,
          body_text: bodyText,
          date: new Date(date).toISOString(),
          is_sent: isSent,
        });
      
      if (insertError) {
        console.error('Error inserting email:', insertError);
        continue;
      }
      
      newEmails++;
    }
    
    return new Response(
      JSON.stringify({ 
        message: 'Emails synced successfully', 
        newEmails,
        totalFound: searchData.messages.length
      }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error) {
    console.error('Error in gmail-sync function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
