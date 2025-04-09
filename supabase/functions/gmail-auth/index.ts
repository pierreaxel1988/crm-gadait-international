
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1";

// Replace these with your actual values
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const GOOGLE_CLIENT_ID = '87876889304-jgq4aon6dia70esiul86hogss2l11e4d.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET')!;
const REDIRECT_URI = 'https://success.gadait-international.com/oauth/callback';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create a Supabase client with the admin key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Generate a random state for OAuth security
const generateState = () => {
  return crypto.randomUUID();
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, code, state, redirectUri } = await req.json();

    // Step 1: Generate authorization URL
    if (action === 'authorize') {
      const state = generateState();
      
      // Store the state in a secure table for verification later
      // This step depends on your application's architecture
      
      // Gmail API scopes - modify as needed
      const scopes = [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.compose',
        'https://www.googleapis.com/auth/gmail.modify',
        'https://www.googleapis.com/auth/userinfo.email'
      ];
      
      const authorizationUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${GOOGLE_CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
        `&response_type=code` +
        `&scope=${encodeURIComponent(scopes.join(' '))}` +
        `&access_type=offline` +
        `&prompt=consent` +
        `&state=${encodeURIComponent(JSON.stringify({
          redirectUri: redirectUri || '',
          state: state
        }))}`;
      
      return new Response(JSON.stringify({ authorizationUrl }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
    
    // Step 2: Exchange authorization code for tokens
    if (action === 'exchange') {
      // Verify the state matches what we expect
      
      // Exchange the code for tokens
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          redirect_uri: REDIRECT_URI,
          grant_type: 'authorization_code',
        }),
      });
      
      const tokenData = await tokenResponse.json();
      
      if (tokenData.error) {
        throw new Error(`Error exchanging code for tokens: ${tokenData.error}`);
      }
      
      // Get user info to determine the Gmail address
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v1/userinfo', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      });
      
      const userInfo = await userInfoResponse.json();
      
      // Store the tokens in your database
      // This is just a simplified example
      const { error: storeError } = await supabase
        .from('user_email_connections')
        .upsert({
          user_id: state.userId,
          email: userInfo.email,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          token_expiry: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
        });
      
      if (storeError) {
        throw new Error(`Error storing tokens: ${storeError.message}`);
      }
      
      return new Response(JSON.stringify({ success: true, redirectUri: state.redirectUri }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
    
    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error) {
    console.error('Error in gmail-auth function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
