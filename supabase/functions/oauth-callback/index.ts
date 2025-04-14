
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

/**
 * Render an HTML response for success or error cases
 */
function renderHtmlResponse(options: {
  title: string;
  className: string;
  heading: string;
  message: string;
  details?: string;
  redirectUri?: string;
  redirectDelay?: number;
  email?: string;
  status?: number;
}) {
  const {
    title,
    className,
    heading,
    message,
    details,
    redirectUri,
    redirectDelay = 5000, // Increased delay to ensure page loads properly
    email,
    status = 200
  } = options;

  const appUrl = redirectUri || 'https://gadait-international.com';
  
  // Create a safer redirect script that handles errors gracefully
  const redirectScript = redirectUri ? `
    <script>
      // Function to safely redirect
      function safeRedirect() {
        try {
          // Store success flag in localStorage
          localStorage.setItem('oauth_success', 'true');
          localStorage.setItem('oauth_email', '${email || ''}');
          
          // Create the redirect URL with proper parameters
          let redirectUrl = "${redirectUri}";
          
          // Add the oauth_success parameter if not already present
          if (!redirectUrl.includes('oauth_success=')) {
            redirectUrl += (redirectUrl.includes('?') ? '&' : '?') + "oauth_success=true";
          }
          
          // Add the tab=emails parameter if not already present and it's a lead page
          if (redirectUrl.includes('/leads/') && !redirectUrl.includes('tab=emails')) {
            redirectUrl += (redirectUrl.includes('?') ? '&' : '?') + "tab=emails";
          }
          
          console.log("Redirecting to:", redirectUrl);
          
          // Use replace to avoid back button issues
          window.location.replace(redirectUrl);
        } catch (e) {
          console.error("Error during redirect:", e);
          // Fallback direct redirect without any parameters
          window.location.href = "${appUrl}";
        }
      }
      
      // Attempt redirect after delay
      setTimeout(safeRedirect, ${redirectDelay});
      
      // Also provide a manual click option for users
      function manualRedirect() {
        safeRedirect();
        return false; // Prevent default anchor behavior
      }
    </script>
  ` : '';

  const detailsSection = details ? `
    <div class="details">
      <h3>Informations techniques:</h3>
      <pre>${details}</pre>
    </div>
  ` : '';

  const emailInfo = email ? `<p>Vous avez connecté votre compte Gmail: <strong>${email}</strong></p>` : '';

  return new Response(
    `<!DOCTYPE html>
    <html lang="fr">
      <head>
        <title>${title}</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background-color: #f9f9f9; padding: 20px; }
          .container { text-align: center; max-width: 600px; padding: 2rem; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border-radius: 8px; background: white; }
          .${className} { color: ${className === 'success' ? '#2ecc71' : '#e74c3c'}; }
          .details { margin-top: 20px; background: #f8f8f8; padding: 15px; border-radius: 5px; text-align: left; }
          code { background: #eee; padding: 2px 5px; border-radius: 3px; font-size: 0.9em; }
          pre { white-space: pre-wrap; overflow-x: auto; font-size: 12px; background: #f0f0f0; padding: 10px; border-radius: 4px; }
          .loader { border: 4px solid #f3f3f3; border-radius: 50%; border-top: 4px solid ${className === 'success' ? '#2ecc71' : '#e74c3c'}; width: 30px; height: 30px; animation: spin 1s linear infinite; margin: 20px auto; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          .btn { display: inline-block; background: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold; margin-top: 15px; }
          .btn:hover { background: #2980b9; }
          
          /* Add dark mode support */
          @media (prefers-color-scheme: dark) {
            body { background-color: #1a1a1a; color: #e0e0e0; }
            .container { background: #2a2a2a; box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
            .details { background: #333; }
            code { background: #444; color: #e0e0e0; }
            pre { background: #333; color: #e0e0e0; }
            .success { color: #4ecca3; }
            .error { color: #e57373; }
            .btn { background: #2980b9; }
            .btn:hover { background: #3498db; }
          }
        </style>
        ${redirectScript}
      </head>
      <body>
        <div class="container">
          <h1 class="${className}">${heading}</h1>
          <p>${message}</p>
          ${emailInfo}
          ${redirectUri ? `
            <div class="loader"></div>
            <p>Redirection automatique vers l'application en cours...</p>
            <p><a href="${redirectUri}" class="btn" onclick="return manualRedirect()">Cliquez ici si vous n'êtes pas redirigé</a></p>
          ` : ''}
          ${detailsSection}
        </div>
      </body>
    </html>`,
    { 
      headers: { 'Content-Type': 'text/html' },
      status
    }
  );
}

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
      url: req.url
    });
    
    // Extract state parameter to get the redirect URI regardless of error
    let redirectUri = 'https://gadait-international.com/leads';
    let userId = '';
    
    if (stateParam) {
      try {
        const stateObj = JSON.parse(decodeURIComponent(stateParam));
        redirectUri = stateObj.redirectUri || redirectUri;
        userId = stateObj.userId || '';
        
        console.log("Parsed state object:", { redirectUri, userId });
      } catch (e) {
        console.error('Error parsing state:', e);
        // Continue with default redirect URI
      }
    }
    
    // Check if there's an error parameter from Google
    if (error) {
      console.error("OAuth error from Google:", error);
      const error_description = url.searchParams.get('error_description') || '';
      
      return renderHtmlResponse({
        title: "Error",
        className: "error",
        heading: "Authentification échouée",
        message: `Erreur: ${error}`,
        details: `
          <p>${error_description}</p>
          <div>
            <h3>Vérifiez la configuration Google:</h3>
            <ul style="text-align: left;">
              <li>Assurez-vous que votre projet est correctement configuré dans la <a href="https://console.cloud.google.com/apis/credentials" target="_blank">Console Google Cloud</a></li>
              <li>Vérifiez que l'URI de redirection autorisée est: <code>${REDIRECT_URI}</code></li>
              <li>Vérifiez que l'API Gmail est activée</li>
              <li>Vérifiez le client ID et le client secret</li>
            </ul>
          </div>
        `,
        redirectUri: redirectUri, // Always redirect, even on error
        redirectDelay: 7000,
        status: 400
      });
    }
    
    if (!code) {
      return renderHtmlResponse({
        title: "Error",
        className: "error",
        heading: "Authentification échouée",
        message: "Code d'autorisation manquant.",
        redirectUri: redirectUri, // Always redirect, even on error
        redirectDelay: 7000,
        status: 400
      });
    }
    
    // If code exists, proceed with token exchange
    try {
      // Exchange code for tokens
      console.log("Exchanging code for tokens...");
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
      
      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error(`Error exchanging code for tokens: ${tokenResponse.status}`, errorText);
        
        return renderHtmlResponse({
          title: "Erreur",
          className: "error",
          heading: "Échec d'authentification",
          message: `Erreur lors de l'échange du code contre des tokens: ${tokenResponse.status}`,
          details: errorText,
          redirectUri: redirectUri, // Always redirect, even on error
          redirectDelay: 10000,
          status: 500
        });
      }
      
      const tokenData = await tokenResponse.json();
      
      if (tokenData.error) {
        console.error(`Error in token response: ${tokenData.error}`, tokenData);
        
        return renderHtmlResponse({
          title: "Erreur",
          className: "error",
          heading: "Échec d'authentification",
          message: `Erreur: ${tokenData.error}`,
          details: tokenData.error_description || JSON.stringify(tokenData),
          redirectUri: redirectUri, // Always redirect, even on error
          redirectDelay: 10000,
          status: 400
        });
      }
      
      // Get user info to determine the Gmail address
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v1/userinfo', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      });
      
      if (!userInfoResponse.ok) {
        const errorText = await userInfoResponse.text();
        console.error(`Error fetching user info: ${userInfoResponse.status}`, errorText);
        
        return renderHtmlResponse({
          title: "Erreur",
          className: "error",
          heading: "Échec d'authentification",
          message: "Impossible de récupérer les informations de l'utilisateur.",
          details: errorText,
          redirectUri: redirectUri, // Always redirect, even on error
          redirectDelay: 10000,
          status: 500
        });
      }
      
      const userInfo = await userInfoResponse.json();
      console.log("Retrieved user info:", userInfo.email);
      
      if (!userId) {
        console.warn("No userId provided in state, using a placeholder.");
        // Here you might want to look up the user by email if available
        // For now, we'll proceed with a warning
      }
      
      // Store the tokens in the database
      if (userId) {
        try {
          const { error: storeError } = await supabase
            .from('user_email_connections')
            .upsert({
              user_id: userId,
              email: userInfo.email,
              access_token: tokenData.access_token,
              refresh_token: tokenData.refresh_token || '',
              token_expiry: new Date(Date.now() + (tokenData.expires_in || 3600) * 1000).toISOString(),
            });
          
          if (storeError) {
            console.error(`Error storing tokens: ${storeError.message}`, storeError);
            // We'll continue despite the error, as the redirect is more important
          } else {
            console.log("Tokens stored successfully for user:", userId);
          }
        } catch (dbError) {
          console.error("Database error:", dbError);
          // Continue with the authentication process despite the error
        }
      } else {
        console.error("No userId provided, skipping token storage");
      }
      
      console.log("Authentication successful. Redirecting to:", redirectUri);
      
      // Ensure the redirectUri has the necessary parameters
      // Add tab=emails to the redirect URI if it's a lead page
      if (redirectUri.includes('/leads/') && !redirectUri.includes('tab=emails')) {
        redirectUri = redirectUri.includes('?') 
          ? `${redirectUri}&tab=emails` 
          : `${redirectUri}?tab=emails`;
      }
      
      return renderHtmlResponse({
        title: "Succès",
        className: "success",
        heading: "Authentification réussie!",
        message: "Vous avez connecté votre compte Gmail avec succès.",
        email: userInfo.email,
        redirectUri: redirectUri,
        redirectDelay: 3000
      });
    } catch (error) {
      console.error('Error processing OAuth callback:', error);
      
      return renderHtmlResponse({
        title: "Erreur",
        className: "error",
        heading: "Erreur lors de l'authentification",
        message: `Une erreur s'est produite: ${(error as Error).message}`,
        redirectUri: redirectUri, // Always redirect, even on error
        redirectDelay: 10000,
        status: 500
      });
    }
  } catch (error) {
    console.error('Unexpected error in oauth-callback:', error);
    // In case of a catastrophic error, still try to redirect the user to the application
    const redirectUri = 'https://gadait-international.com/leads';
    
    return renderHtmlResponse({
      title: "Erreur inattendue",
      className: "error",
      heading: "Erreur inattendue",
      message: `Une erreur inattendue s'est produite: ${(error as Error).message}`,
      redirectUri: redirectUri, // Always redirect, even on error
      redirectDelay: 7000,
      status: 500
    });
  }
});
