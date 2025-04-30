import React, { useEffect, useState } from 'react';
import { useLeadDetail } from '@/hooks/useLeadDetail';
import { useGmailConnection } from '@/hooks/useGmailConnection';
import { useEmailData } from '@/hooks/useEmailData';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, RefreshCw, AlertCircle, Search, Clock, ArrowDownUp, Plus, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import EmailComposer from '../../mobile/tabs/EmailComposer';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface EmailsTabDesktopProps {
  leadId: string;
}

// Component to display email connection state (when not connected)
const EmailDesktopConnectionState: React.FC<{
  isConnecting: boolean;
  connectGmail: () => void;
  onRetryConnection?: () => void;
}> = ({ isConnecting, connectGmail, onRetryConnection }) => {
  const { user } = useAuth();
  const [redirectedFromCallback, setRedirectedFromCallback] = React.useState<boolean>(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = React.useState<boolean>(false);
  
  // Check for redirection indicators
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hasOAuthSuccess = params.has('oauth_success') || localStorage.getItem('oauth_success') === 'true';
    
    if (hasOAuthSuccess || params.has('state') || localStorage.getItem('oauth_pending') === 'true') {
      setRedirectedFromCallback(true);
      
      // Auto-retry if connection was detected
      if (onRetryConnection) {
        setTimeout(() => {
          onRetryConnection();
        }, 500);
      }
    }
    
    // Clean up indicators
    localStorage.removeItem('oauth_connection_error');
    localStorage.removeItem('oauth_success');
  }, [onRetryConnection]);
  
  const handleConnectClick = () => {
    if (user) {
      // Reset previous OAuth state
      localStorage.removeItem('oauth_connection_error');
      localStorage.removeItem('oauth_pending'); 
      localStorage.removeItem('oauth_success');
      localStorage.removeItem('oauth_cloudflare_error');
      
      // Set pending flag
      localStorage.setItem('oauth_pending', 'true');
      connectGmail();
    }
  };
  
  const handleRetryConnection = () => {
    // Reset previous OAuth state
    localStorage.removeItem('oauth_connection_error');
    localStorage.removeItem('oauth_pending');
    localStorage.removeItem('oauth_success');
    localStorage.removeItem('oauth_cloudflare_error');
    
    // Try connection refresh
    if (onRetryConnection) {
      onRetryConnection();
    }
  };
  
  const handleForceReload = () => {
    // Clear OAuth indicators and force page reload
    localStorage.removeItem('oauth_connection_error');
    localStorage.removeItem('oauth_pending');
    localStorage.removeItem('oauth_success');
    localStorage.removeItem('oauth_cloudflare_error');
    window.location.reload();
  };

  return (
    <div className="p-6 flex flex-col items-center justify-center space-y-4 bg-white rounded-lg border border-gray-100 shadow-sm max-w-2xl mx-auto">
      <div className="bg-loro-pearl/30 rounded-full p-4 border-2 border-loro-terracotta shadow-sm">
        <Mail size={36} className="text-loro-terracotta" />
      </div>
      
      <h3 className="font-semibold text-lg">Connectez votre compte Gmail</h3>
      
      <p className="text-gray-500 text-center max-w-md">
        Pour voir et envoyer des emails liés à ce lead, connectez d'abord votre compte Gmail. 
        Cela permet à l'application de synchroniser les communications par email.
      </p>
      
      {redirectedFromCallback && (
        <Alert className="bg-amber-50 border-amber-200 w-full">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-sm text-amber-800 font-medium">
            Redirection depuis la page d'authentification détectée, mais le processus n'est pas complet.
            <Button 
              onClick={handleForceReload}
              variant="outline" 
              className="mt-2 w-full border-amber-300 bg-amber-50 hover:bg-amber-100 flex items-center justify-center gap-2"
            >
              <RefreshCw className="h-4 w-4" /> Finaliser la connexion
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      <Alert className="bg-blue-50 border-blue-200 w-full">
        <AlertDescription className="text-sm text-blue-800">
          <p className="font-medium mb-2">Important pour l'authentification Gmail:</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Assurez-vous que votre navigateur <strong>autorise les popups</strong> pour ce site</li>
            <li>Utilisez un compte Google avec un accès Gmail complet</li>
            <li>Ne fermez pas la fenêtre popup Google qui s'ouvrira</li>
            <li>Après autorisation, vous serez automatiquement redirigé</li>
          </ol>
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
      
      <button 
        onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
        className="text-blue-500 underline text-xs mt-4"
      >
        {showTechnicalDetails ? "Masquer" : "Afficher"} les informations techniques
      </button>
      
      {showTechnicalDetails && (
        <div className="text-left mt-2 bg-gray-50 p-3 rounded text-xs w-full">
          <p className="font-medium mb-1">Infos techniques:</p>
          <ul className="space-y-1">
            <li><strong>URL:</strong> {window.location.href}</li>
            <li><strong>Référent:</strong> {document.referrer || 'Non disponible'}</li>
            <li><strong>oauth_pending:</strong> {localStorage.getItem('oauth_pending') || 'Non'}</li>
            <li><strong>oauth_success:</strong> {localStorage.getItem('oauth_success') || 'Non'}</li>
            <li><strong>Query params:</strong> {window.location.search || 'Aucun'}</li>
          </ul>
        </div>
      )}
    </div>
  );
};

// Loading component
const EmailDesktopLoading: React.FC<{onManualRefresh?: () => void}> = ({onManualRefresh}) => {
  return (
    <div className="flex flex-col space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-40" />
        </div>
        <div className="flex space-x-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-9" />
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 w-9" />
      </div>
      
      <div className="space-y-3">
        {Array(5).fill(0).map((_, i) => (
          <div key={i} className="border rounded-md p-3">
            <div className="flex justify-between">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-4 w-full mt-2" />
            <Skeleton className="h-4 w-2/3 mt-1" />
          </div>
        ))}
      </div>
      
      {onManualRefresh && (
        <Button 
          onClick={onManualRefresh}
          variant="outline" 
          className="mt-4 w-full max-w-xs mx-auto flex items-center justify-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Réessayer le chargement</span>
        </Button>
      )}
    </div>
  );
};

// Email list component 
const EmailDesktopList: React.FC<{
  emails: any[],
  filteredEmails: any[],
  connectedEmail: string | null,
  isRefreshing: boolean,
  searchTerm: string,
  sortOrder: string,
  syncEmailsWithGmail: () => void,
  sendNewEmail: () => void,
  setSearchTerm: (term: string) => void,
  toggleSortOrder: () => void,
  formatDate: (date: string) => string,
}> = ({
  emails,
  filteredEmails,
  connectedEmail,
  isRefreshing,
  searchTerm,
  sortOrder,
  syncEmailsWithGmail,
  sendNewEmail,
  setSearchTerm,
  toggleSortOrder,
  formatDate
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-loro-navy">Emails</h2>
          {connectedEmail && (
            <p className="text-sm text-gray-500">
              Connecté avec: {connectedEmail}
            </p>
          )}
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={syncEmailsWithGmail}
            disabled={isRefreshing}
            className="flex items-center gap-1 text-sm"
          >
            {isRefreshing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Synchronisation...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Synchroniser
              </>
            )}
          </Button>
          <Button
            onClick={sendNewEmail}
            size="sm"
            className="flex items-center gap-1 text-sm bg-loro-navy hover:bg-loro-navy/90"
          >
            <Plus className="h-4 w-4" />
            Nouveau
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher dans les emails..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          title="Trier par date"
          onClick={toggleSortOrder}
        >
          <ArrowDownUp className="h-4 w-4" />
        </Button>
      </div>

      {emails.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500 mb-2">Aucun email trouvé pour ce lead</p>
          <Button
            variant="outline"
            size="sm"
            onClick={syncEmailsWithGmail}
            className="mx-auto mt-2"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Synchroniser les emails
          </Button>
        </Card>
      ) : filteredEmails.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500">Aucun résultat pour cette recherche</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredEmails.map((email) => (
            <Card key={email.id} className="p-3 cursor-pointer hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-loro-navy line-clamp-1">
                    {email.subject || "(Pas de sujet)"}
                  </h3>
                  <div className="flex items-center text-xs text-gray-500 mt-0.5">
                    <span className="font-medium">{email.from}</span>
                    <span className="mx-1">→</span>
                    <span>{email.to}</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <Badge
                    variant={email.direction === "inbound" ? "outline" : "default"}
                    className={
                      email.direction === "inbound" 
                        ? "text-xs border-blue-300 text-blue-600 bg-blue-50" 
                        : "text-xs bg-green-100 text-green-800 border-green-200"
                    }
                  >
                    {email.direction === "inbound" ? "Reçu" : "Envoyé"}
                  </Badge>
                  <span className="text-xs text-gray-500 flex items-center ml-2">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDate(email.timestamp)}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {email.snippet || email.body}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

const EmailsTabDesktop: React.FC<EmailsTabDesktopProps> = ({ leadId }) => {
  const { lead } = useLeadDetail(leadId);
  const location = useLocation();
  const [showRefreshAlert, setShowRefreshAlert] = useState(false);
  const [initialAuthCheckComplete, setInitialAuthCheckComplete] = useState(false);
  const [authCounter, setAuthCounter] = useState(0);

  // Check for auth indicators
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const hasOAuthSuccess = params.has('oauth_success');
    const hasStateParam = params.has('state');
    const storedSuccess = localStorage.getItem('oauth_success') === 'true';
    
    if (hasOAuthSuccess || storedSuccess || hasStateParam) {
      setShowRefreshAlert(true);
      
      if (storedSuccess) {
        localStorage.removeItem('oauth_success');
      }
    }
    
    setInitialAuthCheckComplete(true);
  }, [location.search]);

  const {
    isConnected,
    isLoading,
    connectedEmail,
    isConnecting,
    connectionError,
    googleAuthURL,
    checkingConnection,
    connectGmail,
    retryConnection,
    checkSupabaseEdgeFunctionStatus,
    forceAuthCheck
  } = useGmailConnection(leadId);

  const {
    emails,
    filteredEmails,
    isRefreshing,
    searchTerm,
    sortOrder,
    showComposer,
    setSearchTerm,
    setShowComposer,
    syncEmailsWithGmail,
    sendNewEmail,
    handleEmailSent,
    formatDate,
    toggleSortOrder
  } = useEmailData(leadId, lead?.email, isConnected);

  // Force connection check when auth success is detected
  useEffect(() => {
    const checkForAuthSuccess = () => {
      const params = new URLSearchParams(location.search);
      const hasOAuthSuccess = params.has('oauth_success') || params.get('oauth_success') === 'true';
      const storedSuccess = localStorage.getItem('oauth_success') === 'true';
      
      if ((initialAuthCheckComplete && showRefreshAlert) || 
          hasOAuthSuccess || storedSuccess) {
        console.log("Forcing auth check due to detected success indicators");
        // Clear the success indicator
        localStorage.removeItem('oauth_success');
        forceAuthCheck();
        
        setAuthCounter(prev => prev + 1);
        
        // If we've tried multiple times and still not connected, force reload
        if (authCounter > 0) {
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
      }
    };
    
    checkForAuthSuccess();
    
    // Set timer to check again after delay
    const timer = setTimeout(checkForAuthSuccess, 1000);
    return () => clearTimeout(timer);
  }, [initialAuthCheckComplete, showRefreshAlert, location.search, forceAuthCheck, authCounter]);

  const handleManualRefresh = () => {
    setShowRefreshAlert(false);
    
    // Clear all OAuth indicators
    localStorage.removeItem('oauth_pending');
    localStorage.removeItem('oauth_success');
    localStorage.removeItem('oauth_connection_error');
    localStorage.removeItem('oauth_cloudflare_error');
    
    // Force connection check and reload
    forceAuthCheck();
    setTimeout(() => {
      window.location.reload();
    }, 300);
  };

  if (isLoading || checkingConnection) {
    return (
      <div>
        <EmailDesktopLoading onManualRefresh={handleManualRefresh} />
        {showRefreshAlert && (
          <Alert className="mt-4 bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-blue-700">
              Connexion détectée ! Vérification en cours...
              <Button 
                onClick={handleManualRefresh} 
                variant="outline" 
                className="mt-2 w-full border-blue-300 bg-blue-50 hover:bg-blue-100 flex items-center justify-center gap-2"
              >
                <RefreshCw className="h-4 w-4" /> Rafraîchir maintenant
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

  if (!isConnected) {
    return (
      <EmailDesktopConnectionState
        isConnecting={isConnecting}
        connectGmail={connectGmail}
        onRetryConnection={retryConnection}
      />
    );
  }

  if (showComposer) {
    return (
      <div className="h-full flex flex-col">
        <EmailComposer 
          leadId={leadId} 
          leadEmail={lead?.email || null}
          onCancel={() => setShowComposer(false)}
          onSent={handleEmailSent}
        />
      </div>
    );
  }

  return (
    <>
      {showRefreshAlert && (
        <Alert className="mb-4 bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-blue-700">
            Connexion réussie ! Si les emails ne s'affichent pas correctement, veuillez rafraîchir.
            <Button 
              onClick={handleManualRefresh} 
              variant="outline" 
              className="mt-2 w-full border-blue-300 bg-blue-50 hover:bg-blue-100 flex items-center justify-center gap-2"
            >
              <RefreshCw className="h-4 w-4" /> Rafraîchir maintenant
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      <EmailDesktopList
        emails={emails}
        filteredEmails={filteredEmails}
        connectedEmail={connectedEmail}
        isRefreshing={isRefreshing}
        searchTerm={searchTerm}
        sortOrder={sortOrder}
        syncEmailsWithGmail={syncEmailsWithGmail}
        sendNewEmail={sendNewEmail}
        setSearchTerm={setSearchTerm}
        toggleSortOrder={toggleSortOrder}
        formatDate={formatDate}
      />
    </>
  );
};

export default EmailsTabDesktop;
