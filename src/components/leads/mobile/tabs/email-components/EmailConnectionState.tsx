
import React from 'react';
import { Mail, RefreshCw, Shield, CheckCircle } from 'lucide-react';
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
      
      <div className="w-full max-w-md bg-blue-50 rounded-lg p-4 border border-blue-100 mb-4">
        <h4 className="font-medium text-blue-700 flex items-center mb-2">
          <CheckCircle className="h-4 w-4 mr-2" />
          Prérequis
        </h4>
        <ul className="list-disc pl-5 text-sm text-blue-600 space-y-1">
          <li>Vérifiez que les cookies tiers sont autorisés dans votre navigateur</li>
          <li>Assurez-vous que votre bloqueur de publicités n'interfère pas avec Google</li>
          <li>Un compte Google avec accès à Gmail est nécessaire</li>
        </ul>
      </div>
      
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
      
      <div className="text-xs text-gray-400 mt-2 text-center max-w-md">
        <p className="mb-1">
          Assurez-vous que les autorisations d'API ont été configurées dans Google Cloud Console
        </p>
        <p className="flex items-center justify-center text-amber-600">
          <Shield className="h-3 w-3 mr-1" />
          <span>Les cookies tiers doivent être activés pour cette fonctionnalité</span>
        </p>
      </div>
    </div>
  );
};

export default EmailConnectionState;
