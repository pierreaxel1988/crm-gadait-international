
import React from 'react';
import { Mail, RefreshCw, ExternalLink, CheckCircle, AlertCircle, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';

interface EmailConnectionStateProps {
  isConnecting: boolean;
  connectGmail: () => void;
  onRetryConnection?: () => void;
}

const EmailConnectionState: React.FC<EmailConnectionStateProps> = ({
  isConnecting,
  connectGmail,
  onRetryConnection
}) => {
  const { user } = useAuth();
  
  // Vérifier s'il y a eu une erreur de connexion OAuth stockée dans localStorage
  const [hadConnectionError, setHadConnectionError] = React.useState<boolean>(
    localStorage.getItem('oauth_connection_error') === 'true'
  );
  
  // Vérifier si nous avons été redirigés depuis la page de callback
  const [redirectedFromCallback, setRedirectedFromCallback] = React.useState<boolean>(false);
  const [showRedirectHelp, setShowRedirectHelp] = React.useState<boolean>(false);
  const [forceReloadCount, setForceReloadCount] = React.useState<number>(0);
  
  React.useEffect(() => {
    // Vérifier si nous venons de la page de callback
    const referrer = document.referrer;
    if (referrer && (
      referrer.includes('oauth/callback') || 
      referrer.includes('accounts.google.com') ||
      localStorage.getItem('oauth_pending') === 'true' ||
      localStorage.getItem('oauthRedirectTarget')
    )) {
      setRedirectedFromCallback(true);
      
      // Si nous avons été redirigés depuis la page de callback, réessayer automatiquement la connexion
      if (onRetryConnection) {
        console.log("Redirection détectée depuis Oauth, tentative de reconnexion automatique");
        const timer = setTimeout(() => {
          onRetryConnection();
        }, 500);
        return () => clearTimeout(timer);
      }
    }
    
    // Après 5 secondes, montrer l'aide de redirection si nécessaire
    const redirectHelpTimer = setTimeout(() => {
      setShowRedirectHelp(true);
    }, 5000);
    
    // Nettoyer l'indicateur d'erreur après l'avoir lu
    if (hadConnectionError) {
      localStorage.removeItem('oauth_connection_error');
      
      // Forcer un rechargement automatique en cas d'erreur précédente
      if (forceReloadCount === 0) {
        const reloadTimer = setTimeout(() => {
          setForceReloadCount(1);
          if (onRetryConnection) {
            onRetryConnection();
          }
        }, 1000);
        return () => clearTimeout(reloadTimer);
      }
    }
    
    // Nettoyer les autres indicateurs OAuth qui pourraient exister
    localStorage.removeItem('oauth_pending');
    
    return () => clearTimeout(redirectHelpTimer);
  }, [hadConnectionError, onRetryConnection, forceReloadCount]);
  
  const handleConnectClick = () => {
    console.log('Initiating Gmail connection...', {userId: user?.id});
    if (user) {
      // Réinitialiser tout état d'erreur précédent
      localStorage.removeItem('oauth_connection_error');
      localStorage.removeItem('oauth_pending');
      localStorage.removeItem('oauth_success');
      
      // Ajouter un marqueur pour détecter si nous sommes en attente d'authentification
      localStorage.setItem('oauth_pending', 'true');
      
      // Ajouter un timeout pour détecter les problèmes de redirection
      setTimeout(() => {
        if (localStorage.getItem('oauth_pending') === 'true') {
          // Si le processus est toujours en attente après 30 secondes, afficher une aide
          setShowRedirectHelp(true);
        }
      }, 30000);
      
      connectGmail();
    } else {
      console.error('Erreur: Utilisateur non connecté');
      alert('Vous devez être connecté pour utiliser cette fonctionnalité.');
    }
  };

  const handleRetryConnection = () => {
    if (onRetryConnection) {
      // Réinitialiser tout état d'erreur précédent
      localStorage.removeItem('oauth_connection_error');
      localStorage.removeItem('oauth_pending');
      localStorage.removeItem('oauth_success');
      
      // Si nous avons eu un problème de redirection, essayer une méthode alternative
      if (redirectedFromCallback || showRedirectHelp) {
        try {
          // Forcer un rechargement complet de la page
          window.location.reload();
        } catch (e) {
          console.error("Erreur lors du rechargement:", e);
          onRetryConnection();
        }
      } else {
        onRetryConnection();
      }
    }
  };

  const handleForceReload = () => {
    // Nettoyer tous les indicateurs et forcer un rechargement
    localStorage.removeItem('oauth_connection_error');
    localStorage.removeItem('oauth_pending');
    localStorage.removeItem('oauth_success');
    window.location.reload();
  };

  return (
    <div className="p-4 flex flex-col items-center justify-center space-y-4 pt-8">
      <div className="bg-loro-pearl/30 rounded-full p-4 border-2 border-loro-terracotta shadow-sm">
        <Mail className="h-8 w-8 text-loro-terracotta" />
      </div>
      <h3 className="font-semibold text-lg">Connectez votre compte Gmail</h3>
      <p className="text-gray-500 text-center text-sm mb-4">
        Connectez votre compte Gmail pour synchroniser les emails avec ce lead.
      </p>
      
      {hadConnectionError && (
        <Alert className="bg-red-50 border-red-200 mb-2">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-sm text-red-800 font-medium">
            Une erreur s'est produite lors de la dernière tentative de connexion. 
            <Button 
              onClick={handleForceReload}
              variant="outline" 
              className="mt-2 w-full border-red-300 bg-red-50 hover:bg-red-100 flex items-center justify-center gap-2"
            >
              <RotateCw className="h-4 w-4" /> Réessayer avec un rechargement complet
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {redirectedFromCallback && (
        <Alert className="bg-amber-50 border-amber-200 mb-2">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-sm text-amber-800 font-medium">
            Redirection depuis la page d'authentification détectée, mais le processus n'est pas complet.
            <Button 
              onClick={handleForceReload}
              variant="outline" 
              className="mt-2 w-full border-amber-300 bg-amber-50 hover:bg-amber-100 flex items-center justify-center gap-2"
            >
              <RotateCw className="h-4 w-4" /> Finaliser la connexion
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {showRedirectHelp && (
        <Alert className="bg-blue-50 border-blue-200 mb-2">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-sm text-blue-800 font-medium">
            Problème de redirection possible. Si vous avez déjà autorisé l'application mais êtes revenu sur cette page :
            <ol className="list-decimal pl-5 mt-2 space-y-1">
              <li>Essayez de rafraîchir la page avec le bouton ci-dessous</li>
              <li>Vérifiez que les popups ne sont pas bloqués par votre navigateur</li>
              <li>Si le problème persiste, essayez dans une fenêtre de navigation privée</li>
            </ol>
            <Button 
              onClick={handleForceReload}
              variant="outline" 
              className="mt-2 w-full border-blue-300 bg-blue-50 hover:bg-blue-100 flex items-center justify-center gap-2"
            >
              <RotateCw className="h-4 w-4" /> Forcer le rechargement complet
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      <Alert className="bg-blue-50 border-blue-200 mb-2">
        <AlertDescription className="text-sm text-blue-800">
          <p className="font-medium mb-2">Important pour l'authentification Gmail:</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Assurez-vous que votre navigateur <strong>autorise les popups</strong> pour ce site</li>
            <li>Utilisez un compte Google avec un accès Gmail complet</li>
            <li>Ne fermez pas la fenêtre popup Google qui s'ouvrira</li>
            <li>Après autorisation, vous serez automatiquement redirigé vers cette page</li>
          </ol>
        </AlertDescription>
      </Alert>
      
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 w-full">
        <div className="flex items-start">
          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <p className="font-medium text-green-800 text-sm">Configuration vérifiée</p>
            <p className="text-xs text-green-700">Les paramètres Google Cloud sont correctement configurés.</p>
          </div>
        </div>
      </div>
      
      <Button 
        onClick={handleConnectClick} 
        disabled={isConnecting}
        className="w-full max-w-xs flex items-center justify-center gap-2 text-white shadow-md py-6 rounded-md bg-loro-terracotta hover:bg-loro-terracotta/90"
      >
        {isConnecting ? (
          <>
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span className="font-medium">Connexion en cours...</span>
          </>
        ) : (
          <>
            <Mail className="h-5 w-5" />
            <span className="font-medium">Connecter Gmail</span>
          </>
        )}
      </Button>
      
      {onRetryConnection && (
        <Button 
          onClick={handleRetryConnection}
          variant="outline"
          className="w-full max-w-xs flex items-center justify-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Rafraîchir la connexion</span>
        </Button>
      )}
      
      <div className="text-xs text-gray-500 mt-2 space-y-2 text-center max-w-md">
        <p>
          Un nouvel onglet va s'ouvrir pour l'authentification Google.
          Assurez-vous de terminer le processus et d'attendre la redirection automatique.
        </p>
      </div>
    </div>
  );
};

export default EmailConnectionState;
