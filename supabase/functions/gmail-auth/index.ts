
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1";

// Constantes pour l'authentification
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const GOOGLE_CLIENT_ID = '87876889304-5ee6ln0j3hjoh9hq4h604rjebomac9ua.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET')!;
// Use the REDIRECT_URI from the environment or have a default value
const REDIRECT_URI = Deno.env.get('OAUTH_REDIRECT_URI') || 'https://gadait-international.com/oauth/callback';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create a Supabase client with the admin key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false // Désactiver la persistance de session pour éviter les conflits
  }
});

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Requête reçue à la fonction gmail-auth");
    const requestBody = await req.json();
    const { action, code, state, redirectUri, userId, refreshToken } = requestBody;
    
    // Log the request for debugging
    console.log("Gmail auth request:", { 
      action, 
      userId, 
      hasCode: !!code,
      hasRefreshToken: !!refreshToken,
      hasRedirectUri: !!redirectUri,
      hasClientSecret: !!GOOGLE_CLIENT_SECRET,
      googleClientId: GOOGLE_CLIENT_ID,
      redirectUriEnv: REDIRECT_URI,
      requestHeaders: Object.fromEntries(req.headers.entries()),
      requestUrl: req.url
    });

    // Check for required environment variables
    if (!GOOGLE_CLIENT_SECRET) {
      console.error("Missing GOOGLE_CLIENT_SECRET environment variable");
      return new Response(JSON.stringify({ 
        error: 'Configuration error: Missing Google client secret',
        details: 'The server is missing required configuration. Please contact your administrator.'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Step 1: Generate authorization URL
    if (action === 'authorize') {
      if (!userId) {
        console.error("Missing userId in authorize request");
        return new Response(JSON.stringify({ 
          error: 'Bad Request',
          details: 'User ID is required for authorization'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // Generate a random state for security
      const state = crypto.randomUUID();
      
      // Use the provided redirect URI or fallback to the default
      const finalRedirectUri = redirectUri || 'https://gadait-international.com/leads';
      console.log("Using redirect URI:", finalRedirectUri);
      console.log("Using user ID:", userId);
      
      // Gmail API scopes - IMPORTANT: Include all required scopes
      const scopes = [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.compose',
        'https://www.googleapis.com/auth/gmail.modify',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
        'openid'  // Added openid scope for better compatibility
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
        `&include_granted_scopes=true` + // Added parameter to include previously granted scopes
        `&state=${encodeURIComponent(JSON.stringify(stateObj))}`;
      
      console.log("Generated auth URL:", authorizationUrl);
      
      return new Response(JSON.stringify({ authorizationUrl }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
    
    // Step 2: Exchange authorization code for tokens
    if (action === 'exchange') {
      if (!code) {
        console.error("Missing code in exchange request");
        return new Response(JSON.stringify({ 
          error: 'Bad Request',
          details: 'Authorization code is required for token exchange'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

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
      
      try {
        // Exchange the code for tokens with retry logic
        let tokenResponse;
        let tokenData;
        let retryCount = 0;
        const maxRetries = 2;
        
        while (retryCount <= maxRetries) {
          try {
            tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
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
            
            console.log("Token exchange response status:", tokenResponse.status);
            
            if (!tokenResponse.ok) {
              const errorText = await tokenResponse.text();
              console.error(`Error exchanging code for tokens (attempt ${retryCount + 1}): ${tokenResponse.status}`, errorText);
              
              // Si c'est une erreur Cloudflare, attendre et réessayer
              if (errorText.includes('cloudflare') || tokenResponse.status === 524 || tokenResponse.status === 1101) {
                retryCount++;
                if (retryCount <= maxRetries) {
                  // Attendre avant de réessayer (backoff exponentiel)
                  await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
                  continue;
                } else {
                  return new Response(JSON.stringify({ 
                    error: 'Cloudflare error',
                    cloudflareError: true,
                    details: errorText,
                    redirectUri: stateObj?.redirectUri
                  }), {
                    status: 503,
                    headers: { 'Content-Type': 'application/json', ...corsHeaders },
                  });
                }
              }
              
              throw new Error(`Error ${tokenResponse.status}: ${errorText}`);
            }
            
            tokenData = await tokenResponse.json();
            
            if (tokenData.error) {
              console.error(`Error in token response: ${tokenData.error}`, tokenData);
              throw new Error(`Error in token response: ${tokenData.error}`);
            }
            
            break; // Sortir de la boucle si réussi
          } catch (e) {
            retryCount++;
            if (retryCount > maxRetries) throw e;
            // Attendre avant de réessayer
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
          }
        }
      
        console.log("Token exchange successful, getting user info");
        
        // Get user info to determine the Gmail address
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v1/userinfo', {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
          },
        });
        
        if (!userInfoResponse.ok) {
          const errorText = await userInfoResponse.text();
          console.error(`Error fetching user info: ${userInfoResponse.status}`, errorText);
          throw new Error(`Error fetching user info: ${errorText}`);
        }
        
        const userInfo = await userInfoResponse.json();
        console.log("User info retrieved:", userInfo.email);
        
        // Store the tokens in your database
        const { error: storeError } = await supabase
          .from('user_email_connections')
          .upsert({
            user_id: stateObj.userId,
            email: userInfo.email,
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token || "", // Sometimes refresh token might not be returned if previously granted
            token_expiry: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
          });
        
        if (storeError) {
          console.error(`Error storing tokens: ${storeError.message}`, storeError);
          throw new Error(`Error storing tokens: ${storeError.message}`);
        }
        
        console.log("Tokens stored successfully");
        return new Response(JSON.stringify({ success: true, redirectUri: stateObj.redirectUri }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      } catch (exchangeError) {
        // Vérifier si c'est une erreur Cloudflare
        if (exchangeError.toString().includes('cloudflare') || 
            exchangeError.toString().includes('524') || 
            exchangeError.toString().includes('1101')) {
          console.error('Cloudflare error during token exchange:', exchangeError);
          return new Response(JSON.stringify({ 
            error: 'Cloudflare error',
            cloudflareError: true,
            details: exchangeError.toString(),
            redirectUri: stateObj?.redirectUri
          }), {
            status: 503,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }
        
        console.error('Error during token exchange:', exchangeError);
        return new Response(JSON.stringify({ 
          error: exchangeError.toString(),
          details: 'Error during token exchange process',
          redirectUri: stateObj?.redirectUri
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
    }
    
    // Step 3: Refresh access token using refresh token
    if (action === 'refresh') {
      if (!userId || !refreshToken) {
        console.error("Missing userId or refreshToken in refresh request");
        return new Response(JSON.stringify({ 
          error: 'Bad Request',
          details: 'User ID and refresh token are required for token refresh'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
      
      console.log("Refreshing token for user:", userId);
      
      try {
        const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            refresh_token: refreshToken,
            grant_type: 'refresh_token',
          }),
        });
        
        if (!refreshResponse.ok) {
          const errorText = await refreshResponse.text();
          console.error('Failed to refresh token:', refreshResponse.status, errorText);
          return new Response(JSON.stringify({ 
            error: 'Failed to refresh token',
            details: errorText,
            status: refreshResponse.status
          }), {
            status: refreshResponse.status,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }
        
        const refreshData = await refreshResponse.json();
        
        if (refreshData.error) {
          console.error('Error in refresh token response:', refreshData);
          return new Response(JSON.stringify({ 
            error: 'Failed to refresh token',
            details: refreshData.error_description || refreshData.error
          }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }
        
        // Update the token in the database
        const { error: updateError } = await supabase
          .from('user_email_connections')
          .update({
            access_token: refreshData.access_token,
            token_expiry: new Date(Date.now() + refreshData.expires_in * 1000).toISOString(),
          })
          .eq('user_id', userId);
        
        if (updateError) {
          console.error('Error updating refreshed token:', updateError);
          throw new Error(`Error updating refreshed token: ${updateError.message}`);
        }
        
        console.log("Token refreshed successfully for user:", userId);
        
        return new Response(JSON.stringify({ 
          success: true,
          expires_in: refreshData.expires_in
        }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      } catch (error) {
        console.error('Error refreshing token:', error);
        return new Response(JSON.stringify({ 
          error: error.toString(),
          details: 'Error during token refresh process'
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
    }
    
    // Status check endpoint for health verification
    if (action === 'status-check') {
      return new Response(JSON.stringify({ status: 'ok', message: 'Gmail auth function is running' }), {
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
