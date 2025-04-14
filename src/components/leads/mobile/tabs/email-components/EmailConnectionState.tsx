
import React from 'react';
import { Mail, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
      <p className="text-xs text-gray-400 mt-2 text-center">
        Assurez-vous que les autorisations d'API ont été configurées dans Google Cloud Console
      </p>
    </div>
  );
};

export default EmailConnectionState;
