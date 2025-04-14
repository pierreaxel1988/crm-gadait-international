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
    redirectDelay = 100, // Reduced delay for better UX
    email,
    status = 200
  } = options;

  const redirectScript = redirectUri ? `
    <script>
      // Store the URL we need to go back to
      try {
        localStorage.setItem('oauthRedirectTarget', '${redirectUri}');
        
        // Log success message to help debugging
        console.log("Redirect URI saved in localStorage:", '${redirectUri}');
        
        // Set a timeout to redirect
        setTimeout(function() {
          console.log("Redirecting to:", '${redirectUri}');
          // Add oauth_success parameter to the redirect URI to trigger state update
          const redirectUrl = "${redirectUri}" + (new URL("${redirectUri}").search ? "&" : "?") + "oauth_success=true";
          window.location.replace(redirectUrl);
        }, ${redirectDelay});
      } catch (e) {
        console.error("Error in redirect script:", e);
      }
    </script>
  ` : '';

  const detailsSection = details ? `
    <div class="details">
      <h3>Informations techniques:</h3>
      ${details}
    </div>
  ` : '';

  const emailInfo = email ? `<p>Vous avez connecté votre compte Gmail: <strong>${email}</strong></p>` : '';

  return new Response(
    `<html>
      <head>
        <title>${title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f9f9f9; }
          .container { text-align: center; max-width: 600px; padding: 2rem; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border-radius: 8px; background: white; }
          .${className} { color: ${className === 'success' ? '#2ecc71' : '#e74c3c'}; }
          .details { margin-top: 20px; background: #f8f8f8; padding: 15px; border-radius: 5px; text-align: left; }
          code { background: #eee; padding: 2px 5px; border-radius: 3px; font-size: 0.9em; }
          pre { white-space: pre-wrap; overflow-x: auto; }
          .loader { border: 4px solid #f3f3f3; border-radius: 50%; border-top: 4px solid ${className === 'success' ? '#2ecc71' : '#e74c3c'}; width: 30px; height: 30px; animation: spin 1s linear infinite; margin: 20px auto; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
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
            <p>Redirection vers l'application...</p>
            <p><a href="${redirectUri}">Cliquez ici si vous n'êtes pas redirigé</a></p>
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

/**
 * Parse and validate the state parameter
 */
function parseState(stateParam: string | null): {
  valid: boolean;
  stateObj?: any;
  redirectUri?: string;
  userId?: string;
  error?: string;
} {
  if (!stateParam) {
    return { valid: false, error: 'Paramètre state manquant' };
  }
  
  try {
    const stateObj = JSON.parse(decodeURIComponent(stateParam));
    const redirectUri = stateObj.redirectUri || 'https://success.gadait-international.com/leads';
    const userId = stateObj.userId || '';
    
    console.log("Parsed state object:", { redirectUri, userId, fullStateObj: stateObj });
    
    return { valid: true, stateObj, redirectUri, userId };
  } catch (e) {
    console.error('Error parsing state:', e);
    return { 
      valid: false, 
      error: `Impossible de traiter le paramètre state: ${(e as Error).message}`,
      stateObj: null
    };
  }
}

/**
 * Exchange authorization code for tokens
 */
async function exchangeCodeForTokens(code: string) {
  console.log("Exchanging code for tokens with params:", {
    code: code.substring(0, 10) + '...',
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET.substring(0, 5) + '...',
    redirect_uri: REDIRECT_URI
  });
  
  try {
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
    
    const responseStatus = tokenResponse.status;
    const responseStatusText = tokenResponse.statusText;
    
    // Try to parse the response as JSON
    try {
      const tokenData = await tokenResponse.json();
      
      console.log("Token response received", { 
        hasError: !!tokenData.error,
        error: tokenData.error || null,
        error_description: tokenData.error_description || null,
        hasAccessToken: !!tokenData.access_token,
        hasRefreshToken: !!tokenData.refresh_token,
        expiresIn: tokenData.expires_in,
        status: tokenResponse.status,
        statusText: tokenResponse.statusText
      });
      
      return { success: true, tokenData, responseStatus, responseStatusText };
    } catch (parseError) {
      // If parsing fails, get the raw text
      const responseText = await tokenResponse.text();
      console.error("Failed to parse token response as JSON:", parseError);
      console.log("Raw response:", responseText);
      
      return { 
        success: false, 
        error: parseError, 
        responseText, 
        responseStatus, 
        responseStatusText 
      };
    }
  } catch (fetchError) {
    console.error("Network error during token exchange:", fetchError);
    return {
      success: false,
      error: fetchError,
      responseStatus: 0,
      responseStatusText: "Network Error"
    };
  }
}

/**
 * Get user information using access token
 */
async function getUserInfo(accessToken: string) {
  try {
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v1/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    if (!userInfoResponse.ok) {
      console.error("Error fetching user info:", await userInfoResponse.text());
      throw new Error(`Failed to fetch user info: ${userInfoResponse.status}`);
    }
    
    return await userInfoResponse.json();
  } catch (error) {
    console.error("Error in getUserInfo:", error);
    throw error;
  }
}

/**
 * Get user ID from state or lookup by email
 */
async function getUserId(userId: string, email: string) {
  if (userId) {
    return userId;
  }
  
  console.log("No userId in state, looking up by email");
  try {
    // Look up the user by email
    const { data: teamMember, error } = await supabase
      .from('team_members')
      .select('id')
      .eq('email', email)
      .maybeSingle();
    
    if (error) {
      console.error("Error looking up user by email:", error);
      throw error;
    }
    
    const foundUserId = teamMember?.id || '';
    console.log("Found user ID:", foundUserId);
    return foundUserId;
  } catch (error) {
    console.error("Error in getUserId:", error);
    throw error;
  }
}

/**
 * Store OAuth tokens in the database
 */
async function storeTokens(userId: string, email: string, tokenData: any) {
  try {
    const { error: storeError } = await supabase
      .from('user_email_connections')
      .upsert({
        user_id: userId,
        email: email,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || '', // Store blank if not returned (happens for re-auth)
        token_expiry: new Date(Date.now() + (tokenData.expires_in || 3600) * 1000).toISOString(),
      });
    
    console.log("Storing tokens in database", { error: storeError?.message, userId });
    return { success: !storeError, error: storeError };
  } catch (error) {
    console.error("Error in storeTokens:", error);
    return { success: false, error };
  }
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
      url: req.url,
      requestHeaders: Object.fromEntries(req.headers.entries()),
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
      
      return renderHtmlResponse({
        title: "Error",
        className: "error",
        heading: "Authentification échouée",
        message: `Erreur: ${error}`,
        details: `
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
        `,
        status: 400
      });
    }
    
    if (!code) {
      return renderHtmlResponse({
        title: "Error",
        className: "error",
        heading: "Authentification échouée",
        message: "Code d'autorisation manquant.",
        status: 400
      });
    }
    
    // Parse the state parameter
    let redirectUri = '';
    let userId = '';
    let stateObj = null;
    
    if (stateParam) {
      try {
        stateObj = JSON.parse(decodeURIComponent(stateParam));
        redirectUri = stateObj.redirectUri || 'https://success.gadait-international.com/leads';
        userId = stateObj.userId || '';
        
        console.log("Parsed state object:", { redirectUri, userId, fullStateObj: stateObj });
      } catch (e) {
        console.error('Error parsing state:', e);
      }
    }
    
    // If code exists, proceed with token exchange
    if (code) {
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
        console.log("Retrieved user info:", userInfo.email);
        
        // Store the tokens in the database
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
          throw new Error(`Error storing tokens: ${storeError.message}`);
        }
        
        console.log("Tokens stored successfully. Redirecting to:", redirectUri);
        
        // Add tab=emails to the redirect URI if it's not already there and it's a lead page
        if (redirectUri.includes('/leads/') && !redirectUri.includes('tab=emails')) {
          redirectUri = redirectUri.includes('?') 
            ? `${redirectUri}&tab=emails` 
            : `${redirectUri}?tab=emails`;
        }
        
        // Add oauth_success to the redirect URI
        if (redirectUri.includes('/leads/')) {
          redirectUri = redirectUri.includes('?') 
            ? `${redirectUri}&tab=emails&oauth_success=true` 
            : `${redirectUri}?tab=emails&oauth_success=true`;
        }
        
        return renderHtmlResponse({
          title: "Succès",
          className: "success",
          heading: "Authentification réussie!",
          message: "Vous avez connecté votre compte Gmail avec succès.",
          email: userInfo.email,
          redirectUri: redirectUri,
          redirectDelay: 100
        });
      } catch (error) {
        console.error('Error processing OAuth callback:', error);
        return renderHtmlResponse({
          title: "Erreur",
          className: "error",
          heading: "Erreur lors de l'authentification",
          message: `Une erreur s'est produite: ${(error as Error).message}`,
          redirectUri: redirectUri,
          redirectDelay: 3000,
          status: 500
        });
      }
    } else if (error) {
      // Handle OAuth error
      return renderHtmlResponse({
        title: "Erreur",
        className: "error",
        heading: "Authentification échouée",
        message: `Erreur: ${error}`,
        redirectUri: redirectUri,
        redirectDelay: 3000,
        status: 400
      });
    } else {
      // No code or error provided
      return renderHtmlResponse({
        title: "Erreur",
        className: "error",
        heading: "Requête invalide",
        message: "Paramètres d'authentification manquants.",
        redirectUri: redirectUri,
        redirectDelay: 3000,
        status: 400
      });
    }
  } catch (error) {
    console.error('Unexpected error in oauth-callback:', error);
    return renderHtmlResponse({
      title: "Erreur",
      className: "error",
      heading: "Erreur inattendue",
      message: `Une erreur inattendue s'est produite: ${(error as Error).message}`,
      redirectUri: 'https://success.gadait-international.com/leads',
      redirectDelay: 3000,
      status: 500
    });
  }
});
