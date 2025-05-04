
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from './use-toast';

export const useGmailConnection = (leadId?: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [connectedEmail, setConnectedEmail] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [detailedErrorInfo, setDetailedErrorInfo] = useState<any>(null);
  const [googleAuthURL, setGoogleAuthURL] = useState<string | null>(null);
  const [checkingConnection, setCheckingConnection] = useState(true);
  const [lastCheckTime, setLastCheckTime] = useState<Date>(new Date());
  
  const { user } = useAuth();

  // Fonction pour vérifier la connexion Gmail existante
  const checkConnection = useCallback(async () => {
    if (!user) {
      console.log('Aucun utilisateur connecté pour vérifier la connexion Gmail');
      setIsLoading(false);
      setCheckingConnection(false);
      return;
    }

    try {
      console.log('Vérification de la connexion Gmail pour l\'utilisateur:', user.id);
      setCheckingConnection(true);
      
      const { data, error } = await supabase
        .from('user_email_connections')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.log('Aucune connexion Gmail trouvée:', error.message);
        setIsConnected(false);
        setConnectedEmail(null);
        // Ne pas définir d'erreur ici car c'est un cas normal quand l'utilisateur n'est pas encore connecté
      } else if (data) {
        console.log('Connexion Gmail trouvée pour:', data.email);
        
        // Vérifier si le token est expiré
        const isTokenExpired = new Date(data.token_expiry) < new Date();
        
        if (isTokenExpired) {
          console.log('Token Gmail expiré, essai de rafraîchissement automatique');
          try {
            // Appeler la fonction Edge pour rafraîchir le token
            const refreshResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gmail-auth`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                // Correction : utiliser la fonction getSession() au lieu d'accéder directement à session
                'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
              },
              body: JSON.stringify({ 
                action: 'refresh',
                userId: user.id,
                refreshToken: data.refresh_token
              })
            });
            
            const refreshResult = await refreshResponse.json();
            
            if (!refreshResponse.ok) {
              throw new Error(`Erreur de rafraîchissement: ${refreshResult.error || 'Unknown error'}`);
            }
            
            console.log('Token rafraîchi avec succès');
            // Le token a été rafraîchi avec succès dans la base de données
            setIsConnected(true);
            setConnectedEmail(data.email);
          } catch (refreshError) {
            console.error('Erreur lors du rafraîchissement du token:', refreshError);
            setConnectionError('Le token d\'authentification a expiré et n\'a pas pu être rafraîchi.');
            setIsConnected(false);
          }
        } else {
          console.log('Connexion Gmail valide et active');
          setIsConnected(true);
          setConnectedEmail(data.email);
        }
      } else {
        console.log('Aucune connexion Gmail configurée');
        setIsConnected(false);
        setConnectedEmail(null);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de la connexion Gmail:', error);
      setConnectionError('Une erreur s\'est produite lors de la vérification de la connexion.');
      setDetailedErrorInfo(error);
    } finally {
      setIsLoading(false);
      setCheckingConnection(false);
      setLastCheckTime(new Date());
    }
  }, [user]);

  // Fonction pour se connecter à Gmail
  const connectGmail = useCallback(async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Vous devez être connecté pour utiliser cette fonctionnalité."
      });
      return;
    }

    try {
      console.log('Démarrage du processus de connexion Gmail pour:', user.id);
      setIsConnecting(true);
      setConnectionError(null);
      
      // Marquer le début du processus dans localStorage pour suivi ultérieur
      localStorage.setItem('oauth_pending', 'true');
      
      // Enregistrer l'URL actuelle comme cible de redirection
      const currentUrl = window.location.href;
      localStorage.setItem('oauthRedirectTarget', currentUrl);
      
      // Obtenir l'URL d'autorisation Gmail via Edge Function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gmail-auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'authorize',
          userId: user.id,
          redirectUri: currentUrl
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erreur lors de la demande d\'autorisation Gmail:', errorData);
        throw new Error(errorData.error || 'Erreur lors de la connexion à Gmail');
      }

      const data = await response.json();
      console.log('URL d\'autorisation Gmail obtenue:', data);
      
      if (data.authorizationUrl) {
        console.log('Redirection vers:', data.authorizationUrl);
        setGoogleAuthURL(data.authorizationUrl);
        
        // Ouvrir dans un nouvel onglet pour éviter les problèmes de popup bloqué
        const newWindow = window.open(data.authorizationUrl, '_blank', 'width=600,height=700');
        
        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
          // Popup bloqué
          console.warn('Popup bloqué. Essai d\'ouverture directe...');
          window.location.href = data.authorizationUrl;
        }
      } else {
        throw new Error('URL d\'autorisation manquante dans la réponse');
      }
    } catch (error) {
      console.error('Erreur lors de la connexion à Gmail:', error);
      setConnectionError(`Erreur de connexion à Gmail: ${error.message}`);
      setDetailedErrorInfo(error);
      
      // Nettoyer les indicateurs OAuth en cas d'erreur
      localStorage.removeItem('oauth_pending');
      localStorage.removeItem('oauthRedirectTarget');
      
      // Ajouter un indicateur d'erreur pour informer les autres composants
      localStorage.setItem('oauth_connection_error', 'true');
      
      toast({
        variant: "destructive",
        title: "Erreur de connexion Gmail",
        description: error.message || "Une erreur s'est produite lors de la connexion à Gmail."
      });
    } finally {
      setIsConnecting(false);
    }
  }, [user]);

  // Fonction pour réessayer la connexion
  const retryConnection = useCallback(() => {
    console.log('Tentative de reconnexion Gmail');
    setConnectionError(null);
    setDetailedErrorInfo(null);
    
    // Nettoyer les indicateurs d'erreur
    localStorage.removeItem('oauth_connection_error');
    
    // Actualiser la vérification de connexion
    checkConnection();
  }, [checkConnection]);

  // Fonction pour forcer une nouvelle vérification d'authentification
  const forceAuthCheck = useCallback(() => {
    console.log('Forçage de la vérification d\'authentification Gmail');
    setIsLoading(true);
    setCheckingConnection(true);
    checkConnection();
  }, [checkConnection]);

  // Vérifier l'état de la fonction Edge
  const checkSupabaseEdgeFunctionStatus = useCallback(async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gmail-auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'status-check' })
      });

      const data = await response.json();
      return { ok: response.ok, data };
    } catch (error) {
      console.error('Erreur lors de la vérification de la fonction Edge:', error);
      return { ok: false, error };
    }
  }, []);

  // Vérifier la connexion Gmail au chargement du composant
  useEffect(() => {
    checkConnection();
  }, [user, checkConnection]);

  // Vérifier si nous venons d'être redirigés depuis l'authentification OAuth
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get('code');
    const stateParam = params.get('state');
    const successParam = params.get('oauth_success');
    const errorParam = params.get('oauth_connection_error');
    const cloudflareErrorParam = params.get('oauth_cloudflare_error');
    
    const handleOAuthCallback = async () => {
      try {
        console.log('Paramètres OAuth détectés dans l\'URL:', { 
          code: codeParam ? 'présent' : 'absent', 
          state: stateParam ? 'présent' : 'absent',
          success: successParam,
          error: errorParam,
          cloudflareError: cloudflareErrorParam
        });
        
        // Si nous avons déjà traité ces paramètres, ne pas continuer
        if (localStorage.getItem('oauth_processed') === window.location.search) {
          console.log('Callback OAuth déjà traité, ignoré');
          return;
        }
        
        if (cloudflareErrorParam === 'true') {
          console.log('Erreur Cloudflare détectée dans les paramètres');
          localStorage.setItem('oauth_cloudflare_error', 'true');
          // Nettoyer l'URL
          const cleanUrl = window.location.pathname + window.location.hash;
          window.history.replaceState({}, document.title, cleanUrl);
          return;
        }
        
        if (errorParam === 'true') {
          console.log('Erreur de connexion détectée dans les paramètres');
          localStorage.setItem('oauth_connection_error', 'true');
          // Nettoyer l'URL
          const cleanUrl = window.location.pathname + window.location.hash;
          window.history.replaceState({}, document.title, cleanUrl);
          return;
        }
        
        if (successParam === 'true') {
          console.log('Succès OAuth détecté dans les paramètres');
          localStorage.setItem('oauth_success', 'true');
          localStorage.removeItem('oauth_pending');
          
          // Marquer comme traité
          localStorage.setItem('oauth_processed', window.location.search);
          
          // Nettoyer l'URL et forcer la vérification de connexion
          const cleanUrl = window.location.pathname + window.location.hash;
          window.history.replaceState({}, document.title, cleanUrl);
          
          // Forcer une vérification de connexion après un court délai
          setTimeout(() => {
            checkConnection();
          }, 500);
          
          return;
        }
        
        if (codeParam && stateParam) {
          console.log('Code et state OAuth détectés, traitement en cours...');
          
          try {
            let state;
            try {
              state = JSON.parse(stateParam);
            } catch (e) {
              console.warn('Erreur de parsing du paramètre state:', e);
              state = stateParam;
            }
            
            // Appeler la fonction Edge pour échanger le code
            const exchangeResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gmail-auth`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                action: 'exchange',
                code: codeParam,
                state: state
              })
            });

            const exchangeData = await exchangeResponse.json();
            
            if (!exchangeResponse.ok) {
              console.error('Erreur lors de l\'échange du code OAuth:', exchangeData);
              
              // Vérifier si c'est une erreur Cloudflare
              if (exchangeData.cloudflareError) {
                localStorage.setItem('oauth_cloudflare_error', 'true');
              } else {
                localStorage.setItem('oauth_connection_error', 'true');
              }
              
              throw new Error(exchangeData.error || 'Erreur lors de l\'échange du code OAuth');
            }
            
            console.log('Échange OAuth réussi:', exchangeData);
            
            // Marquer le succès dans localStorage
            localStorage.setItem('oauth_success', 'true');
            localStorage.removeItem('oauth_pending');
            
            // Nettoyer l'URL
            const cleanUrl = window.location.pathname + window.location.hash;
            window.history.replaceState({}, document.title, cleanUrl);
            
            // Rediriger si nécessaire
            if (exchangeData.redirectUri) {
              console.log('Redirection vers:', exchangeData.redirectUri);
              if (exchangeData.redirectUri === window.location.href.split('?')[0]) {
                // Si nous sommes déjà sur la bonne page, juste rafraîchir la connexion
                checkConnection();
              } else {
                // Sinon, rediriger avec un paramètre de succès
                window.location.href = `${exchangeData.redirectUri}?oauth_success=true`;
              }
            } else {
              // Si pas de redirection spécifiée, simplement vérifier la connexion
              checkConnection();
            }
          } catch (error) {
            console.error('Erreur lors du traitement du callback OAuth:', error);
          }
        }
      } catch (error) {
        console.error('Erreur globale lors du traitement des paramètres OAuth:', error);
      }
    };

    // Uniquement traiter les paramètres OAuth si nous ne sommes pas déjà en train de vérifier la connexion
    if ((codeParam && stateParam) || successParam || errorParam || cloudflareErrorParam) {
      if (!checkingConnection) {
        handleOAuthCallback();
      } else {
        // Si nous sommes déjà en train de vérifier, attendre un peu
        setTimeout(() => {
          handleOAuthCallback();
        }, 1000);
      }
    }
    
    // Nettoyer les paramètres oAuth_success de l'URL sans perdre les autres paramètres
    if (successParam) {
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.delete('oauth_success');
      window.history.replaceState({}, document.title, currentUrl.toString());
    }
  }, [checkConnection, checkingConnection]);

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
    forceAuthCheck,
    lastCheckTime
  };
};
