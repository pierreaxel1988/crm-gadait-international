import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useLocation, useNavigate } from 'react-router-dom';

interface EmailConnection {
  email: string;
  id: string;
}

export const useGmailConnection = (leadId: string) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [connectedEmail, setConnectedEmail] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [connectionAttemptCount, setConnectionAttemptCount] = useState(0);
  const [detailedErrorInfo, setDetailedErrorInfo] = useState<any>(null);
  const [googleAuthURL, setGoogleAuthURL] = useState<string | null>(null);
  const [checkingConnection, setCheckingConnection] = useState(true);
  const [windowObjectReady, setWindowObjectReady] = useState(false);
  const [cloudflareErrorDetected, setCloudflareErrorDetected] = useState(false);
  const [lastTokenRefreshTime, setLastTokenRefreshTime] = useState<number>(0);
  const [forceReconnect, setForceReconnect] = useState(false);
  const [handledOAuthSuccess, setHandledOAuthSuccess] = useState(false);
  
  // Ensure window is defined (important to prevent SSR errors)
  useEffect(() => {
    setWindowObjectReady(typeof window !== 'undefined');
    
    // Listen for messages from the OAuth callback window
    const handleMessage = (event: MessageEvent) => {
      console.log("Received postMessage:", event.data);
      
      // Check that the message is of the correct type
      if (event.data && event.data.type === 'OAUTH_SUCCESS') {
        console.log("Received OAUTH_SUCCESS postMessage:", event.data);
        
        if (event.data.success) {
          // Mark authentication as successful
          localStorage.setItem('oauth_success', 'true');
          if (event.data.email) {
            localStorage.setItem('oauth_email', event.data.email);
          }
          
          // Force connection check
          setConnectionAttemptCount(prev => prev + 1);
          setForceReconnect(true);
          setHandledOAuthSuccess(true);
          
          // Show confirmation toast
          toast({
            title: "Connexion réussie",
            description: event.data.email 
              ? `Compte Gmail connecté: ${event.data.email}` 
              : "Connexion à Gmail réussie."
          });
          
          // Force reload
          forceAuthCheck();
        }
      }
    };
    
    if (windowObjectReady) {
      window.addEventListener('message', handleMessage);
      
      // Also listen for storage events (for cross-tab communication)
      window.addEventListener('storage', (event) => {
        if (event.key === 'oauth_success' && event.newValue === 'true') {
          console.log('OAuth success detected from storage event');
          setConnectionAttemptCount(prev => prev + 1);
          setForceReconnect(true);
          forceAuthCheck();
        }
      });
    }
    
    // Clean up event listener on unmount
    return () => {
      if (windowObjectReady) {
        window.removeEventListener('message', handleMessage);
      }
    };
  }, [windowObjectReady]);

  // Immediate auto-refresh if we detect OAuth success indicators
  useEffect(() => {
    if (!windowObjectReady || handledOAuthSuccess) return;
    
    const checkForOAuthSuccess = () => {
      // Multiple detection methods
      const searchParams = new URLSearchParams(location.search);
      const hasOAuthParam = searchParams.has('oauth_success') || searchParams.get('oauth_success') === 'true';
      const hasOAuthStorage = localStorage.getItem('oauth_success') === 'true';
      const hasOAuthPending = localStorage.getItem('oauth_pending') === 'true';
      const hasRedirectTarget = localStorage.getItem('oauthRedirectTarget');
      
      // URL contains state parameter (indicates we came from OAuth callback)
      const hasStateParam = searchParams.has('state');
      
      // Check referrer
      const referrer = document.referrer;
      const isFromCallback = referrer && (referrer.includes('oauth/callback') || 
                                        referrer.includes('accounts.google.com'));
      
      if (hasOAuthParam || hasOAuthStorage || (isFromCallback && hasOAuthPending)) {
        console.log("OAuth success indicators detected:", {
          fromURL: hasOAuthParam,
          fromStorage: hasOAuthStorage,
          fromReferrer: isFromCallback,
          hasPending: hasOAuthPending
        });
        
        // Clean up localStorage indicators
        localStorage.removeItem('oauth_success');
        localStorage.removeItem('oauth_pending');
        
        // Mark as handled to prevent multiple reloads
        setHandledOAuthSuccess(true);
        
        // Force connection check
        setForceReconnect(true);
        setConnectionAttemptCount(prev => prev + 1);
        
        // Load email from storage if available
        const storedEmail = localStorage.getItem('oauth_email');
        if (storedEmail) {
          localStorage.removeItem('oauth_email');
          setConnectedEmail(storedEmail);
          setIsConnected(true);
        }
        
        toast({
          title: "Connexion détectée",
          description: "Finalisation de la connexion Gmail..."
        });
        
        // For URL params, clean up the URL
        if (hasOAuthParam) {
          const cleanParams = new URLSearchParams(location.search);
          cleanParams.delete('oauth_success');
          
          // Keep the tab=emails parameter
          if (location.search.includes('tab=emails')) {
            cleanParams.set('tab', 'emails');
          }
          
          const newSearch = cleanParams.toString();
          const newUrl = `${location.pathname}${newSearch ? `?${newSearch}` : ''}`;
          navigate(newUrl, { replace: true });
        }
        
        // Force auth check
        forceAuthCheck();
        
        return true;
      }
      
      // Check for Cloudflare error
      const cloudflareError = localStorage.getItem('oauth_cloudflare_error') === 'true';
      if (cloudflareError && !cloudflareErrorDetected) {
        console.log('Cloudflare error detected in localStorage');
        localStorage.removeItem('oauth_cloudflare_error');
        setCloudflareErrorDetected(true);
        setConnectionError("Une erreur Cloudflare (1101) s'est produite lors de la tentative de connexion à Gmail. Cette erreur est souvent temporaire.");
        
        toast({
          variant: "destructive",
          title: "Erreur de connexion",
          description: "Une erreur Cloudflare (1101) s'est produite. Veuillez réessayer dans quelques instants."
        });
      }
      
      return false;
    };
    
    // Check immediately and also set up a periodic check
    const detected = checkForOAuthSuccess();
    
    if (!detected) {
      // Schedule periodic checks for a short period (helpful when redirected)
      const checkInterval = setInterval(() => {
        if (checkForOAuthSuccess() || handledOAuthSuccess) {
          clearInterval(checkInterval);
        }
      }, 1000);
      
      // Stop checking after a reasonable amount of time
      setTimeout(() => clearInterval(checkInterval), 10000);
      
      return () => clearInterval(checkInterval);
    }
  }, [location.search, navigate, windowObjectReady, handledOAuthSuccess, cloudflareErrorDetected]);

  // Check Gmail connection status
  const checkEmailConnection = useCallback(async (force = false) => {
    if (!user) {
      console.log("No user logged in, unable to check Gmail connection");
      setIsLoading(false);
      setCheckingConnection(false);
      return;
    }
    
    try {
      setCheckingConnection(true);
      
      if (!isConnected) {
        setIsLoading(true);
      }
      
      setConnectionError(null);
      setDetailedErrorInfo(null);
      
      console.log("Checking Gmail connection for user:", user.id);
      
      // Check if the user already has a Gmail connection
      const { data, error } = await supabase
        .from('user_email_connections')
        .select('email, id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error checking connection:', error);
        setIsConnected(false);
        setConnectionError(`Error checking connection: ${error.message}`);
        return;
      }
      
      if (data) {
        console.log("Gmail connection found:", data.email);
        setIsConnected(true);
        setConnectedEmail((data as EmailConnection).email);
        setForceReconnect(false);
        
        // Check if we have an authentication success to update the UI
        if (windowObjectReady) {
          const oauthSuccess = localStorage.getItem('oauth_success') === 'true';
          const oauthEmail = localStorage.getItem('oauth_email');
          
          if (oauthSuccess) {
            localStorage.removeItem('oauth_success');
            
            if (oauthEmail) {
              localStorage.removeItem('oauth_email');
              setConnectedEmail(oauthEmail);
            }
            
            // Show confirmation toast for successful connection
            toast({
              title: "Connexion réussie",
              description: oauthEmail 
                ? `Compte Gmail connecté: ${oauthEmail}` 
                : "Connexion à Gmail réussie."
            });
          }
        }
        
        // Clean up any error or pending indicators
        if (windowObjectReady) {
          localStorage.removeItem('oauth_pending');
          localStorage.removeItem('oauth_connection_error');
          localStorage.removeItem('oauth_cloudflare_error');
        }
      } else {
        console.log("No Gmail connection found");
        setIsConnected(false);
        
        // Check again if authentication has succeeded
        if (windowObjectReady) {
          const isAuthenticated = localStorage.getItem('oauth_success') === 'true';
          if (isAuthenticated) {
            setConnectionAttemptCount(prev => prev + 1);
            setForceReconnect(true);
          }
        }
      }
    } catch (error) {
      console.error('Error in checkEmailConnection:', error);
      setConnectionError(`An error occurred: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
      setCheckingConnection(false);
      setForceReconnect(false);
    }
  }, [user, isConnected, windowObjectReady]);
  
  // Check connection on initial load and when necessary
  useEffect(() => {
    if (!windowObjectReady) return;
    
    // Avoid too frequent requests
    const now = Date.now();
    if (now - lastTokenRefreshTime < 1000 && lastTokenRefreshTime > 0 && !forceReconnect) {
      return;
    }
    setLastTokenRefreshTime(now);

    checkEmailConnection();
  }, [user, leadId, connectionAttemptCount, windowObjectReady, lastTokenRefreshTime, forceReconnect, checkEmailConnection]);

  // Function to manually force an auth check
  const forceAuthCheck = async () => {
    try {
      console.log("Forcing authentication check...");
      setCheckingConnection(true);
      
      // Clear previous connection status
      setIsConnected(false);
      setConnectionError(null);
      setDetailedErrorInfo(null);
      
      // Check for authenticated user first
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error("Utilisateur non connecté");
      }
      
      // Get the current user ID from the session
      const userId = session.user.id;
      
      // Query to check for existing email connections
      const { data: connections, error: connectionsError } = await supabase
        .from("user_email_connections")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      
      if (connectionsError) {
        console.error("Error checking for email connections:", connectionsError);
        throw new Error("Erreur lors de la vérification des connexions email");
      }
      
      if (connections) {
        console.log("Found existing Gmail connection");
        setIsConnected(true);
        setConnectedEmail(connections.email);
        return true;
      } else {
        console.log("No Gmail connection found");
        setIsConnected(false);
        return false;
      }
    } catch (error) {
      console.error("Error during forced auth check:", error);
      setConnectionError("Erreur lors de la vérification de l'authentification");
      setDetailedErrorInfo(error.toString());
      return false;
    } finally {
      setCheckingConnection(false);
    }
  };

  // Function to start Gmail connection with enhanced error handling
  const connectGmail = useCallback(async () => {
    if (isConnecting || !windowObjectReady) return;
    
    try {
      setIsConnecting(true);
      setConnectionError(null);
      setDetailedErrorInfo(null);
      setGoogleAuthURL(null);
      setCloudflareErrorDetected(false);
      setHandledOAuthSuccess(false);
      
      console.log('Starting Gmail connection process for lead:', leadId);
      
      if (!user) {
        console.error("Error: No user logged in");
        toast({
          variant: "destructive",
          title: "Error",
          description: "You must be logged in to use this feature."
        });
        return;
      }
      
      // Build redirect URI with timestamp to prevent caching issues
      const currentPath = window.location.pathname;
      const baseUrl = window.location.origin;
      const redirectUri = `${baseUrl}${currentPath}?tab=emails&t=${Date.now()}`;
      
      console.log('Using redirect URI:', redirectUri);
      console.log('User ID:', user.id);
      
      try {
        // Clean any previous error/success state
        localStorage.removeItem('oauth_connection_error');
        localStorage.removeItem('oauth_pending');
        localStorage.removeItem('oauth_success');
        localStorage.removeItem('oauth_cloudflare_error');
        
        // Add marker to detect if we're waiting for authentication
        localStorage.setItem('oauth_pending', 'true');
        
        // Call Supabase Edge function to get auth URL
        const { data, error } = await supabase.functions.invoke('gmail-auth', {
          body: {
            action: 'authorize',
            userId: user.id,
            redirectUri: redirectUri
          }
        });
        
        if (error) {
          console.error('Error starting Gmail authentication:', error);
          setConnectionError(`Error starting authentication: ${error.message}`);
          setDetailedErrorInfo({
            error: error,
            context: "Invoking gmail-auth function"
          });
          
          toast({
            variant: "destructive",
            title: "Error",
            description: "Unable to start Gmail authentication."
          });
          return;
        }
        
        if (!data || !data.authorizationUrl) {
          const errorMsg = "Server response does not contain authorization URL.";
          console.error(errorMsg, data);
          setConnectionError(errorMsg);
          setDetailedErrorInfo({
            error: errorMsg,
            data: data
          });
          return;
        }
        
        // Store redirect target in localStorage
        localStorage.setItem('oauthRedirectTarget', redirectUri);
        
        console.log('Authorization URL generated:', data.authorizationUrl);
        setGoogleAuthURL(data.authorizationUrl);
        
        // Open new window for authentication with optimized popup options
        const newWindow = window.open(
          data.authorizationUrl, 
          '_blank',
          'width=600,height=700,toolbar=0,menubar=0,location=0,status=1,scrollbars=1,resizable=1,left=50,top=50'
        );
        
        // Check if window opened successfully
        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
          console.error('Popup blocked or not opened');
          toast({
            variant: "destructive",
            title: "Popup blocked",
            description: "Please allow popups for this site and try again."
          });
          
          setConnectionError("Could not open authentication window. Popups might be blocked.");
          setDetailedErrorInfo({
            error: "Popup blocked",
            helpMessage: "Please allow popups for this site in your browser settings and try again."
          });
        } else {
          // Set up progressive checks to see if authentication succeeded
          const checkTimes = [1000, 3000, 5000, 8000, 12000];
          checkTimes.forEach(time => {
            setTimeout(() => {
              if (!isConnected) {
                setConnectionAttemptCount(prev => prev + 1);
              }
            }, time);
          });
          
          // Watch for popup closure
          const checkPopupClosed = setInterval(() => {
            if (newWindow.closed) {
              clearInterval(checkPopupClosed);
              console.log("Popup closed, checking authentication status");
              setTimeout(() => {
                setConnectionAttemptCount(prev => prev + 1);
                setForceReconnect(true);
              }, 1000);
            }
          }, 500);
        }
        
      } catch (error) {
        console.error('Error connecting to Gmail:', error);
        setConnectionError(`Error: ${(error as Error).message}`);
        setDetailedErrorInfo({
          error: error,
          context: "Connecting to Gmail"
        });
      } finally {
        setIsConnecting(false);
      }
    } catch (error) {
      console.error('Error in connectGmail:', error);
      setConnectionError(`An error occurred: ${(error as Error).message}`);
      setIsConnecting(false);
    }
  }, [user, leadId, isConnecting, windowObjectReady, isConnected]);

  // Function to retry connection
  const retryConnection = useCallback(() => {
    setForceReconnect(true);
    setHandledOAuthSuccess(false);
    setConnectionAttemptCount(prev => prev + 1);
    
    // Clear OAuth indicators
    if (windowObjectReady) {
      localStorage.removeItem('oauth_pending');
      localStorage.removeItem('oauth_connection_error');
      localStorage.removeItem('oauth_cloudflare_error');
    }

    // If we detected a connection error, show a toast to inform user
    if (connectionError) {
      toast({
        title: "Nouvelle tentative",
        description: "Vérification de la connexion Gmail..."
      });
    }
    
    forceAuthCheck();
  }, [connectionError, windowObjectReady, forceAuthCheck]);

  // Function to check status of Supabase Edge function
  const checkSupabaseEdgeFunctionStatus = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('gmail-auth', {
        body: { action: 'status-check' }
      });
      
      if (error) {
        console.error('Error checking Edge function status:', error);
        return { success: false, error: error.message };
      }
      
      return { success: true, data };
    } catch (error) {
      console.error('Error checking Edge function status:', error);
      return { success: false, error: (error as Error).message };
    }
  }, []);

  return {
    isConnected,
    isLoading,
    connectedEmail,
    isConnecting,
    connectionError,
    detailedErrorInfo,
    googleAuthURL,
    checkingConnection,
    connectGmail,
    retryConnection,
    checkSupabaseEdgeFunctionStatus,
    forceAuthCheck
  };
};
