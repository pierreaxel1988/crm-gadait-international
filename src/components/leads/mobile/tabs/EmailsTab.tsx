
import React, { useEffect, useState } from 'react';
import { useLeadDetail } from '@/hooks/useLeadDetail';
import { useGmailConnection } from '@/hooks/useGmailConnection';
import { useEmailData } from '@/hooks/useEmailData';
import EmailLoading from './email-components/EmailLoading';
import EmailConnectionState from './email-components/EmailConnectionState';
import EmailConnectionError from './email-components/EmailConnectionError';
import EmailList from './email-components/EmailList';
import EmailComposer from './EmailComposer';
import { Edit, RefreshCw } from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface EmailsTabProps {
  leadId: string;
}

const EmailsTab: React.FC<EmailsTabProps> = ({
  leadId
}) => {
  const { lead } = useLeadDetail(leadId);
  const location = useLocation();
  const [forceReload, setForceReload] = useState(0);

  // Force un rafraîchissement si on détecte un paramètre 'oauth_success' dans l'URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.has('oauth_success')) {
      console.log("Paramètre oauth_success détecté dans l'URL, forçage du rechargement");
      setForceReload(prev => prev + 1);
    }
  }, [location.search]);

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

  // Pour débogage
  useEffect(() => {
    console.log("État de connexion Gmail:", { 
      isConnected, 
      isLoading, 
      checkingConnection, 
      connectedEmail,
      hasConnectionError: !!connectionError,
      forceReloadCounter: forceReload
    });
  }, [isConnected, isLoading, checkingConnection, connectedEmail, connectionError, forceReload]);

  // Force une vérification de la connexion quand forceReload change
  useEffect(() => {
    if (forceReload > 0) {
      retryConnection();
    }
  }, [forceReload]);

  if (isLoading || checkingConnection) {
    return <EmailLoading />;
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
  );
};

export default EmailsTab;
