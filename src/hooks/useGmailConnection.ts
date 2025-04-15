
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
  const [authFlowStage, setAuthFlowStage] = useState<'idle' | 'initiating' | 'waiting' | 'completed' | 'error'>('idle');

  // S'assurer que window est défini (important pour empêcher les erreurs SSR)
  useEffect(() => {
    setWindowObjectReady(typeof window !== 'undefined');
  }, []);

  // Fonction pour détecter automatiquement le succès d'authentification
  const detectAuthSuccess = useCallback(() => {
    if (!windowObjectReady) return false;

    // Vérifier les paramètres d'URL
    const params = new URLSearchParams(location.search);
    const oauthSuccess = params.has('oauth_success');
    
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
      setAuthFlowStage('completed');
      
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
        description: "Votre compte Gmail a été connecté avec succès."
      });
      
      return true;
    }
    
    return false;
  }, [location.search, navigate, windowObjectReady]);

  // Vérifier pour les redirections et le succès/échec d'authentification
  useEffect(() => {
    if (!windowObjectReady) return;

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
      setAuthFlowStage('error');
      
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: "Une erreur s'est produite lors de la connexion à Gmail. Veuillez réessayer."
      });
    }
  }, [location.search, detectAuthSuccess, windowObjectReady]);

  // Vérifier la cible de redirection OAuth dans localStorage
  useEffect(() => {
    if (!windowObjectReady) return;

    const redirectTarget = localStorage.getItem('oauthRedirectTarget');
    if (redirectTarget) {
      console.log('Detected OAuth redirect with target:', redirectTarget);
      
      // Si la cible de redirection est cette page, c'est parfait!
      const currentPath = window.location.pathname;
      const targetIsCurrentPage = redirectTarget.includes(currentPath);
      
      if (targetIsCurrentPage) {
        console.log('OAuth redirect target matches current page, cleaning up');
        // Nettoyer localStorage
        localStorage.removeItem('oauthRedirectTarget');
        
        // Définir comme réussi pour permettre l'auto-détection
        localStorage.setItem('oauth_success', 'true');
        
        // Forcer la vérification de connexion
        setConnectionAttemptCount(prev => prev + 1);
        
        // Marquer la connexion comme réussie pour une mise à jour immédiate de l'interface
        setIsConnected(true);
        setConnectionError(null);
        setDetailedErrorInfo(null);
        setIsLoading(false);
        setCheckingConnection(false);
        setAuthFlowStage('completed');
      } else {
        // Si nous sommes sur une autre page, redirectionner vers la cible
        console.log('OAuth redirect target differs from current page, redirecting');
        
        // Afficher un toast de préparation
        toast({
          title: "Redirection en cours",
          description: "Vous êtes redirigé vers la page cible après authentification..."
        });
        
        // Petite pause avant redirection
        setTimeout(() => {
          window.location.href = redirectTarget;
        }, 500);
      }
    }
  }, [windowObjectReady]);

  // Tentative de récupération pour les redirections OAuth échouées
  useEffect(() => {
    if (!windowObjectReady) return;

    // Vérifier si nous avons un état de redirection en attente
    const isPending = localStorage.getItem('oauth_pending') === 'true';
    const hasRedirectTarget = localStorage.getItem('oauthRedirectTarget');
    
    // Si nous avons un état en attente mais que nous ne sommes pas redirigés correctement
    if ((isPending || hasRedirectTarget) && directRedirectAttempts < 1) {
      // Limiter à une seule tentative
      setDirectRedirectAttempts(prev => prev + 1);
      
      // Si nous sommes sur l'onglet emails, essayer de recharger
      if (location.pathname.includes('/leads/') && location.search.includes('tab=emails')) {
        // Forcer immédiatement une vérification
        setConnectionAttemptCount(prev => prev + 1);
      } else if (hasRedirectTarget) {
        // Si nous sommes sur une autre page mais qu'il existe une cible de redirection
        try {
          // Essayer de rediriger automatiquement vers la cible
          const redirectTarget = localStorage.getItem('oauthRedirectTarget');
          
          if (redirectTarget) {
            // Nettoyer l'état en attente
            localStorage.removeItem('oauth_pending');
            
            toast({
              title: "Redirection automatique",
              description: "Vous êtes redirigé vers la page cible après authentification Gmail."
            });
            
            // Petite pause avant redirection
            setTimeout(() => {
              window.location.href = redirectTarget;
            }, 500);
          }
        } catch (e) {
          console.error("Erreur lors de la redirection automatique:", e);
        }
      }
    }
  }, [directRedirectAttempts, location.pathname, location.search, windowObjectReady]);

  // Vérifier le statut de connexion Gmail
  useEffect(() => {
    if (!windowObjectReady) return;

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
          setAuthFlowStage('error');
          return;
        }
        
        if (data) {
          console.log("Connexion Gmail trouvée:", data.email);
          setIsConnected(true);
          setConnectedEmail((data as EmailConnection).email);
          setAuthFlowStage('completed');
          
          // Vérifier si nous avons un succès d'authentification pour mettre à jour l'interface
          detectAuthSuccess();
          
          // Nettoyer tout indicateur d'erreur ou de redirection en attente
          localStorage.removeItem('oauth_pending');
          localStorage.removeItem('oauth_connection_error');
        } else {
          console.log("Aucune connexion Gmail trouvée");
          setIsConnected(false);
          setAuthFlowStage('idle');
          
          // Vérifier à nouveau si l'authentification a réussi
          const isAuthenticated = detectAuthSuccess();
          if (isAuthenticated) {
            // Si l'authentification a réussi mais qu'aucune connexion n'a été trouvée,
            // c'est probablement un problème de synchronisation, forçons un rechargement
            setConnectionAttemptCount(prev => prev + 1);
          }
        }
      } catch (error) {
        console.error('Erreur dans checkEmailConnection:', error);
        setConnectionError(`Une erreur est survenue: ${(error as Error).message}`);
        setAuthFlowStage('error');
      } finally {
        setIsLoading(false);
        setCheckingConnection(false);
      }
    }
    
    checkEmailConnection();
  }, [user, leadId, connectionAttemptCount, detectAuthSuccess, isConnected, windowObjectReady]);

  // Fonction pour démarrer la connexion Gmail
  const connectGmail = useCallback(async () => {
    if (isConnecting || !windowObjectReady) return;
    
    try {
      setIsConnecting(true);
      setConnectionError(null);
      setDetailedErrorInfo(null);
      setGoogleAuthURL(null);
      setAuthFlowStage('initiating');
      
      console.log('Démarrage du processus de connexion Gmail pour le lead:', leadId);
      
      if (!user) {
        console.error("Erreur: Aucun utilisateur connecté");
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Vous devez être connecté pour utiliser cette fonctionnalité."
        });
        setAuthFlowStage('error');
        return;
      }
      
      // Construire l'URI de redirection
      const currentPath = window.location.pathname;
      const baseUrl = window.location.origin;
      const redirectUri = `${baseUrl}${currentPath}?tab=emails`;
      
      console.log('Utilisation de la URI de redirection:', redirectUri);
      console.log('ID utilisateur:', user.id);
      
      try {
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
          setAuthFlowStage('error');
          
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
          setAuthFlowStage('error');
          return;
        }
        
        console.log('URL d\'autorisation reçue:', data.authorizationUrl.substring(0, 100) + '...');
        setGoogleAuthURL(data.authorizationUrl);
        setAuthFlowStage('waiting');
        
        // Enregistrer l'URL actuelle pour la redirection après l'authentification
        localStorage.setItem('gmailAuthRedirectFrom', window.location.href);
        localStorage.setItem('oauthRedirectTarget', redirectUri);
        
        // Définir un indicateur pour détecter les erreurs de redirection
        localStorage.setItem('oauth_pending', 'true');
        
        // Définir un délai pour vérifier si l'authentification a réussi
        setTimeout(() => {
          const isPending = localStorage.getItem('oauth_pending');
          const isSuccess = localStorage.getItem('oauth_success');
          
          if (isPending === 'true' && isSuccess !== 'true') {
            // Si toujours en attente après 30 secondes, supposer qu'il y a eu une erreur
            localStorage.removeItem('oauth_pending');
            localStorage.setItem('oauth_connection_error', 'true');
            
            // Notification à l'utilisateur
            toast({
              variant: "destructive",
              title: "Erreur d'authentification",
              description: "La redirection après authentification a échoué. Veuillez réessayer."
            });
            
            // Mettre à jour l'état
            setAuthFlowStage('error');
            setConnectionError("Erreur de redirection après authentification");
            
            // Forcer le rechargement pour afficher l'erreur
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          }
        }, 30000);
        
        // Fonction pour gérer l'ouverture de la fenêtre d'authentification
        const openAuthWindow = (url: string): Window | null => {
          try {
            const width = 600;
            const height = 700;
            const left = (window.screen.width / 2) - (width / 2);
            const top = (window.screen.height / 2) - (height / 2);
            
            // Ouvrir dans une fenêtre popup (meilleur contrôle et UX)
            return window.open(
              url, 
              'GmailAuthPopup', 
              `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`
            );
          } catch (e) {
            console.error("Erreur lors de l'ouverture de la fenêtre:", e);
            return null;
          }
        };
        
        // Ouvrir l'URL d'authentification
        try {
          // Essayer d'ouvrir dans une fenêtre popup d'abord
          const authWindow = openAuthWindow(data.authorizationUrl);
          
          // Vérifier si la fenêtre s'est bien ouverte
          if (!authWindow) {
            console.log("Impossible d'ouvrir un nouvel onglet, essai de redirection directe");
            // Si l'ouverture d'un nouvel onglet a échoué, rediriger directement
            window.location.href = data.authorizationUrl;
            return; // Arrêter l'exécution car la page va se recharger
          } else {
            toast({
              title: "Authentification en cours",
              description: "Veuillez compléter l'authentification dans la fenêtre qui vient de s'ouvrir."
            });
            
            // Ajout d'une vérification de focus
            setTimeout(() => {
              try {
                if (authWindow && !authWindow.closed) {
                  // Essayer de ramener la fenêtre au premier plan
                  authWindow.focus();
                  
                  // Notifier à nouveau l'utilisateur
                  toast({
                    title: "Authentification requise",
                    description: "Veuillez terminer le processus d'authentification dans la fenêtre ouverte."
                  });
                }
              } catch (e) {
                console.log("Erreur lors de la vérification de la fenêtre:", e);
              }
            }, 3000);
          }
          
          // Définir un intervalle pour vérifier si l'onglet d'authentification est fermé
          const checkInterval = setInterval(() => {
            if (authWindow.closed) {
              clearInterval(checkInterval);
              
              // Vérifier si nous avons un indicateur de succès dans localStorage
              const isSuccess = localStorage.getItem('oauth_success') === 'true';
              
              if (isSuccess) {
                console.log('Authentification réussie détectée (fenêtre fermée)');
                // Augmenter le compteur de tentatives pour forcer une vérification
                setConnectionAttemptCount(prev => prev + 1);
                
                // Mettre à jour immédiatement l'interface
                setIsConnected(true);
                setConnectionError(null);
                setDetailedErrorInfo(null);
                setAuthFlowStage('completed');
                
                // Afficher un toast de confirmation
                toast({
                  title: "Connexion réussie",
                  description: "Votre compte Gmail a été connecté avec succès."
                });
              } else {
                // Si la fenêtre est fermée et pas de succès, vérifier une fois de plus
                setConnectionAttemptCount(prev => prev + 1);
                
                // Nettoyer les indicateurs
                localStorage.removeItem('oauth_pending');
              }
            }
          }, 1000);
          
          // Nettoyer l'intervalle après 2 minutes
          setTimeout(() => {
            clearInterval(checkInterval);
          }, 120000);
        } catch (windowError) {
          console.error("Erreur lors de l'ouverture de la fenêtre d'authentification:", windowError);
          // En cas d'erreur à l'ouverture de la fenêtre, essayer la redirection directe
          window.location.href = data.authorizationUrl;
        }
      } catch (invokeError) {
        console.error('Erreur lors de l\'invocation de la fonction gmail-auth:', invokeError);
        setConnectionError(`Erreur d'invocation de la fonction: ${(invokeError as Error).message}`);
        setDetailedErrorInfo({
          error: invokeError,
          context: "Try-catch block for function invocation"
        });
        setAuthFlowStage('error');
        
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
      setAuthFlowStage('error');
      
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur s'est produite lors de la connexion à Gmail."
      });
    } finally {
      // Ne pas désactiver l'état de connexion immédiatement pour éviter les clics multiples
      setTimeout(() => {
        setIsConnecting(false);
        // Nettoyer l'indicateur en attente s'il existe toujours
        if (authFlowStage !== 'completed') {
          localStorage.removeItem('oauth_pending');
        }
      }, 3000);
    }
  }, [isConnecting, leadId, user, windowObjectReady]);

  // Fonction pour réessayer la connexion
  const retryConnection = useCallback(() => {
    if (!windowObjectReady) return;

    setConnectionAttemptCount(prev => prev + 1);
    // Nettoyer les indicateurs s'ils existent toujours
    localStorage.removeItem('oauth_pending');
    localStorage.removeItem('oauth_connection_error');
    
    // Mettre à jour l'interface immédiatement
    toast({
      title: "Vérification en cours",
      description: "Nous vérifions l'état de votre connexion Gmail..."
    });
  }, [windowObjectReady]);

  // Fonction pour vérifier l'état de la fonction Edge Supabase
  const checkSupabaseEdgeFunctionStatus = useCallback(() => {
    if (windowObjectReady) {
      window.open('https://status.supabase.com', '_blank');
    }
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
    authFlowStage,
    connectGmail,
    retryConnection,
    checkSupabaseEdgeFunctionStatus
  };
};
