import { useState, useEffect } from 'react';
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

  // Check for OAuth success or error flags in localStorage or URL parameters
  useEffect(() => {
    // First check URL parameters
    const params = new URLSearchParams(location.search);
    const oauthSuccess = params.has('oauth_success');
    
    // Then check localStorage
    const storedSuccess = localStorage.getItem('oauth_success') === 'true';
    const storedError = localStorage.getItem('oauth_connection_error') === 'true';
    
    if (oauthSuccess || storedSuccess) {
      console.log('Détection de succès OAuth:', { 
        fromURL: oauthSuccess, 
        fromLocalStorage: storedSuccess 
      });
      
      if (storedSuccess) {
        // Clean up localStorage
        localStorage.removeItem('oauth_success');
      }
      
      // If we're on the emails tab, we can clean up the URL
      if (location.search.includes('tab=emails') && oauthSuccess) {
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
      
      // Mark connection as successful immediately
      setIsConnected(true);
      setConnectionError(null);
      setDetailedErrorInfo(null);
      setIsLoading(false);
      setCheckingConnection(false);
      
      // Still fetch connection details to get the email
      setConnectionAttemptCount(prev => prev + 1);
      
      toast({
        title: "Connexion réussie",
        description: "Votre compte Gmail a été connecté avec succès."
      });
    }
    
    // Handle error case
    if (storedError) {
      console.log('Détection d\'erreur OAuth dans localStorage');
      localStorage.removeItem('oauth_connection_error');
      
      setConnectionError("Erreur lors de l'authentification Google. Veuillez réessayer.");
      setDetailedErrorInfo({
        error: "La page de callback a rencontré une erreur (probablement Cloudflare Error 1101)",
        helpMessage: "Ceci est généralement une erreur temporaire. Veuillez réessayer."
      });
      
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: "Une erreur s'est produite lors de la connexion à Gmail. Veuillez réessayer."
      });
    }
  }, [location.search]);

  // Check OAuth redirect target in localStorage
  useEffect(() => {
    const redirectTarget = localStorage.getItem('oauthRedirectTarget');
    if (redirectTarget) {
      console.log('Detected OAuth redirect with target:', redirectTarget);
      
      // Clean up localStorage
      localStorage.removeItem('oauthRedirectTarget');
      
      // Force connection check
      setConnectionAttemptCount(prev => prev + 1);
      
      // Mark connection as successful for immediate UI update
      setIsConnected(true);
      setConnectionError(null);
      setDetailedErrorInfo(null);
      setIsLoading(false);
      setCheckingConnection(false);
    }
  }, []);

  // Check Gmail connection status
  useEffect(() => {
    async function checkEmailConnection() {
      if (!user) {
        console.log("Aucun utilisateur connecté, impossible de vérifier la connexion Gmail");
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
        
        console.log("Vérification de la connexion Gmail pour l'utilisateur:", user.id);
        
        // Check if user already has a Gmail connection
        const { data, error } = await supabase
          .from('user_email_connections')
          .select('email, id')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (error) {
          console.error('Erreur lors de la vérification de la connexion:', error);
          setIsConnected(false);
          setConnectionError(`Erreur lors de la vérification de la connexion: ${error.message}`);
          return;
        }
        
        if (data) {
          console.log("Connexion Gmail trouvée:", data.email);
          setIsConnected(true);
          setConnectedEmail((data as EmailConnection).email);
        } else {
          console.log("Aucune connexion Gmail trouvée");
          setIsConnected(false);
        }
      } catch (error) {
        console.error('Erreur dans checkEmailConnection:', error);
        setConnectionError(`Une erreur est survenue: ${(error as Error).message}`);
      } finally {
        setIsLoading(false);
        setCheckingConnection(false);
      }
    }
    
    checkEmailConnection();
  }, [user, leadId, connectionAttemptCount]);

  // Function to start Gmail connection
  const connectGmail = async () => {
    if (isConnecting) return;
    
    try {
      setIsConnecting(true);
      setConnectionError(null);
      setDetailedErrorInfo(null);
      setGoogleAuthURL(null);
      
      console.log('Démarrage du processus de connexion Gmail pour le lead:', leadId);
      
      if (!user) {
        console.error("Erreur: Aucun utilisateur connecté");
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Vous devez être connecté pour utiliser cette fonctionnalité."
        });
        return;
      }
      
      // Build redirect URI
      const currentPath = window.location.pathname;
      const baseUrl = window.location.origin;
      const redirectUri = `${baseUrl}${currentPath}?tab=emails`;
      
      console.log('Utilisation de la URI de redirection:', redirectUri);
      console.log('ID utilisateur:', user.id);
      
      try {
        // Call Supabase Edge function to get auth URL
        const { data, error } = await supabase.functions.invoke('gmail-auth', {
          body: {
            action: 'authorize',
            userId: user.id,
            redirectUri: redirectUri
          }
        });
        
        if (error) {
          console.error('Erreur lors du démarrage de l\'authentification Gmail:', error);
          setConnectionError(`Erreur de démarrage de l'authentification: ${error.message}`);
          setDetailedErrorInfo({
            error: error,
            context: "Invoking gmail-auth function"
          });
          
          toast({
            variant: "destructive",
            title: "Erreur",
            description: "Impossible de démarrer l'authentification Gmail."
          });
          return;
        }
        
        if (!data || !data.authorizationUrl) {
          const errorMsg = "La réponse du serveur ne contient pas d'URL d'autorisation.";
          console.error(errorMsg, data);
          setConnectionError(errorMsg);
          setDetailedErrorInfo({
            error: errorMsg,
            data: data
          });
          return;
        }
        
        console.log('URL d\'autorisation reçue:', data.authorizationUrl.substring(0, 100) + '...');
        setGoogleAuthURL(data.authorizationUrl);
        
        // Save current URL for redirect back after auth
        localStorage.setItem('gmailAuthRedirectFrom', window.location.href);
        localStorage.setItem('oauthRedirectTarget', redirectUri);
        
        // Set a flag to detect Cloudflare errors
        localStorage.setItem('oauth_pending', 'true');
        
        // Set a timeout to check if the authentication was successful
        setTimeout(() => {
          const isPending = localStorage.getItem('oauth_pending');
          const isSuccess = localStorage.getItem('oauth_success');
          
          if (isPending === 'true' && isSuccess !== 'true') {
            // If still pending after 30 seconds, assume there was an error
            localStorage.removeItem('oauth_pending');
            localStorage.setItem('oauth_connection_error', 'true');
            
            // Force reload to show the error
            window.location.reload();
          }
        }, 30000);
        
        // Open auth URL in new tab
        window.open(data.authorizationUrl, '_blank', 'noopener,noreferrer');
        
        toast({
          title: "Authentification en cours",
          description: "Veuillez compléter l'authentification dans l'onglet qui vient de s'ouvrir."
        });
      } catch (invokeError) {
        console.error('Erreur lors de l\'invocation de la fonction gmail-auth:', invokeError);
        setConnectionError(`Erreur d'invocation de la fonction: ${(invokeError as Error).message}`);
        setDetailedErrorInfo({
          error: invokeError,
          context: "Try-catch block for function invocation"
        });
        
        toast({
          variant: "destructive",
          title: "Erreur technique",
          description: "Une erreur s'est produite lors de la connexion à Gmail."
        });
      }
    } catch (error) {
      console.error('Erreur dans connectGmail:', error);
      setConnectionError(`Erreur: ${(error as Error).message}`);
      setDetailedErrorInfo({
        error: error,
        context: "Main try-catch block"
      });
      
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur s'est produite lors de la connexion à Gmail."
      });
    } finally {
      // Don't disable connecting state immediately to prevent multiple clicks
      setTimeout(() => {
        setIsConnecting(false);
        // Clean up pending flag if it still exists
        localStorage.removeItem('oauth_pending');
      }, 5000);
    }
  };

  // Function to retry connection
  const retryConnection = () => {
    setConnectionAttemptCount(prev => prev + 1);
    // Clean up pending flag if it still exists
    localStorage.removeItem('oauth_pending');
    localStorage.removeItem('oauth_connection_error');
  };

  // Function to check Supabase Edge function status
  const checkSupabaseEdgeFunctionStatus = () => {
    window.open('https://status.supabase.com', '_blank');
  };

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
    checkSupabaseEdgeFunctionStatus
  };
};
