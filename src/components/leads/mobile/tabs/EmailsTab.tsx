
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

interface EmailsTabProps {
  leadId: string;
}

const EmailsTab: React.FC<EmailsTabProps> = ({
  leadId
}) => {
  const { lead } = useLeadDetail(leadId);
  const location = useLocation();
  const [forceReload, setForceReload] = useState(0);
  const [showRefreshAlert, setShowRefreshAlert] = useState(false);
  const [cloudflareError, setCloudflareError] = useState(false);

  // Check for oauth_success parameter in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.has('oauth_success')) {
      console.log("Paramètre oauth_success détecté dans l'URL, forçage du rechargement");
      setForceReload(prev => prev + 1);
      setShowRefreshAlert(true);
      
      // Auto-hide refresh alert after 15 seconds
      const timer = setTimeout(() => {
        setShowRefreshAlert(false);
      }, 15000);
      
      return () => clearTimeout(timer);
    }
  }, [location.search]);

  // Also check localStorage for OAuth success flag
  useEffect(() => {
    const oauthSuccess = localStorage.getItem('oauth_success') === 'true';
    const oauthError = localStorage.getItem('oauth_connection_error') === 'true';
    
    if (oauthSuccess) {
      console.log("Succès OAuth détecté dans localStorage");
      localStorage.removeItem('oauth_success');
      setForceReload(prev => prev + 1);
      setShowRefreshAlert(true);
    }
    
    if (oauthError) {
      console.log("Erreur OAuth détectée dans localStorage");
      localStorage.removeItem('oauth_connection_error');
      setCloudflareError(true);
    }
  }, []);

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
    checkSupabaseEdgeFunctionStatus
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

  // For debugging
  useEffect(() => {
    console.log("État de connexion Gmail:", { 
      isConnected, 
      isLoading, 
      checkingConnection, 
      connectedEmail,
      hasConnectionError: !!connectionError,
      forceReloadCounter: forceReload,
      cloudflareError
    });
  }, [isConnected, isLoading, checkingConnection, connectedEmail, connectionError, forceReload, cloudflareError]);

  // Force connection check when forceReload changes
  useEffect(() => {
    if (forceReload > 0) {
      retryConnection();
    }
  }, [forceReload]);

  const handleManualRefresh = () => {
    setForceReload(prev => prev + 1);
    setShowRefreshAlert(false);
    setCloudflareError(false);
    window.location.reload();
  };

  if (isLoading || checkingConnection) {
    return (
      <div>
        <EmailLoading onManualRefresh={handleManualRefresh} />
        {showRefreshAlert && (
          <Alert className="mt-4 bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-blue-700">
              Connexion réussie ! Si les emails ne s'affichent pas automatiquement, veuillez rafraîchir.
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
