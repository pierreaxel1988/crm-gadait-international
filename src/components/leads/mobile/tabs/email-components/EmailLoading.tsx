
import React from 'react';
import { Loader2, Mail } from 'lucide-react';

const EmailLoading: React.FC = () => {
  return (
    <div className="p-8 flex flex-col items-center justify-center h-60">
      <div className="bg-loro-pearl/30 rounded-full p-3 mb-4">
        <Mail className="h-6 w-6 text-loro-terracotta/70" />
      </div>
      <Loader2 className="h-8 w-8 text-loro-terracotta animate-spin mb-2" />
      <p className="text-sm text-gray-500">Chargement des emails...</p>
      <p className="text-xs text-gray-400 mt-1">Veuillez patienter</p>
      <p className="text-xs text-gray-400 mt-4 text-center max-w-xs">
        Si le chargement persiste, essayez de rafraîchir la page ou de vérifier votre connexion Gmail
      </p>
    </div>
  );
};

export default EmailLoading;
