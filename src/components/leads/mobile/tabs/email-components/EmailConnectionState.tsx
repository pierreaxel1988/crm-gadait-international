
import React from 'react';
import { Mail, RefreshCw, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EmailConnectionStateProps {
  isConnecting: boolean;
  connectGmail: () => void;
}

const EmailConnectionState: React.FC<EmailConnectionStateProps> = ({
  isConnecting,
  connectGmail,
}) => {
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
            <li>Assurez-vous que votre navigateur autorise les popups pour ce site</li>
            <li>Connectez-vous avec un compte Google qui a accès à l'API Gmail</li>
            <li>Si vous utilisez Google Workspace, vérifiez que votre administrateur a autorisé les API externes</li>
          </ol>
        </AlertDescription>
      </Alert>
      
      <Button 
        onClick={connectGmail} 
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
          Assurez-vous que les autorisations d'API ont été configurées dans Google Cloud Console.
        </p>
        <p>
          En cas de problème, consultez le 
          <a 
            href="https://console.cloud.google.com/apis/credentials" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-loro-chocolate inline-flex items-center ml-1"
          >
            Tableau de bord Google Cloud
            <ExternalLink className="h-3 w-3 ml-0.5" />
          </a>
        </p>
      </div>
    </div>
  );
};

export default EmailConnectionState;
