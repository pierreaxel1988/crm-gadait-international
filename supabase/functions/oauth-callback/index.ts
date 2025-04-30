
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Create a Supabase client with the admin key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');
  const errorDescription = url.searchParams.get('error_description');

  console.log("OAuth callback received:", { 
    hasCode: !!code, 
    hasState: !!state, 
    error, 
    errorDescription,
    requestHeaders: Object.fromEntries(req.headers.entries())
  });

  let redirectUrl = '/';
  let parsed;
  let userEmail = '';
  let success = false;
  
  // Parse state to get redirect URL
  if (state) {
    try {
      parsed = JSON.parse(state);
      redirectUrl = parsed.redirectUri || '/';
      console.log("Parsed state object:", parsed);
    } catch (e) {
      console.error("Error parsing state:", e);
    }
  }

  // If there's an error or no code, redirect with error parameters
  if (error || !code) {
    console.error("OAuth error:", error, errorDescription);
    const errorRedirectUrl = new URL(redirectUrl);
    errorRedirectUrl.searchParams.set('oauth_error', error || 'unknown_error');
    if (errorDescription) {
      errorRedirectUrl.searchParams.set('error_description', errorDescription);
    }
    errorRedirectUrl.searchParams.set('oauth_connection_error', 'true');
    
    // Store error in localStorage through script
    redirectUrl = errorRedirectUrl.toString();
    
    // Generate HTML with script that will save the error to localStorage before redirect
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>OAuth Callback - Error</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
      </head>
      <body style="font-family: system-ui, sans-serif; text-align: center; padding: 2rem;">
        <h1 style="color: #e11d48;">Erreur d'authentification</h1>
        <p>Une erreur s'est produite lors de l'authentification. Redirection en cours...</p>
        <script>
          // Store error indicator in localStorage
          localStorage.setItem('oauth_connection_error', 'true');
          localStorage.removeItem('oauth_pending');
          localStorage.removeItem('oauth_success');
          localStorage.removeItem('oauth_cloudflare_error');
          
          // Try multiple redirection methods for reliability
          try {
            window.location.replace("${redirectUrl}");
          } catch (e) {
            console.error("Error redirecting:", e);
            setTimeout(() => {
              window.location.href = "${redirectUrl}";
            }, 500);
          }
          
          // Fallback if redirect fails
          setTimeout(() => {
            window.location.href = "${redirectUrl}";
          }, 1500);
        </script>
        <meta http-equiv="refresh" content="2;url=${redirectUrl}" />
      </body>
      </html>
    `;
    
    return new Response(html, {
      headers: { 'Content-Type': 'text/html' },
    });
  }

  try {
    // Exchange the code for tokens
    const exchangeResponse = await fetch('https://oauth-callback.supabase.co/exchange', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        state,
        action: 'exchange',
      }),
    });
    
    if (!exchangeResponse.ok) {
      throw new Error(`Exchange failed: ${exchangeResponse.status} ${await exchangeResponse.text()}`);
    }
    
    const exchangeData = await exchangeResponse.json();
    console.log("Exchange successful:", { success: exchangeData.success });
    
    success = exchangeData.success;
    if (exchangeData.email) {
      userEmail = exchangeData.email;
    }
    
    // Use specified redirect URI from exchange response if available
    if (exchangeData.redirectUri) {
      redirectUrl = exchangeData.redirectUri;
      console.log("Using redirectUri from exchange response:", redirectUrl);
    }
  } catch (error) {
    console.error("Error during token exchange:", error);
    success = false;
    
    // Check if it's a Cloudflare error
    if (error.toString().includes('cloudflare') || error.toString().includes('524') || error.toString().includes('1101')) {
      // Set Cloudflare error flag in localStorage
      const cloudflareErrorUrl = new URL(redirectUrl);
      cloudflareErrorUrl.searchParams.set('oauth_cloudflare_error', 'true');
      redirectUrl = cloudflareErrorUrl.toString();
      
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>OAuth Callback - Cloudflare Error</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="font-family: system-ui, sans-serif; text-align: center; padding: 2rem;">
          <h1 style="color: #e11d48;">Erreur Cloudflare</h1>
          <p>Une erreur Cloudflare s'est produite. Redirection en cours...</p>
          <script>
            localStorage.setItem('oauth_cloudflare_error', 'true');
            localStorage.removeItem('oauth_pending');
            localStorage.removeItem('oauth_success');
            localStorage.removeItem('oauth_connection_error');
            
            // Try multiple redirection methods for reliability
            try {
              window.location.replace("${redirectUrl}");
            } catch (e) {
              console.error("Error redirecting:", e);
              setTimeout(() => {
                window.location.href = "${redirectUrl}";
              }, 500);
            }
            
            // Fallback if redirect fails
            setTimeout(() => {
              window.location.href = "${redirectUrl}";
            }, 1500);
          </script>
          <meta http-equiv="refresh" content="2;url=${redirectUrl}" />
        </body>
        </html>
      `;
      
      return new Response(html, {
        headers: { 'Content-Type': 'text/html' },
      });
    }
  }
  
  // Add success parameter to URL to indicate successful authentication
  const finalRedirectUrl = new URL(redirectUrl);
  if (success) {
    finalRedirectUrl.searchParams.set('oauth_success', 'true');
  }
  redirectUrl = finalRedirectUrl.toString();

  // Generate HTML with multiple redirect methods for reliability
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Gmail Authentication Successful</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <meta http-equiv="refresh" content="3;url=${redirectUrl}" />
      <style>
        body {
          font-family: system-ui, sans-serif;
          text-align: center;
          padding: 2rem;
          background-color: #f7f7f7;
        }
        .container {
          max-width: 500px;
          margin: 0 auto;
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        h1 {
          color: #10b981;
        }
        .loading {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 2px solid rgba(0,0,0,0.1);
          border-radius: 50%;
          border-top-color: #10b981;
          animation: spin 1s ease-in-out infinite;
          margin-right: 8px;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>${success ? 'Authentification Gmail Réussie!' : 'Redirection en cours...'}</h1>
        <p>
          <span class="loading"></span>
          Redirection automatique vers l'application...
        </p>
      </div>

      <script>
        // Method 1: Store success in localStorage
        if (${success}) {
          localStorage.setItem('oauth_success', 'true');
          ${userEmail ? `localStorage.setItem('oauth_email', '${userEmail}');` : ''}
        } else {
          localStorage.removeItem('oauth_success');
        }
        localStorage.removeItem('oauth_pending');
        localStorage.removeItem('oauth_cloudflare_error');
        localStorage.removeItem('oauth_connection_error');
        
        // Method 2: Try to use postMessage to parent window
        try {
          if (window.opener && !window.opener.closed) {
            window.opener.postMessage({
              type: 'OAUTH_SUCCESS',
              success: ${success},
              timestamp: Date.now(),
              ${userEmail ? `email: '${userEmail}',` : ''}
            }, "*");
            console.log("Sent postMessage to opener");
            
            // Close this window after sending the message
            setTimeout(() => {
              window.close();
            }, 500);
          }
        } catch (e) {
          console.error("Error sending postMessage:", e);
        }
        
        // Method 3: Redirect with URL parameters if window still open
        // Use multiple methods for redirection to ensure it works
        const redirectUrl = "${redirectUrl}";
        
        // Method 3a: Location replace
        try {
          window.location.replace(redirectUrl);
        } catch(e) {
          console.error("Error during location.replace:", e);
        }
        
        // Method 3b: Location href with delay as fallback
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 500);
        
        // Method 3c: Meta refresh as final fallback - already added to head
        
        // Method 3d: Form submission as another fallback
        const form = document.createElement('form');
        form.style.display = 'none';
        form.method = 'GET';
        form.action = redirectUrl.split('?')[0];
        
        if (redirectUrl.includes('?')) {
          const params = new URLSearchParams(redirectUrl.split('?')[1]);
          params.forEach((value, key) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = value;
            form.appendChild(input);
          });
        }
        
        document.body.appendChild(form);
        setTimeout(() => {
          try {
            form.submit();
          } catch (e) {
            console.error("Error submitting form:", e);
          }
        }, 1000);
      </script>
    </body>
    </html>
  `;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html' },
  });
});
