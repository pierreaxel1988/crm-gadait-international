
import React from 'react';
import { Loader2, Mail, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';

interface EmailLoadingProps {
  onManualRefresh?: () => void;
}

const EmailLoading: React.FC<EmailLoadingProps> = ({ onManualRefresh }) => {
  const [showAutoRefreshHelp, setShowAutoRefreshHelp] = React.useState(false);
  const [showRedirectHelp, setShowRedirectHelp] = React.useState(false);
  const [hasDetectedRedirect, setHasDetectedRedirect] = React.useState(false);
  const [hasRefreshed, setHasRefreshed] = React.useState(false);
  
  // Vérifier si on vient d'une redirection OAuth
  React.useEffect(() => {
    // Sources d'information pour détecter une redirection OAuth
    const referrer = document.referrer;
    const oauthSuccess = localStorage.getItem('oauth_success') === 'true';
    const params = new URLSearchParams(window.location.search);
    const urlSuccess = params.has('oauth_success');
    const connectedEmail = localStorage.getItem('oauth_email');
    
    // Si une des sources indique une redirection OAuth
    if ((referrer && (
        referrer.includes('oauth/callback') || 
        referrer.includes('accounts.google.com')
      )) || 
      oauthSuccess || 
      urlSuccess
    ) {
      console.log("Redirection OAuth détectée:", {
        fromReferrer: referrer,
        fromLocalStorage: oauthSuccess,
        fromURL: urlSuccess,
        email: connectedEmail
      });
      
      setHasDetectedRedirect(true);
      
      // Notifier l'utilisateur de la redirection détectée
      toast({
        title: "Authentification réussie",
        description: connectedEmail 
          ? `Compte Gmail connecté: ${connectedEmail}` 
          : "Connexion à Gmail réussie, finalisation en cours..."
      });
      
      // Auto-refresh immédiat après une redirection
      if (onManualRefresh && !hasRefreshed) {
        setHasRefreshed(true);
        
        // Rafraîchir immédiatement
        onManualRefresh();
        
        // Et une seconde fois après un court délai pour s'assurer que tout est chargé
        const timer = setTimeout(() => {
          onManualRefresh();
        }, 1000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [onManualRefresh, hasRefreshed]);
  
  // Afficher un message d'aide supplémentaire si le chargement prend plus de temps
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowAutoRefreshHelp(true);
    }, 3000);
    
    const redirectTimer = setTimeout(() => {
      setShowRedirectHelp(true);
    }, 8000);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(redirectTimer);
    };
  }, []);
  
  const handleManualRefreshClick = () => {
    if (onManualRefresh) {
      setHasRefreshed(true);
      onManualRefresh();
      
      // Nettoyer les indicateurs OAuth
      localStorage.removeItem('oauth_pending');
      localStorage.removeItem('oauth_success');
      
      toast({
        title: "Rafraîchissement",
        description: "Vérification de la connexion Gmail..."
      });
    }
  };
  
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
            <p className="font-medium mb-1">Authentification détectée</p>
            <p>Vous avez été authentifié sur Google. Finalisation de la connexion...</p>
            {onManualRefresh && (
              <Button 
                onClick={handleManualRefreshClick}
                variant="outline" 
                size="sm"
                className="mt-2 border-blue-300 bg-blue-50 hover:bg-blue-100 w-full"
              >
                <RefreshCw className="h-3 w-3 mr-1" /> Finaliser la connexion
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      {onManualRefresh && !hasDetectedRedirect && (
        <Button 
          onClick={handleManualRefreshClick}
          variant="outline"
          className="mt-6 flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Rafraîchir manuellement</span>
        </Button>
      )}
      
      {showAutoRefreshHelp && !hasDetectedRedirect && (
        <div className="text-xs text-amber-600 mt-4 text-center max-w-xs bg-amber-50 p-3 rounded-md border border-amber-200">
          <p className="font-medium mb-1">Le chargement prend plus de temps que prévu</p>
          <p>Si vous venez de vous connecter à Gmail, essayez de rafraîchir la page.</p>
          {onManualRefresh && (
            <Button 
              onClick={handleManualRefreshClick}
              variant="outline" 
              size="sm"
              className="mt-2 border-amber-300 bg-amber-50 hover:bg-amber-100 w-full"
            >
              <RefreshCw className="h-3 w-3 mr-1" /> Rafraîchir maintenant
            </Button>
          )}
        </div>
      )}
      
      {showRedirectHelp && !hasDetectedRedirect && (
        <div className="text-xs text-blue-600 mt-4 text-center max-w-xs bg-blue-50 p-3 rounded-md border border-blue-200">
          <p className="font-medium mb-1">Problème potentiel de connexion</p>
          <p>Essayez de rafraîchir la page ou forcez un rechargement complet avec le bouton ci-dessous.</p>
          <Button 
            onClick={() => window.location.reload()}
            variant="outline" 
            size="sm"
            className="mt-2 border-blue-300 bg-blue-50 hover:bg-blue-100 w-full"
          >
            <RefreshCw className="h-3 w-3 mr-1" /> Recharger la page
          </Button>
        </div>
      )}
      
      {!hasDetectedRedirect && !showRedirectHelp && !showAutoRefreshHelp && (
        <p className="text-xs text-gray-400 mt-4 text-center max-w-xs">
          Si le chargement persiste, essayez de rafraîchir la page
        </p>
      )}
    </div>
  );
};

export default EmailLoading;
