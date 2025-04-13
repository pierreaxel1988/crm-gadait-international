
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1";

// Replace these with your actual values
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const GOOGLE_CLIENT_ID = '87876889304-jgq4aon6dia70esiul86hogss2l11e4d.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET')!;
// Use the REDIRECT_URI from the environment or have a default value
const REDIRECT_URI = Deno.env.get('OAUTH_REDIRECT_URI') || 'https://success.gadait-international.com/oauth/callback';

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
    const { action, code, state, redirectUri, userId } = await req.json();
    
    // Log the request for debugging
    console.log("Gmail auth request:", { 
      action, 
      userId, 
      hasRedirectUri: !!redirectUri,
      hasClientSecret: !!GOOGLE_CLIENT_SECRET,
      googleClientId: GOOGLE_CLIENT_ID,
      redirectUriEnv: REDIRECT_URI
    });

    // Step 1: Generate authorization URL
    if (action === 'authorize') {
      // Generate a random state for security
      const state = crypto.randomUUID();
      
      // Use the provided redirect URI or fallback to the default
      const finalRedirectUri = redirectUri || 'https://success.gadait-international.com/leads';
      console.log("Using redirect URI:", finalRedirectUri);
      console.log("Using user ID:", userId);
      
      // Gmail API scopes - modify as needed
      const scopes = [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.compose',
        'https://www.googleapis.com/auth/gmail.modify',
        'https://www.googleapis.com/auth/userinfo.email'
      ];
      
      // Create a state object that includes redirect URI and user ID
      const stateObj = {
        redirectUri: finalRedirectUri,
        userId: userId,
        state: state
      };
      
      console.log("Creating state object:", stateObj);
      
      // Build the authorization URL with all required parameters
      const authorizationUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${GOOGLE_CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
        `&response_type=code` +
        `&scope=${encodeURIComponent(scopes.join(' '))}` +
        `&access_type=offline` +
        `&prompt=consent` +
        `&state=${encodeURIComponent(JSON.stringify(stateObj))}`;
      
      console.log("Generated auth URL:", authorizationUrl);
      
      return new Response(JSON.stringify({ authorizationUrl }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
    
    // Step 2: Exchange authorization code for tokens
    if (action === 'exchange') {
      // Parse state object if provided
      let stateObj;
      if (typeof state === 'string') {
        try {
          stateObj = JSON.parse(state);
        } catch (e) {
          console.error('Error parsing state:', e);
          stateObj = state; // Use as is if parsing fails
        }
      } else {
        stateObj = state; // Use as is if not a string
      }
      
      console.log("Exchanging code for tokens with state:", stateObj);
      
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
        console.error(`Error exchanging code for tokens: ${tokenData.error}`, tokenData);
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
      const { error: storeError } = await supabase
        .from('user_email_connections')
        .upsert({
          user_id: stateObj.userId,
          email: userInfo.email,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          token_expiry: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
        });
      
      if (storeError) {
        console.error(`Error storing tokens: ${storeError.message}`, storeError);
        throw new Error(`Error storing tokens: ${storeError.message}`);
      }
      
      return new Response(JSON.stringify({ success: true, redirectUri: stateObj.redirectUri }), {
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
