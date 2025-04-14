
import React from 'react';
import { Mail, RefreshCw, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
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
  
  // Check if there was an OAuth redirect error stored in localStorage
  const [hadConnectionError, setHadConnectionError] = React.useState<boolean>(
    localStorage.getItem('oauth_connection_error') === 'true'
  );
  
  // Check if we were redirected from the callback page
  const [redirectedFromCallback, setRedirectedFromCallback] = React.useState<boolean>(false);
  
  React.useEffect(() => {
    // Check if we came from the callback page
    const referrer = document.referrer;
    if (referrer && referrer.includes('oauth/callback')) {
      setRedirectedFromCallback(true);
      
      // If we were redirected from the callback page, automatically retry connection
      if (onRetryConnection) {
        const timer = setTimeout(() => {
          onRetryConnection();
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
    
    // Clear the error flag after reading it
    if (hadConnectionError) {
      localStorage.removeItem('oauth_connection_error');
    }
  }, [hadConnectionError, onRetryConnection]);
  
  const handleConnectClick = () => {
    console.log('Initiating Gmail connection...', {userId: user?.id});
    if (user) {
      // Reset any previous error state
      localStorage.removeItem('oauth_connection_error');
      localStorage.removeItem('oauth_pending');
      connectGmail();
    } else {
      console.error('Erreur: Utilisateur non connecté');
      alert('Vous devez être connecté pour utiliser cette fonctionnalité.');
    }
  };

  const handleRetryConnection = () => {
    if (onRetryConnection) {
      // Reset any previous error state
      localStorage.removeItem('oauth_connection_error');
      localStorage.removeItem('oauth_pending');
      onRetryConnection();
    }
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
            Veuillez réessayer ou vérifier les paramètres de votre compte Google.
          </AlertDescription>
        </Alert>
      )}
      
      {redirectedFromCallback && (
        <Alert className="bg-amber-50 border-amber-200 mb-2">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-sm text-amber-800 font-medium">
            Vous avez été redirigé depuis la page d'authentification, mais le processus n'est pas complet.
            Veuillez utiliser le bouton ci-dessous pour finaliser la connexion.
          </AlertDescription>
        </Alert>
      )}
      
      <Alert className="bg-blue-50 border-blue-200 mb-2">
        <AlertDescription className="text-sm text-blue-800">
          <p className="font-medium mb-2">Prérequis pour l'authentification Gmail:</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Assurez-vous que votre navigateur <strong>autorise les popups</strong> pour ce site</li>
            <li>Utilisez un compte Google avec un accès Gmail complet</li>
            <li>Si vous êtes sur Google Workspace, vérifiez les autorisations d'API</li>
            <li>Ne fermez pas la fenêtre popup Google qui s'ouvrira</li>
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
      
      <Alert className="bg-amber-50 border-amber-200">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-sm text-amber-800">
          Si vous avez déjà autorisé l'application mais que vous êtes redirigé ici, cliquez sur "Rafraîchir la connexion" ci-dessous.
        </AlertDescription>
      </Alert>
      
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
          Assurez-vous de terminer le processus dans la fenêtre qui s'ouvre.
        </p>
        <p>
          Si besoin, consultez la 
          <a 
            href="https://console.cloud.google.com/apis/credentials" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-loro-chocolate inline-flex items-center ml-1"
          >
            Console Google Cloud
            <ExternalLink className="h-3 w-3 ml-0.5" />
          </a>
        </p>
      </div>
    </div>
  );
};

export default EmailConnectionState;
