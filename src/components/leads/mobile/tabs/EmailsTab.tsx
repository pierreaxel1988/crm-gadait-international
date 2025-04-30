
import React, { useEffect, useState } from 'react';
import { useLeadDetail } from '@/hooks/useLeadDetail';
import { useGmailConnection } from '@/hooks/useGmailConnection';
import { useEmailData } from '@/hooks/useEmailData';
import EmailLoading from './email-components/EmailLoading';
import EmailConnectionState from './email-components/EmailConnectionState';
import EmailConnectionError from './email-components/EmailConnectionError';
import EmailList from './email-components/EmailList';
import EmailComposer from './EmailComposer';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, RefreshCw, AlertCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface EmailsTabProps {
  leadId: string;
}

const EmailsTab: React.FC<EmailsTabProps> = ({
  leadId
}) => {
  const { lead } = useLeadDetail(leadId);
  const location = useLocation();
  const [showRefreshAlert, setShowRefreshAlert] = useState(false);
  const [cloudflareError, setCloudflareError] = useState(false);
  const [initialAuthCheckComplete, setInitialAuthCheckComplete] = useState(false);
  const [authCounter, setAuthCounter] = useState(0);

  // Observe URL parameters and localStorage for authentication indicators
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const hasOAuthSuccess = params.has('oauth_success');
    const hasStateParam = params.has('state');
    const storedSuccess = localStorage.getItem('oauth_success') === 'true';
    const cloudflareErr = localStorage.getItem('oauth_cloudflare_error') === 'true';
    
    console.log("Checking auth indicators on mount:", {
      urlOAuthSuccess: hasOAuthSuccess,
      urlStateParam: hasStateParam,
      storedSuccess,
      cloudflareError: cloudflareErr,
      searchParams: location.search
    });
    
    if (hasOAuthSuccess || storedSuccess || hasStateParam) {
      console.log("Auth success detected, showing refresh alert");
      setShowRefreshAlert(true);
      
      if (storedSuccess) {
        // Clear the success flag to prevent showing the alert on subsequent page loads
        localStorage.removeItem('oauth_success');
      }
      
      // Don't show a toast every time - it's annoying
      if (!initialAuthCheckComplete) {
        toast({
          title: "Authentification détectée",
          description: "Vérification de la connexion Gmail..."
        });
      }
    }
    
    if (cloudflareErr) {
      console.log("Cloudflare error detected");
      localStorage.removeItem('oauth_cloudflare_error');
      setCloudflareError(true);
    }
    
    setInitialAuthCheckComplete(true);
  }, [location.search, initialAuthCheckComplete]);

  const {
    isConnected,
    isLoading,
    connectedEmail,
    isConnecting,
    connectionError,
    detailedErrorInfo,
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
        
        // Increment our counter to track how many retries we've done
        setAuthCounter(prev => prev + 1);
        
        // If we've tried more than once and still not connected, force a page reload
        if (authCounter > 0) {
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
      }
    };
    
    checkForAuthSuccess();
    
    // Also set up a timer to check again after a delay
    const timer = setTimeout(checkForAuthSuccess, 1000);
    return () => clearTimeout(timer);
  }, [initialAuthCheckComplete, showRefreshAlert, location.search, forceAuthCheck, authCounter]);

  const handleManualRefresh = () => {
    setShowRefreshAlert(false);
    setCloudflareError(false);
    
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
        <EmailLoading onManualRefresh={handleManualRefresh} />
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

  if (cloudflareError) {
    return (
      <div className="p-4">
        <Alert className="mb-4 bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            <p className="font-medium mb-2">Erreur détectée lors de l'authentification</p>
            <p className="text-sm mb-2">Une erreur Cloudflare (1101) s'est produite lors de la tentative de connexion à Gmail. Cette erreur est souvent temporaire.</p>
            <Button 
              onClick={handleManualRefresh} 
              variant="outline" 
              className="mt-2 w-full border-red-300 bg-red-50 hover:bg-red-100 flex items-center justify-center gap-2"
            >
              <RefreshCw className="h-4 w-4" /> Réessayer maintenant
            </Button>
          </AlertDescription>
        </Alert>
        
        <EmailConnectionState
          isConnecting={isConnecting}
          connectGmail={connectGmail}
          onRetryConnection={retryConnection}
        />
      </div>
    );
  }

  if (connectionError) {
    return (
      <EmailConnectionError
        connectionError={connectionError}
        detailedErrorInfo={detailedErrorInfo}
        googleAuthURL={googleAuthURL}
        retryConnection={retryConnection}
        checkSupabaseEdgeFunctionStatus={checkSupabaseEdgeFunctionStatus}
        connectGmail={connectGmail}
        isConnecting={isConnecting}
      />
    );
  }

  if (!isConnected) {
    return (
      <EmailConnectionState
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
      
      <EmailList
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

export default EmailsTab;
