
import React from 'react';
import { Loader2, Mail, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmailLoadingProps {
  onManualRefresh?: () => void;
}

const EmailLoading: React.FC<EmailLoadingProps> = ({ onManualRefresh }) => {
  return (
    <div className="p-8 flex flex-col items-center justify-center h-60">
      <div className="bg-loro-pearl/30 rounded-full p-3 mb-4">
        <Mail className="h-6 w-6 text-loro-terracotta/70" />
      </div>
      <Loader2 className="h-8 w-8 text-loro-terracotta animate-spin mb-2" />
      <p className="text-sm text-gray-500">Chargement des emails...</p>
      <p className="text-xs text-gray-400 mt-1">Veuillez patienter</p>
      
      {onManualRefresh && (
        <Button 
          onClick={onManualRefresh}
          variant="outline"
          className="mt-6 flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Rafraîchir manuellement</span>
        </Button>
      )}
      
      <p className="text-xs text-gray-400 mt-4 text-center max-w-xs">
        Si le chargement persiste, essayez de rafraîchir la page ou de vérifier votre connexion Gmail
      </p>
    </div>
  );
};

export default EmailLoading;
