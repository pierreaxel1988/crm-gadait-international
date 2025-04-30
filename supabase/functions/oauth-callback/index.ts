import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1";

// Remplacez ces valeurs par vos valeurs réelles
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const GOOGLE_CLIENT_ID = '87876889304-5ee6ln0j3hjoh9hq4h604rjebomac9ua.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET')!;
const REDIRECT_URI = Deno.env.get('OAUTH_REDIRECT_URI') || 'https://success.gadait-international.com/oauth/callback';

// Créer un client Supabase avec la clé admin
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

/**
 * Render a HTML response including auto-redirect script
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
  isCloudflareError?: boolean;
}) {
  const {
    title,
    className,
    heading,
    message,
    details,
    redirectUri,
    redirectDelay = 2, // Reduced delay for faster redirection
    email,
    status = 200,
    isCloudflareError = false
  } = options;

  const appUrl = redirectUri || 'https://gadait-international.com';
  
  // NOUVELLE APPROCHE: Redirection simplifiée et plus robuste
  const redirectScript = redirectUri ? `
    <script>
      console.log("Starting robust redirect to: ${redirectUri}");
      
      function performRedirect() {
        try {
          // Store success/error flag for frontend detection
          ${isCloudflareError 
            ? 'localStorage.setItem(\'oauth_cloudflare_error\', \'true\');'
            : className === 'success' 
              ? 'localStorage.setItem(\'oauth_success\', \'true\');'
              : 'localStorage.setItem(\'oauth_connection_error\', \'true\');'
          }
          
          // Clean up pending state
          localStorage.removeItem('oauth_pending');
          
          // Store email if available
          if ('${email}') {
            localStorage.setItem('oauth_email', '${email}');
          }
          
          // Ensure URL is properly formatted and free of extra encodings
          let redirectUrl = "${redirectUri}";
          try {
            redirectUrl = decodeURIComponent(redirectUrl);
            console.log("Decoded URL:", redirectUrl);
          } catch (e) {
            console.error("Error decoding URL:", e);
          }
          
          // Ensure HTTPS
          redirectUrl = redirectUrl.replace('http://', 'https://');
          
          // Add success parameter for improved detection
          if (!redirectUrl.includes('oauth_success=') && ${!isCloudflareError && className === 'success' ? 'true' : 'false'}) {
            redirectUrl += (redirectUrl.includes('?') ? '&' : '?') + "oauth_success=true";
          }
          
          // Add application timestamp to force reload
          redirectUrl += (redirectUrl.includes('?') ? '&' : '?') + "_t=" + Date.now();
          
          console.log("Final redirect URL:", redirectUrl);
          
          // IMPORTANT: Try multiple redirect methods
          window.location.href = redirectUrl;
          
          // Backup method with slight delay
          setTimeout(() => {
            window.location.replace(redirectUrl);
          }, 100);
          
          // Last resort method
          setTimeout(() => {
            document.location.href = redirectUrl;
          }, 300);
        } catch (e) {
          console.error("Error during redirect:", e);
          // Ultimate fallback
          try {
            window.location.href = "${appUrl}";
          } catch (err) {
            console.error("Even fallback redirect failed:", err);
          }
        }
      }
      
      // Execute redirect immediately
      performRedirect();
      
      // And also after DOMContentLoaded as a backup
      document.addEventListener('DOMContentLoaded', performRedirect);
      
      // Set a timeout as final backup
      setTimeout(performRedirect, ${redirectDelay * 1000});
    </script>
  ` : '';

  // Notification de post-message pour les clients web qui utilisent cette méthode
  const postMessageScript = redirectUri ? `
    <script>
      try {
        // Essayer d'envoyer un message à toutes les fenêtres parent potentielles
        if (window.opener) {
          console.log("Sending postMessage to opener");
          window.opener.postMessage({ 
            type: 'OAUTH_SUCCESS', 
            success: ${className === 'success'}, 
            email: '${email || ''}',
            redirectUrl: '${redirectUri}'
          }, '*');
        }
        
        window.parent.postMessage({ 
          type: 'OAUTH_SUCCESS', 
          success: ${className === 'success'}, 
          email: '${email || ''}',
          redirectUrl: '${redirectUri}'
        }, '*');
      } catch (e) {
        console.error("Error sending postMessage:", e);
      }
    </script>
  ` : '';

  // Manual redirection link as backup
  const manualRedirectButton = redirectUri ? `
    <div style="margin-top: 20px; text-align: center;">
      <p>Si vous n'êtes pas redirigé automatiquement dans quelques secondes:</p>
      <a href="${redirectUri}" id="manual-redirect" style="display: inline-block; background: #3498db; color: white; padding: 15px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px; margin-top: 10px;">
        Cliquez ici pour continuer
      </a>
      <script>
        // Auto-click the button after a short delay
        setTimeout(() => {
          try {
            document.getElementById('manual-redirect').click();
          } catch (e) {}
        }, 1500);
      </script>
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
        <meta http-equiv="refresh" content="1;url=${redirectUri}" />
        <style>
          body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background-color: #f9f9f9; padding: 20px; }
          .container { text-align: center; max-width: 600px; padding: 2rem; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border-radius: 8px; background: white; }
          .${className} { color: ${className === 'success' ? '#2ecc71' : '#e74c3c'}; }
          .details { margin-top: 20px; background: #f8f8f8; padding: 15px; border-radius: 5px; text-align: left; }
          code { background: #eee; padding: 2px 5px; border-radius: 3px; font-size: 0.9em; }
          pre { white-space: pre-wrap; overflow-x: auto; font-size: 12px; background: #f0f0f0; padding: 10px; border-radius: 4px; }
          .loader { border: 4px solid #f3f3f3; border-radius: 50%; border-top: 4px solid ${className === 'success' ? '#2ecc71' : '#e74c3c'}; width: 30px; height: 30px; animation: spin 1s linear infinite; margin: 20px auto; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          
          /* Add dark mode support */
          @media (prefers-color-scheme: dark) {
            body { background-color: #1a1a1a; color: #e0e0e0; }
            .container { background: #2a2a2a; box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
            .details { background: #333; }
            code { background: #444; color: #e0e0e0; }
            pre { background: #333; color: #e0e0e0; }
            .success { color: #4ecca3; }
            .error { color: #e57373; }
          }
        </style>
        ${redirectScript}
        ${postMessageScript}
      </head>
      <body>
        <div class="container">
          <h1 class="${className}">${heading}</h1>
          <p>${message}</p>
          ${emailInfo}
          ${redirectUri ? `
            <div class="loader"></div>
            <p>Redirection automatique vers l'application...</p>
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
    // Récupérer le code et l'état dans l'URL
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
    
    // Extraire le paramètre state pour obtenir l'URI de redirection, quel que soit l'erreur
    let redirectUri = 'https://gadait-international.com/leads';
    let userId = '';
    
    if (stateParam) {
      try {
        const stateObj = JSON.parse(decodeURIComponent(stateParam));
        redirectUri = stateObj.redirectUri || redirectUri;
        userId = stateObj.userId || '';
        
        console.log("Parsed state object:", { redirectUri, userId });
        
        // S'assurer que l'URL de redirection est valide et correctement formatée
        if (redirectUri) {
          // Décoder une première fois toute URL potentiellement doublement encodée
          redirectUri = decodeURIComponent(redirectUri);
          
          // S'assurer d'utiliser https pour toutes les URL
          if (!redirectUri.startsWith('https://')) {
            redirectUri = redirectUri.replace('http://', 'https://');
          }
          
          // Traitement spécifique pour les URL Lovable
          if (redirectUri.includes('lovableproject.com') || redirectUri.includes('lovable.app')) {
            console.log("URL Lovable détectée, application du formatage approprié");
            
            // Ajouter le paramètre tab=emails si manquant sur les pages leads
            if (redirectUri.includes('/leads/') && !redirectUri.includes('tab=emails')) {
              redirectUri = redirectUri.includes('?') 
                ? `${redirectUri}&tab=emails` 
                : `${redirectUri}?tab=emails`;
            }
            
            // Corriger tout problème potentiel avec les paramètres encodés
            redirectUri = redirectUri.replace('?tab%3Demails', '?tab=emails');
            
            // Ajouter le paramètre oauth_success pour améliorer la détection dans le frontend
            redirectUri = redirectUri.includes('?') 
              ? `${redirectUri}&oauth_success=true` 
              : `${redirectUri}?oauth_success=true`;
          }
        }
      } catch (e) {
        console.error('Erreur de parsing du state:', e);
      }
    }
    
    // Vérifier les erreurs Cloudflare dans le référent ou les en-têtes de réponse
    const cfCode = url.searchParams.get('cf_error_code');
    const cfStatusCode = url.searchParams.get('cf_status_code');
    const cfBrowserErrorReason = url.searchParams.get('cf_browser_error_reason');
    const cloudflareError = cfCode === '1101' || cfStatusCode === '524';
    
    if (cloudflareError || (error && error.includes('cloudflare'))) {
      console.error("Erreur Cloudflare détectée:", { cfCode, cfStatusCode, cfBrowserErrorReason });
      
      return renderHtmlResponse({
        title: "Erreur Cloudflare",
        className: "error",
        heading: "Erreur Cloudflare détectée",
        message: "Une erreur Cloudflare (1101) s'est produite lors de la tentative de connexion à Gmail. Cette erreur est souvent temporaire.",
        details: `CF Error Code: ${cfCode}, Status: ${cfStatusCode}, Reason: ${cfBrowserErrorReason || 'Unknown'}`,
        redirectUri: redirectUri,
        redirectDelay: 3,
        status: 503,
        isCloudflareError: true
      });
    }
    
    // Vérifier s'il y a un paramètre d'erreur de Google
    if (error) {
      console.error("Erreur OAuth de Google:", error);
      const error_description = url.searchParams.get('error_description') || '';
      
      return renderHtmlResponse({
        title: "Error",
        className: "error",
        heading: "Authentification échouée",
        message: `Erreur: ${error}`,
        details: error_description,
        redirectUri: redirectUri, // Toujours rediriger, même en cas d'erreur
        redirectDelay: 3,
        status: 400
      });
    }
    
    if (!code) {
      return renderHtmlResponse({
        title: "Error",
        className: "error",
        heading: "Authentification échouée",
        message: "Code d'autorisation manquant.",
        redirectUri: redirectUri, // Toujours rediriger, même en cas d'erreur
        redirectDelay: 3,
        status: 400
      });
    }
    
    // Si le code existe, procéder à l'échange de jetons
    try {
      // Échanger le code contre des jetons
      console.log("Échange du code contre des jetons...");
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
        console.error(`Erreur d'échange de code contre des jetons: ${tokenResponse.status}`, errorText);
        
        // Vérifier s'il s'agit d'une erreur Cloudflare
        if (errorText.includes('cloudflare') || tokenResponse.status === 524 || tokenResponse.status === 1101) {
          return renderHtmlResponse({
            title: "Erreur Cloudflare",
            className: "error",
            heading: "Erreur Cloudflare détectée",
            message: "Une erreur Cloudflare s'est produite lors de la tentative de connexion à Gmail. Cette erreur est souvent temporaire.",
            details: errorText,
            redirectUri: redirectUri,
            redirectDelay: 3,
            status: 503,
            isCloudflareError: true
          });
        }
        
        return renderHtmlResponse({
          title: "Erreur",
          className: "error",
          heading: "Échec d'authentification",
          message: `Erreur lors de l'échange du code contre des tokens: ${tokenResponse.status}`,
          details: errorText,
          redirectUri: redirectUri, // Toujours rediriger, même en cas d'erreur
          redirectDelay: 3,
          status: 500
        });
      }
      
      const tokenData = await tokenResponse.json();
      
      if (tokenData.error) {
        console.error(`Erreur dans la réponse du jeton: ${tokenData.error}`, tokenData);
        
        return renderHtmlResponse({
          title: "Erreur",
          className: "error",
          heading: "Échec d'authentification",
          message: `Erreur: ${tokenData.error}`,
          details: tokenData.error_description || JSON.stringify(tokenData),
          redirectUri: redirectUri, // Toujours rediriger, même en cas d'erreur
          redirectDelay: 3,
          status: 400
        });
      }
      
      // Obtenir les informations utilisateur pour déterminer l'adresse Gmail
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v1/userinfo', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      });
      
      if (!userInfoResponse.ok) {
        const errorText = await userInfoResponse.text();
        console.error(`Erreur lors de la récupération des informations utilisateur: ${userInfoResponse.status}`, errorText);
        
        return renderHtmlResponse({
          title: "Erreur",
          className: "error",
          heading: "Échec d'authentification",
          message: "Impossible de récupérer les informations de l'utilisateur.",
          details: errorText,
          redirectUri: redirectUri, // Toujours rediriger, même en cas d'erreur
          redirectDelay: 3,
          status: 500
        });
      }
      
      const userInfo = await userInfoResponse.json();
      console.log("Informations utilisateur récupérées:", userInfo.email);
      
      // Stocker les jetons dans la base de données
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
            console.error(`Erreur lors du stockage des jetons: ${storeError.message}`, storeError);
          } else {
            console.log("Jetons stockés avec succès pour l'utilisateur:", userId);
          }
        } catch (dbError) {
          console.error("Erreur de base de données:", dbError);
        }
      } else {
        console.error("Aucun userId fourni, stockage de jeton ignoré");
      }
      
      console.log("Authentification réussie. Redirection vers:", redirectUri);
      
      // Générer une réponse de succès avec redirection directe
      return renderHtmlResponse({
        title: "Succès",
        className: "success",
        heading: "Authentification réussie!",
        message: "Vous avez connecté votre compte Gmail avec succès. Vous allez être redirigé vers l'application...",
        email: userInfo.email,
        redirectUri: redirectUri,
        redirectDelay: 1 // Redirection très rapide pour une meilleure expérience utilisateur
      });
    } catch (error) {
      console.error('Erreur lors du traitement du callback OAuth:', error);
      
      // Vérifier s'il s'agit d'une erreur Cloudflare dans la stack trace
      if ((error as Error).message.includes('cloudflare') || 
          (error as Error).stack?.includes('cloudflare')) {
        return renderHtmlResponse({
          title: "Erreur Cloudflare",
          className: "error",
          heading: "Erreur Cloudflare détectée",
          message: "Une erreur Cloudflare s'est produite lors de la tentative de connexion à Gmail. Cette erreur est souvent temporaire.",
          redirectUri: redirectUri,
          redirectDelay: 3,
          status: 503,
          isCloudflareError: true
        });
      }
      
      return renderHtmlResponse({
        title: "Erreur",
        className: "error",
        heading: "Erreur lors de l'authentification",
        message: `Une erreur s'est produite: ${(error as Error).message}`,
        redirectUri: redirectUri, // Toujours rediriger, même en cas d'erreur
        redirectDelay: 3,
        status: 500
      });
    }
  } catch (error) {
    console.error('Erreur inattendue dans oauth-callback:', error);
    // En cas d'erreur catastrophique, essayer tout de même de rediriger l'utilisateur vers l'application
    const redirectUri = 'https://gadait-international.com/leads';
    
    return renderHtmlResponse({
      title: "Erreur inattendue",
      className: "error",
      heading: "Erreur inattendue",
      message: `Une erreur inattendue s'est produite: ${(error as Error).message}`,
      redirectUri: redirectUri, // Toujours rediriger, même en cas d'erreur
      redirectDelay: 3,
      status: 500
    });
  }
});
