
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
    redirectDelay = 0, // Instantaneous redirection
    email,
    status = 200
  } = options;

  const appUrl = redirectUri || 'https://gadait-international.com';
  
  // Script to handle redirection with improved reliability
  const redirectScript = redirectUri ? `
    <script>
      // Store data in localStorage immediately
      if ('${email}') {
        localStorage.setItem('oauth_email', '${email}');
      }
      localStorage.setItem('oauth_success', 'true');
      localStorage.removeItem('oauth_pending');
      localStorage.removeItem('oauth_connection_error');
      
      // Fonction forcant l'ouverture via window.location.href
      function forceNavigateTo(url) {
        console.log("Forcing navigation to:", url);
        window.location.href = url;
      }
      
      // Fonction forcant l'ouverture via window.open
      function forceOpenUrl(url) {
        console.log("Force opening URL:", url);
        const win = window.open(url, "_self");
        if (!win) {
          console.error("Couldn't open window, trying direct navigation");
          forceNavigateTo(url);
        }
      }
      
      // Fonction principale de redirection avec plusieurs méthodes
      function executeRedirect() {
        try {
          console.log("Starting redirect process...");
          
          // Préparer l'URL de redirection
          let redirectUrl = "${redirectUri}";
          redirectUrl = decodeURIComponent(redirectUrl);
          
          // S'assurer d'utiliser HTTPS
          redirectUrl = redirectUrl.replace('http://', 'https://');
          
          // Ajouter oauth_success s'il n'existe pas déjà
          if (!redirectUrl.includes('oauth_success=')) {
            redirectUrl += (redirectUrl.includes('?') ? '&' : '?') + "oauth_success=true";
          }
          
          // Ajouter tab=emails pour les pages lead si ce n'est pas déjà là
          if (redirectUrl.includes('/leads/') && !redirectUrl.includes('tab=emails')) {
            redirectUrl += (redirectUrl.includes('?') ? '&' : '?') + "tab=emails";
          }
          
          console.log("Final redirect URL:", redirectUrl);
          
          // Essayer différentes méthodes de redirection
          setTimeout(() => {
            try {
              forceNavigateTo(redirectUrl);
            } catch (e) {
              console.error("Error in primary redirect method:", e);
              forceOpenUrl(redirectUrl);
            }
          }, 100);
          
          // Méthode de secours en cas d'échec des autres méthodes
          setTimeout(() => {
            if (document.getElementById('manualRedirectMessage')) {
              document.getElementById('manualRedirectMessage').style.display = 'block';
            }
          }, 3000);
        } catch (e) {
          console.error("Redirect error:", e);
          // Fallback to basic redirect
          window.location.href = "${appUrl}";
        }
      }
      
      // Executer immédiatement
      executeRedirect();
      
      // Backup execution après un court délai
      setTimeout(executeRedirect, 500);
    </script>
  ` : '';

  // Manual redirection buttons with both options
  const manualRedirectButton = redirectUri ? `
    <div id="manualRedirectMessage" style="display:none; margin-top: 20px; text-align: center;">
      <p class="alert">La redirection automatique a échoué. Veuillez utiliser un des boutons ci-dessous:</p>
      <div class="button-container">
        <a href="${redirectUri}" class="redirect-button primary">
          Retourner à l'application
        </a>
        <a href="${redirectUri.replace(/https?:\/\/[^\/]+/, window.location.origin)}" class="redirect-button secondary">
          Redirection alternative
        </a>
      </div>
    </div>
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
        <meta http-equiv="refresh" content="0;url=${redirectUri}" />
        <style>
          body { 
            font-family: Arial, sans-serif; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            min-height: 100vh; 
            margin: 0; 
            background-color: #f9f9f9; 
            padding: 20px; 
          }
          .container { 
            text-align: center; 
            max-width: 600px; 
            padding: 2rem; 
            box-shadow: 0 4px 12px rgba(0,0,0,0.08); 
            border-radius: 8px; 
            background: white; 
          }
          .${className} { color: ${className === 'success' ? '#2ecc71' : '#e74c3c'}; }
          .details { 
            margin-top: 20px; 
            background: #f8f8f8; 
            padding: 15px; 
            border-radius: 5px; 
            text-align: left; 
          }
          code { 
            background: #eee; 
            padding: 2px 5px; 
            border-radius: 3px; 
            font-size: 0.9em; 
          }
          pre { 
            white-space: pre-wrap; 
            overflow-x: auto; 
            font-size: 12px; 
            background: #f0f0f0; 
            padding: 10px; 
            border-radius: 4px; 
          }
          .loader { 
            border: 4px solid #f3f3f3; 
            border-radius: 50%; 
            border-top: 4px solid ${className === 'success' ? '#2ecc71' : '#e74c3c'}; 
            width: 30px; 
            height: 30px; 
            animation: spin 1s linear infinite; 
            margin: 20px auto; 
          }
          @keyframes spin { 
            0% { transform: rotate(0deg); } 
            100% { transform: rotate(360deg); } 
          }
          .alert {
            color: #e74c3c;
            font-weight: bold;
            background: #ffeeee;
            padding: 10px;
            border-radius: 5px;
            margin: 15px 0;
          }
          .button-container {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin-top: 15px;
          }
          .redirect-button {
            display: inline-block;
            padding: 12px 20px;
            text-decoration: none;
            border-radius: 4px;
            font-weight: bold;
            font-size: 16px;
            transition: all 0.3s ease;
          }
          .primary {
            background: #2ecc71;
            color: white;
            border: 2px solid #27ae60;
          }
          .primary:hover {
            background: #27ae60;
          }
          .secondary {
            background: #3498db;
            color: white;
            border: 2px solid #2980b9;
          }
          .secondary:hover {
            background: #2980b9;
          }
          /* Add dark mode support */
          @media (prefers-color-scheme: dark) {
            body { background-color: #1a1a1a; color: #e0e0e0; }
            .container { background: #2a2a2a; box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
            .details { background: #333; }
            code { background: #444; color: #e0e0e0; }
            pre { background: #333; color: #e0e0e0; }
            .success { color: #4ecca3; }
            .error { color: #e57373; }
            .alert { background: #3a2222; color: #ff7b7b; }
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
            <p id="redirectCountdown" style="font-size: 0.9em; color: #888;">Redirection en cours...</p>
          ` : ''}
          ${manualRedirectButton}
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
        
        // Ensure the redirect URL is valid and properly formatted
        if (redirectUri) {
          // First decode any potentially double-encoded URL
          redirectUri = decodeURIComponent(redirectUri);
          
          // Ensure using https for all URLs
          if (!redirectUri.startsWith('https://')) {
            redirectUri = redirectUri.replace('http://', 'https://');
          }
          
          // Handle Lovable URLs specifically
          if (redirectUri.includes('lovableproject.com') || redirectUri.includes('lovable.app')) {
            console.log("Detected Lovable URL, ensuring proper formatting");
            
            // Add tab=emails parameter if missing on leads pages
            if (redirectUri.includes('/leads/') && !redirectUri.includes('tab=emails')) {
              redirectUri = redirectUri.includes('?') 
                ? `${redirectUri}&tab=emails` 
                : `${redirectUri}?tab=emails`;
            }
            
            // Fix any potential issues with encoded parameters
            redirectUri = redirectUri.replace('?tab%3Demails', '?tab=emails');
          }
        }
      } catch (e) {
        console.error('Error parsing state:', e);
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
        details: error_description,
        redirectUri: redirectUri, // Always redirect, even on error
        redirectDelay: 3000,
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
        redirectDelay: 3000,
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
          redirectDelay: 3000,
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
          redirectDelay: 3000,
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
          redirectDelay: 3000,
          status: 500
        });
      }
      
      const userInfo = await userInfoResponse.json();
      console.log("Retrieved user info:", userInfo.email);
      
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
          } else {
            console.log("Tokens stored successfully for user:", userId);
          }
        } catch (dbError) {
          console.error("Database error:", dbError);
        }
      } else {
        console.error("No userId provided, skipping token storage");
      }
      
      console.log("Authentication successful. Redirecting to:", redirectUri);
      
      // Generate a success response with redirection
      return renderHtmlResponse({
        title: "Succès",
        className: "success",
        heading: "Authentification réussie!",
        message: "Vous avez connecté votre compte Gmail avec succès.",
        email: userInfo.email,
        redirectUri: redirectUri,
        redirectDelay: 0 // Immediate redirection for better UX
      });
    } catch (error) {
      console.error('Error processing OAuth callback:', error);
      
      return renderHtmlResponse({
        title: "Erreur",
        className: "error",
        heading: "Erreur lors de l'authentification",
        message: `Une erreur s'est produite: ${(error as Error).message}`,
        redirectUri: redirectUri, // Always redirect, even on error
        redirectDelay: 3000,
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
      redirectDelay: 3000,
      status: 500
    });
  }
});
