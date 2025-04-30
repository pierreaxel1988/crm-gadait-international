
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
  const [directRedirectAttempts, setDirectRedirectAttempts] = useState(0);
  const [windowObjectReady, setWindowObjectReady] = useState(false);
  const [cloudflareErrorDetected, setCloudflareErrorDetected] = useState(false);
  const [lastTokenRefreshTime, setLastTokenRefreshTime] = useState<number>(0);
  const [forceReconnect, setForceReconnect] = useState(false);
  const [handledOAuthSuccess, setHandledOAuthSuccess] = useState(false);

  // S'assurer que window est défini (important pour empêcher les erreurs SSR)
  useEffect(() => {
    setWindowObjectReady(typeof window !== 'undefined');
    
    // Écouter les messages venant de la fenêtre de callback OAuth
    const handleMessage = (event: MessageEvent) => {
      // Vérifier que le message est du bon type
      if (event.data && event.data.type === 'OAUTH_SUCCESS') {
        console.log("Received postMessage from OAuth callback:", event.data);
        
        if (event.data.success) {
          // Marquer l'authentification comme réussie
          localStorage.setItem('oauth_success', 'true');
          if (event.data.email) {
            localStorage.setItem('oauth_email', event.data.email);
          }
          
          // Forcer la vérification de connexion
          setConnectionAttemptCount(prev => prev + 1);
          setForceReconnect(true);
          setHandledOAuthSuccess(true);
          
          // Afficher un toast de confirmation
          toast({
            title: "Connexion réussie",
            description: event.data.email 
              ? `Compte Gmail connecté: ${event.data.email}` 
              : "Connexion à Gmail réussie."
          });
          
          // Recharger la page pour s'assurer de la synchronisation
          setTimeout(() => {
            window.location.reload();
          }, 500);
        }
      }
    };
    
    if (windowObjectReady) {
      window.addEventListener('message', handleMessage);
    }
    
    // Nettoyer l'écouteur lors du démontage
    return () => {
      if (windowObjectReady) {
        window.removeEventListener('message', handleMessage);
      }
    };
  }, [windowObjectReady]);

  // Auto-refresh immédiat si nous détectons des indicateurs de réussite OAuth
  useEffect(() => {
    if (!windowObjectReady || handledOAuthSuccess) return;
    
    const checkForOAuthSuccess = () => {
      const searchParams = new URLSearchParams(location.search);
      const hasOAuthSuccess = searchParams.has('oauth_success') || localStorage.getItem('oauth_success') === 'true';
      
      if (hasOAuthSuccess) {
        console.log("Indicateur oauth_success détecté, forçage du rechargement immédiat");
        setConnectionAttemptCount(prev => prev + 1);
        setForceReconnect(true);
        setHandledOAuthSuccess(true);
        
        // Si l'URL contient des paramètres OAuth, nettoyer l'URL
        if (searchParams.has('oauth_success')) {
          searchParams.delete('oauth_success');
          const newSearch = searchParams.toString();
          const newPath = `${location.pathname}${newSearch ? `?${newSearch}` : ''}`;
          navigate(newPath, { replace: true });
        }
        
        // Recharger la page pour s'assurer de la synchronisation
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
    };
    
    checkForOAuthSuccess();
    
    // Vérifier périodiquement les indicateurs de localStorage
    const interval = setInterval(() => {
      const oauthSuccess = localStorage.getItem('oauth_success') === 'true';
      if (oauthSuccess && !isConnected && !handledOAuthSuccess) {
        console.log("oauth_success détecté dans localStorage, forçage de la reconnexion");
        localStorage.removeItem('oauth_success');
        setForceReconnect(true);
        setConnectionAttemptCount(prev => prev + 1);
        setHandledOAuthSuccess(true);
        
        // Recharger la page pour s'assurer de la synchronisation
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [location.search, navigate, isConnected, windowObjectReady, handledOAuthSuccess]);

  // Fonction pour détecter automatiquement le succès d'authentification
  const detectAuthSuccess = useCallback(() => {
    if (!windowObjectReady || handledOAuthSuccess) return false;

    // Vérifier les paramètres d'URL
    const params = new URLSearchParams(location.search);
    const oauthSuccess = params.has('oauth_success') || params.get('oauth_success') === 'true';
    
    // Vérifier localStorage
    const storedSuccess = localStorage.getItem('oauth_success') === 'true';
    const connectedEmail = localStorage.getItem('oauth_email');
    
    if (oauthSuccess || storedSuccess) {
      console.log('Détection de succès OAuth:', { 
        fromURL: oauthSuccess, 
        fromLocalStorage: storedSuccess,
        connectedEmail
      });
      
      // Nettoyer localStorage
      if (storedSuccess) {
        localStorage.removeItem('oauth_success');
      }
      
      if (connectedEmail) {
        localStorage.removeItem('oauth_email');
        setConnectedEmail(connectedEmail);
      }
      
      // Mettre à jour l'état de connexion immédiatement
      setIsConnected(true);
      setConnectionError(null);
      setDetailedErrorInfo(null);
      setCloudflareErrorDetected(false);
      setHandledOAuthSuccess(true);
      
      // Si nous sommes sur l'onglet emails, nettoyer l'URL
      if (location.search.includes('tab=emails') && oauthSuccess) {
        const cleanParams = new URLSearchParams(location.search);
        cleanParams.delete('oauth_success');
        
        // Conserver le paramètre tab=emails
        if (location.search.includes('tab=emails')) {
          cleanParams.set('tab', 'emails');
        }
        
        const newSearch = cleanParams.toString();
        const newUrl = `${location.pathname}${newSearch ? `?${newSearch}` : ''}`;
        navigate(newUrl, { replace: true });
      }
      
      // Augmenter le compteur de tentatives pour forcer une vérification
      setConnectionAttemptCount(prev => prev + 1);
      
      // Afficher un toast de confirmation
      toast({
        title: "Connexion réussie",
        description: connectedEmail 
          ? `Compte Gmail connecté: ${connectedEmail}` 
          : "Connexion à Gmail réussie."
      });
      
      // Forcer un rechargement de la page
      setTimeout(() => {
        window.location.reload();
      }, 500);
      
      return true;
    }

    // Vérifier si une erreur Cloudflare a été détectée
    const cloudflareError = localStorage.getItem('oauth_cloudflare_error') === 'true';
    if (cloudflareError && !cloudflareErrorDetected) {
      console.log('Erreur Cloudflare détectée dans localStorage');
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
  }, [location.search, navigate, windowObjectReady, cloudflareErrorDetected, handledOAuthSuccess]);

  // Vérifier pour les redirections et le succès/échec d'authentification
  useEffect(() => {
    if (!windowObjectReady || handledOAuthSuccess) return;

    // Vérifier le succès d'authentification
    const isAuthenticated = detectAuthSuccess();
    
    if (isAuthenticated) {
      setIsLoading(false);
      setCheckingConnection(false);
      return;
    }
    
    // Vérifier pour les erreurs
    const storedError = localStorage.getItem('oauth_connection_error') === 'true';
    
    if (storedError) {
      console.log('Détection d\'erreur OAuth dans localStorage');
      localStorage.removeItem('oauth_connection_error');
      
      setConnectionError("Erreur lors de l'authentification Google. Veuillez réessayer.");
      setDetailedErrorInfo({
        error: "La page de callback a rencontré une erreur (probablement une interruption de session)",
        helpMessage: "Ceci est généralement une erreur temporaire. Veuillez réessayer."
      });
      
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: "Une erreur s'est produite lors de la connexion à Gmail. Veuillez réessayer."
      });
    }
  }, [location.search, detectAuthSuccess, windowObjectReady, handledOAuthSuccess]);

  // Vérifier la cible de redirection OAuth dans localStorage
  useEffect(() => {
    if (!windowObjectReady || handledOAuthSuccess) return;

    const redirectTarget = localStorage.getItem('oauthRedirectTarget');
    if (redirectTarget) {
      console.log('Detected OAuth redirect with target:', redirectTarget);
      
      // Nettoyer localStorage
      localStorage.removeItem('oauthRedirectTarget');
      
      // Forcer la vérification de connexion
      setConnectionAttemptCount(prev => prev + 1);
      setForceReconnect(true);
      setHandledOAuthSuccess(true);
      
      // Marquer la connexion comme réussie pour une mise à jour immédiate de l'interface
      setIsConnected(true);
      setConnectionError(null);
      setDetailedErrorInfo(null);
      setIsLoading(false);
      setCheckingConnection(false);
      
      // Recharger la page pour s'assurer de la synchronisation
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  }, [windowObjectReady, handledOAuthSuccess]);

  // Vérifier le statut de connexion Gmail
  useEffect(() => {
    if (!windowObjectReady) return;
    
    // Éviter les requêtes trop fréquentes
    const now = Date.now();
    if (now - lastTokenRefreshTime < 1000 && lastTokenRefreshTime > 0 && !forceReconnect) {
      return; // Éviter les appels trop fréquents
    }
    setLastTokenRefreshTime(now);

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
        
        // Vérifier si l'utilisateur a déjà une connexion Gmail
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
          setForceReconnect(false);
          
          // Vérifier si nous avons un succès d'authentification pour mettre à jour l'interface
          detectAuthSuccess();
          
          // Nettoyer tout indicateur d'erreur ou de redirection en attente
          localStorage.removeItem('oauth_pending');
          localStorage.removeItem('oauth_connection_error');
          localStorage.removeItem('oauth_cloudflare_error');
        } else {
          console.log("Aucune connexion Gmail trouvée");
          setIsConnected(false);
          
          // Vérifier à nouveau si l'authentification a réussi
          const isAuthenticated = detectAuthSuccess();
          if (isAuthenticated) {
            // Si l'authentification a réussi mais qu'aucune connexion n'a été trouvée,
            // c'est probablement un problème de synchronisation, forçons un rechargement
            setConnectionAttemptCount(prev => prev + 1);
            setForceReconnect(true);
          }
        }
      } catch (error) {
        console.error('Erreur dans checkEmailConnection:', error);
        setConnectionError(`Une erreur est survenue: ${(error as Error).message}`);
      } finally {
        setIsLoading(false);
        setCheckingConnection(false);
        setForceReconnect(false);
      }
    }
    
    checkEmailConnection();
  }, [user, leadId, connectionAttemptCount, detectAuthSuccess, isConnected, windowObjectReady, lastTokenRefreshTime, forceReconnect]);

  // Fonction pour démarrer la connexion Gmail avec gestion améliorée des erreurs
  const connectGmail = useCallback(async () => {
    if (isConnecting || !windowObjectReady) return;
    
    try {
      setIsConnecting(true);
      setConnectionError(null);
      setDetailedErrorInfo(null);
      setGoogleAuthURL(null);
      setCloudflareErrorDetected(false);
      setHandledOAuthSuccess(false);
      
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
      
      // Construire l'URI de redirection
      const currentPath = window.location.pathname;
      const baseUrl = window.location.origin;
      const redirectUri = `${baseUrl}${currentPath}?tab=emails&t=${Date.now()}`;
      
      console.log('Utilisation de la URI de redirection:', redirectUri);
      console.log('ID utilisateur:', user.id);
      
      try {
        // Nettoyer tout état d'erreur/succès précédent
        localStorage.removeItem('oauth_connection_error');
        localStorage.removeItem('oauth_pending');
        localStorage.removeItem('oauth_success');
        localStorage.removeItem('oauth_cloudflare_error');
        
        // Ajouter un marqueur pour détecter si nous sommes en attente d'authentification
        localStorage.setItem('oauth_pending', 'true');
        
        // Appeler la fonction Edge Supabase pour obtenir l'URL d'authentification
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
        
        // Stocker la cible de redirection dans localStorage
        localStorage.setItem('oauthRedirectTarget', redirectUri);
        
        console.log('URL d\'autorisation générée:', data.authorizationUrl);
        setGoogleAuthURL(data.authorizationUrl);
        
        // Ouvrir une nouvelle fenêtre pour l'authentification avec des options de popup optimisées
        const newWindow = window.open(
          data.authorizationUrl, 
          '_blank',
          'width=600,height=700,toolbar=0,menubar=0,location=0,status=1,scrollbars=1,resizable=1,left=50,top=50'
        );
        
        // Vérifier si la fenêtre s'est ouverte correctement
        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
          console.error('Popup bloqué ou non ouvert');
          toast({
            variant: "destructive",
            title: "Popup bloqué",
            description: "Veuillez autoriser les popups pour ce site et réessayer."
          });
          
          setConnectionError("Impossible d'ouvrir la fenêtre d'authentification. Les popups sont peut-être bloqués.");
          setDetailedErrorInfo({
            error: "Popup bloqué",
            helpMessage: "Veuillez autoriser les popups pour ce site dans les paramètres de votre navigateur et réessayer."
          });
        } else {
          // Tenter automatiquement de vérifier si l'authentification a réussi après 2, 5 et 10 secondes
          const checkTimes = [2000, 5000, 10000];
          checkTimes.forEach(time => {
            setTimeout(() => {
              if (!isConnected) {
                setConnectionAttemptCount(prev => prev + 1);
              }
            }, time);
          });
          
          // Surveillance de fermeture de la popup
          const checkPopupClosed = setInterval(() => {
            if (newWindow.closed) {
              clearInterval(checkPopupClosed);
              console.log("Popup fermée, vérification de l'état d'authentification");
              setTimeout(() => {
                setConnectionAttemptCount(prev => prev + 1);
                setForceReconnect(true);
              }, 1000);
            }
          }, 1000);
        }
        
      } catch (error) {
        console.error('Erreur lors de la connexion Gmail:', error);
        setConnectionError(`Erreur: ${(error as Error).message}`);
        setDetailedErrorInfo({
          error: error,
          context: "Connecting to Gmail"
        });
      } finally {
        setIsConnecting(false);
      }
    } catch (error) {
      console.error('Erreur dans connectGmail:', error);
      setConnectionError(`Une erreur est survenue: ${(error as Error).message}`);
      setIsConnecting(false);
    }
  }, [user, leadId, isConnecting, windowObjectReady]);

  // Fonction pour réessayer la connexion
  const retryConnection = useCallback(() => {
    setForceReconnect(true);
    setHandledOAuthSuccess(false);
    setConnectionAttemptCount(prev => prev + 1);
    localStorage.removeItem('oauth_pending');
    localStorage.removeItem('oauth_connection_error');
    localStorage.removeItem('oauth_cloudflare_error');

    // Si nous avons détecté une erreur de connexion, afficher un message de toast pour informer l'utilisateur
    if (connectionError) {
      toast({
        title: "Nouvelle tentative",
        description: "Vérification de la connexion Gmail..."
      });
    }
  }, [connectionError]);

  // Fonction pour vérifier le statut de la fonction Edge Supabase
  const checkSupabaseEdgeFunctionStatus = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('gmail-auth', {
        body: { action: 'status' }
      });
      
      if (error) {
        console.error('Erreur lors de la vérification du statut de la fonction Edge:', error);
        return { success: false, error: error.message };
      }
      
      return { success: true, data };
    } catch (error) {
      console.error('Erreur lors de la vérification du statut de la fonction Edge:', error);
      return { success: false, error: (error as Error).message };
    }
  }, []);

  // Lorsque localStorage change - permet de détecter les changements venant d'autres onglets
  useEffect(() => {
    if (!windowObjectReady) return;

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'oauth_success' && event.newValue === 'true') {
        console.log('OAuth success detected from storage event');
        setConnectionAttemptCount(prev => prev + 1);
        setForceReconnect(true);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [windowObjectReady]);
  
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
