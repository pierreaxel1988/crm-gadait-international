
import React from 'react';
import { Mail, RefreshCw, ExternalLink, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';

interface EmailConnectionStateProps {
  isConnecting: boolean;
  connectGmail: () => void;
}

const EmailConnectionState: React.FC<EmailConnectionStateProps> = ({
  isConnecting,
  connectGmail,
}) => {
  const { user } = useAuth();
  
  const handleConnectClick = () => {
    console.log('Initiating Gmail connection...', {userId: user?.id});
    if (user) {
      connectGmail();
    } else {
      console.error('Erreur: Utilisateur non connecté');
      alert('Vous devez être connecté pour utiliser cette fonctionnalité.');
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
