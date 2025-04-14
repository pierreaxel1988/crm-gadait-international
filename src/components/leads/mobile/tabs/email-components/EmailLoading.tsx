
import React from 'react';
import { Loader2, Mail, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EmailLoadingProps {
  onManualRefresh?: () => void;
}

const EmailLoading: React.FC<EmailLoadingProps> = ({ onManualRefresh }) => {
  const [showAutoRefreshHelp, setShowAutoRefreshHelp] = React.useState(false);
  const [showRedirectHelp, setShowRedirectHelp] = React.useState(false);
  const [hasDetectedRedirect, setHasDetectedRedirect] = React.useState(false);
  
  // Vérifier si on vient d'une redirection OAuth
  React.useEffect(() => {
    // Vérifier dans l'historique de navigation
    const referrer = document.referrer;
    if (referrer && (
      referrer.includes('oauth/callback') || 
      referrer.includes('accounts.google.com') ||
      localStorage.getItem('oauth_success') === 'true'
    )) {
      setHasDetectedRedirect(true);
      // Auto-refresh après une redirection
      if (onManualRefresh) {
        const timer = setTimeout(() => {
          onManualRefresh();
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [onManualRefresh]);
  
  // Afficher un message d'aide supplémentaire si le chargement prend plus de temps
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowAutoRefreshHelp(true);
    }, 5000);
    
    const redirectTimer = setTimeout(() => {
      setShowRedirectHelp(true);
    }, 10000);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(redirectTimer);
    };
  }, []);
  
  return (
    <div className="p-8 flex flex-col items-center justify-center h-60">
      <div className="bg-loro-pearl/30 rounded-full p-3 mb-4">
        <Mail className="h-6 w-6 text-loro-terracotta/70" />
      </div>
      <Loader2 className="h-8 w-8 text-loro-terracotta animate-spin mb-2" />
      <p className="text-sm text-gray-500">Chargement des emails...</p>
      <p className="text-xs text-gray-400 mt-1">Veuillez patienter</p>
      
      {hasDetectedRedirect && (
        <Alert className="mt-4 bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-blue-700">
            <p className="font-medium mb-1">Redirection détectée</p>
            <p>Vous avez été redirigé depuis la page d'authentification Google. Nous essayons de finaliser la connexion...</p>
          </AlertDescription>
        </Alert>
      )}
      
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
      
      {showAutoRefreshHelp && (
        <div className="text-xs text-amber-600 mt-4 text-center max-w-xs bg-amber-50 p-3 rounded-md border border-amber-200">
          <p className="font-medium mb-1">Le chargement prend plus de temps que prévu</p>
          <p>Si vous venez de vous connecter à Gmail, nous vous recommandons de rafraîchir la page.</p>
        </div>
      )}
      
      {showRedirectHelp && !hasDetectedRedirect && (
        <div className="text-xs text-blue-600 mt-4 text-center max-w-xs bg-blue-50 p-3 rounded-md border border-blue-200">
          <p className="font-medium mb-1">Problème potentiel de redirection</p>
          <p>Si vous avez été redirigé depuis Google après l'authentification, utilisez le bouton ci-dessus pour rafraîchir et terminer la connexion.</p>
        </div>
      )}
      
      <p className="text-xs text-gray-400 mt-4 text-center max-w-xs">
        Si le chargement persiste, essayez de rafraîchir la page ou de vérifier votre connexion Gmail
      </p>
    </div>
  );
};

export default EmailLoading;
