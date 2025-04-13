
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1";

// Replace these with your actual values
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const GOOGLE_CLIENT_ID = '87876889304-5ee6ln0j3hjoh9hq4h604rjebomac9ua.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET')!;
const REDIRECT_URI = Deno.env.get('OAUTH_REDIRECT_URI') || 'https://success.gadait-international.com/oauth/callback';

// Create a Supabase client with the admin key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  try {
    // Get the code and state from the URL
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const stateParam = url.searchParams.get('state');
    const error = url.searchParams.get('error');
    
    console.log("OAuth callback received:", { 
      codeExists: !!code, 
      stateExists: !!stateParam,
      error: error,
      url: req.url,
      envCheck: {
        hasSupabaseUrl: !!SUPABASE_URL,
        hasSupabaseKey: !!SUPABASE_SERVICE_ROLE_KEY,
        hasClientId: !!GOOGLE_CLIENT_ID,
        hasClientSecret: !!GOOGLE_CLIENT_SECRET,
        redirectUri: REDIRECT_URI
      }
    });
    
    // Check if there's an error parameter from Google
    if (error) {
      console.error("OAuth error from Google:", error);
      const error_description = url.searchParams.get('error_description') || '';
      
      return new Response(
        `<html>
          <head>
            <title>Error</title>
            <style>
              body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; }
              .container { text-align: center; max-width: 600px; }
              .error { color: #e74c3c; }
              .details { margin-top: 20px; background: #f8f8f8; padding: 15px; border-radius: 5px; text-align: left; }
              code { background: #eee; padding: 2px 5px; border-radius: 3px; font-size: 0.9em; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1 class="error">Authentification échouée</h1>
              <p>Erreur: ${error}</p>
              <p>${error_description}</p>
              
              <div class="details">
                <h3>Vérifiez la configuration Google:</h3>
                <ul style="text-align: left;">
                  <li>Assurez-vous que votre projet est correctement configuré dans la <a href="https://console.cloud.google.com/apis/credentials" target="_blank">Console Google Cloud</a></li>
                  <li>Vérifiez que l'URI de redirection autorisée est: <code>${REDIRECT_URI}</code></li>
                  <li>Vérifiez que l'API Gmail est activée</li>
                  <li>Vérifiez le client ID et le client secret</li>
                </ul>
              </div>
              
              <p><a href="https://success.gadait-international.com/leads">Retour à l'application</a></p>
            </div>
          </body>
        </html>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }
    
    if (!code) {
      return new Response(
        `<html>
          <head>
            <title>Error</title>
            <style>
              body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; }
              .container { text-align: center; }
              .error { color: #e74c3c; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1 class="error">Authentification échouée</h1>
              <p>Code d'autorisation manquant.</p>
              <p><a href="https://success.gadait-international.com/leads">Retour à l'application</a></p>
            </div>
          </body>
        </html>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }
    
    let stateObj;
    let redirectUri = 'https://success.gadait-international.com/leads';
    let userId = '';
    
    try {
      // Parse the state parameter
      if (stateParam) {
        stateObj = JSON.parse(decodeURIComponent(stateParam));
        redirectUri = stateObj.redirectUri || redirectUri;
        userId = stateObj.userId || '';
        
        console.log("Parsed state object:", { redirectUri, userId });
      }
    } catch (e) {
      console.error('Error parsing state:', e);
    }
    
    // Exchange the code for tokens
    try {
      console.log("Exchanging code for tokens with params:", {
        code: code.substring(0, 10) + '...',
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET.substring(0, 5) + '...',
        redirect_uri: REDIRECT_URI
      });
      
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
      console.log("Token response received", { 
        hasError: !!tokenData.error,
        error: tokenData.error || null,
        error_description: tokenData.error_description || null,
        hasAccessToken: !!tokenData.access_token,
        status: tokenResponse.status,
        statusText: tokenResponse.statusText
      });
      
      if (tokenData.error) {
        return new Response(
          `<html>
            <head>
              <title>Error</title>
              <style>
                body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; }
                .container { text-align: center; max-width: 600px; }
                .error { color: #e74c3c; }
                .details { margin-top: 20px; background: #f8f8f8; padding: 15px; border-radius: 5px; text-align: left; }
                code { background: #eee; padding: 2px 5px; border-radius: 3px; font-size: 0.9em; }
              </style>
            </head>
            <body>
              <div class="container">
                <h1 class="error">Authentification échouée</h1>
                <p>Erreur lors de l'échange du code: ${tokenData.error}</p>
                <p>Description: ${tokenData.error_description || 'Aucune description supplémentaire'}</p>
                
                <div class="details">
                  <h3>Vérifiez la configuration Google:</h3>
                  <ul style="text-align: left;">
                    <li>Assurez-vous que votre projet est correctement configuré dans la <a href="https://console.cloud.google.com/apis/credentials" target="_blank">Console Google Cloud</a></li>
                    <li>Vérifiez que l'URI de redirection autorisée est: <code>${REDIRECT_URI}</code></li>
                    <li>Vérifiez que l'API Gmail est activée</li>
                    <li>Vérifiez le client ID et le client secret</li>
                  </ul>
                </div>
                
                <p><a href="https://success.gadait-international.com/leads">Retour à l'application</a></p>
              </div>
            </body>
          </html>`,
          { headers: { 'Content-Type': 'text/html' } }
        );
      }
      
      // Get user info to determine the Gmail address
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v1/userinfo', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      });
      
      const userInfo = await userInfoResponse.json();
      console.log("User info received:", { email: userInfo.email });
      
      // Get user ID if not available from token
      if (!userId) {
        console.log("No userId in state, looking up by email");
        // Look up the user by email
        const { data: teamMember } = await supabase
          .from('team_members')
          .select('id')
          .eq('email', userInfo.email)
          .maybeSingle();
        
        userId = teamMember?.id || '';
        console.log("Found user ID:", userId);
      }
      
      if (!userId) {
        return new Response(
          `<html>
            <head>
              <title>Error</title>
              <style>
                body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; }
                .container { text-align: center; }
                .error { color: #e74c3c; }
              </style>
            </head>
            <body>
              <div class="container">
                <h1 class="error">Utilisateur non trouvé</h1>
                <p>Impossible de trouver l'utilisateur correspondant à cette connexion.</p>
                <p><a href="https://success.gadait-international.com/leads">Retour à l'application</a></p>
              </div>
            </body>
          </html>`,
          { headers: { 'Content-Type': 'text/html' } }
        );
      }
      
      // Store the tokens in the database
      const { error: storeError } = await supabase
        .from('user_email_connections')
        .upsert({
          user_id: userId,
          email: userInfo.email,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token || '', // Store blank if not returned (happens for re-auth)
          token_expiry: new Date(Date.now() + (tokenData.expires_in || 3600) * 1000).toISOString(),
        });
      
      console.log("Storing tokens in database", { error: storeError?.message, userId });
      
      if (storeError) {
        return new Response(
          `<html>
            <head>
              <title>Error</title>
              <style>
                body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; }
                .container { text-align: center; }
                .error { color: #e74c3c; }
              </style>
            </head>
            <body>
              <div class="container">
                <h1 class="error">Erreur de stockage</h1>
                <p>Impossible de stocker les informations d'authentification: ${storeError.message}</p>
                <p><a href="https://success.gadait-international.com/leads">Retour à l'application</a></p>
              </div>
            </body>
          </html>`,
          { headers: { 'Content-Type': 'text/html' } }
        );
      }
      
      // Redirect back to the application
      return new Response(
        `<html>
          <head>
            <title>Success</title>
            <style>
              body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; }
              .container { text-align: center; }
              .success { color: #2ecc71; }
            </style>
            <script>
              setTimeout(function() {
                window.location.href = "${redirectUri}";
              }, 3000);
            </script>
          </head>
          <body>
            <div class="container">
              <h1 class="success">Authentification réussie!</h1>
              <p>Vous avez connecté votre compte Gmail: ${userInfo.email}</p>
              <p>Redirection vers l'application...</p>
              <p><a href="${redirectUri}">Cliquez ici si vous n'êtes pas redirigé</a></p>
            </div>
          </body>
        </html>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    } catch (fetchError) {
      console.error('Error exchanging code for tokens:', fetchError);
      return new Response(
        `<html>
          <head>
            <title>Error</title>
            <style>
              body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; }
              .container { text-align: center; max-width: 600px; }
              .error { color: #e74c3c; }
              .details { margin-top: 20px; background: #f8f8f8; padding: 15px; border-radius: 5px; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1 class="error">Erreur technique</h1>
              <p>Une erreur s'est produite lors de l'échange du code d'autorisation: ${fetchError.message}</p>
              
              <div class="details">
                <h3>Détails techniques:</h3>
                <pre>${JSON.stringify(fetchError, null, 2)}</pre>
              </div>
              
              <p><a href="https://success.gadait-international.com/leads">Retour à l'application</a></p>
            </div>
          </body>
        </html>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }
  } catch (error) {
    console.error('Error in oauth-callback function:', error);
    return new Response(
      `<html>
        <head>
          <title>Error</title>
          <style>
            body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; }
            .container { text-align: center; }
            .error { color: #e74c3c; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="error">Erreur</h1>
            <p>Une erreur s'est produite lors de l'authentification: ${error.message}</p>
            <p><a href="https://success.gadait-international.com/leads">Retour à l'application</a></p>
          </div>
        </body>
      </html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
});
