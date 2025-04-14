
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

  // Fonction pour détecter automatiquement le succès d'authentification
  const detectAuthSuccess = () => {
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
        localStorage.removeItem('oauth_email');
      }
      
      // Mettre à jour l'état de connexion immédiatement
      setIsConnected(true);
      setConnectionError(null);
      setDetailedErrorInfo(null);
      
      // Si nous avons l'email connecté, le définir directement
      if (connectedEmail) {
        setConnectedEmail(connectedEmail);
      }
      
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
  };

  // Vérifier les paramètres d'URL et localStorage pour le succès/échec d'OAuth
  useEffect(() => {
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

  // Vérifier la cible de redirection OAuth dans localStorage
  useEffect(() => {
    const redirectTarget = localStorage.getItem('oauthRedirectTarget');
    if (redirectTarget) {
      console.log('Detected OAuth redirect with target:', redirectTarget);
      
      // Nettoyer localStorage
      localStorage.removeItem('oauthRedirectTarget');
      
      // Forcer la vérification de connexion
      setConnectionAttemptCount(prev => prev + 1);
      
      // Marquer la connexion comme réussie pour une mise à jour immédiate de l'interface
      setIsConnected(true);
      setConnectionError(null);
      setDetailedErrorInfo(null);
      setIsLoading(false);
      setCheckingConnection(false);
    }
  }, []);

  // Vérifier le statut de connexion Gmail
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
          
          // Vérifier si nous avons un succès d'authentification pour mettre à jour l'interface
          detectAuthSuccess();
        } else {
          console.log("Aucune connexion Gmail trouvée");
          setIsConnected(false);
          
          // Vérifier à nouveau si l'authentification a réussi
          const isAuthenticated = detectAuthSuccess();
          if (isAuthenticated) {
            // Si l'authentification a réussi mais qu'aucune connexion n'a été trouvée,
            // c'est probablement un problème de synchronisation, forçons un rechargement
            window.location.reload();
          }
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

  // Fonction pour démarrer la connexion Gmail
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
        
        // Enregistrer l'URL actuelle pour la redirection après l'authentification
        localStorage.setItem('gmailAuthRedirectFrom', window.location.href);
        localStorage.setItem('oauthRedirectTarget', redirectUri);
        
        // Définir un indicateur pour détecter les erreurs Cloudflare
        localStorage.setItem('oauth_pending', 'true');
        
        // Définir un délai pour vérifier si l'authentification a réussi
        setTimeout(() => {
          const isPending = localStorage.getItem('oauth_pending');
          const isSuccess = localStorage.getItem('oauth_success');
          
          if (isPending === 'true' && isSuccess !== 'true') {
            // Si toujours en attente après 30 secondes, supposer qu'il y a eu une erreur
            localStorage.removeItem('oauth_pending');
            localStorage.setItem('oauth_connection_error', 'true');
            
            // Forcer le rechargement pour afficher l'erreur
            window.location.reload();
          }
        }, 30000);
        
        // Ouvrir l'URL d'authentification dans un nouvel onglet
        const authWindow = window.open(data.authorizationUrl, '_blank', 'noopener,noreferrer');
        
        // Vérifier si la fenêtre s'est bien ouverte
        if (!authWindow) {
          toast({
            variant: "destructive",
            title: "Erreur",
            description: "Impossible d'ouvrir la fenêtre d'authentification. Veuillez vérifier que les popups sont autorisés."
          });
          console.error("La fenêtre d'authentification n'a pas pu être ouverte");
          return;
        }
        
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
      // Ne pas désactiver l'état de connexion immédiatement pour éviter les clics multiples
      setTimeout(() => {
        setIsConnecting(false);
        // Nettoyer l'indicateur en attente s'il existe toujours
        localStorage.removeItem('oauth_pending');
      }, 5000);
    }
  };

  // Fonction pour réessayer la connexion
  const retryConnection = () => {
    setConnectionAttemptCount(prev => prev + 1);
    // Nettoyer les indicateurs si ils existent toujours
    localStorage.removeItem('oauth_pending');
    localStorage.removeItem('oauth_connection_error');
  };

  // Fonction pour vérifier l'état de la fonction Edge Supabase
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
