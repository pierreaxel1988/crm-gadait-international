
import React, { useEffect } from 'react';
import { useLeadDetail } from '@/hooks/useLeadDetail';
import { useGmailConnection } from '@/hooks/useGmailConnection';
import { useEmailData } from '@/hooks/useEmailData';
import EmailLoading from './email-components/EmailLoading';
import EmailConnectionState from './email-components/EmailConnectionState';
import EmailConnectionError from './email-components/EmailConnectionError';
import EmailList from './email-components/EmailList';
import EmailComposer from './EmailComposer';

interface EmailsTabProps {
  leadId: string;
}

const EmailsTab: React.FC<EmailsTabProps> = ({
  leadId
}) => {
  const { lead } = useLeadDetail(leadId);

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

  // Check for connection refused error in the URL
  useEffect(() => {
    // Check if the URL contains a Google connection error
    if (window.location.href.includes('accounts.google.com')) {
      const urlText = window.location.href;
      
      // Create a detailed error object
      const refusedErrorInfo = {
        type: 'connection_refused',
        message: 'accounts.google.com refused to connect',
        url: window.location.href,
        timestamp: new Date().toISOString()
      };
      
      // Store this in localStorage for debugging
      localStorage.setItem('gmail_connection_error', JSON.stringify(refusedErrorInfo));
      
      // Clean up the URL if possible
      if (window.history && window.history.replaceState) {
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }
    }
  }, []);

  if (isLoading || checkingConnection) {
    return <EmailLoading />;
  }

  // Check for the specific "refused to connect" error
  const hasConnectionRefusedError = 
    connectionError?.includes('refused to connect') || 
    JSON.stringify(detailedErrorInfo)?.includes('refused to connect') ||
    localStorage.getItem('gmail_connection_error') !== null;

  if (hasConnectionRefusedError) {
    // Get the stored error details if available
    let storedErrorInfo = null;
    try {
      const storedError = localStorage.getItem('gmail_connection_error');
      if (storedError) {
        storedErrorInfo = JSON.parse(storedError);
        // Clear it after reading
        localStorage.removeItem('gmail_connection_error');
      }
    } catch (e) {
      console.error('Error parsing stored connection error:', e);
    }

    // Use the stored error info or create a default one
    const refusedError = {
      error: 'connection_refused',
      message: 'Google a refusé la connexion. Cela peut être dû aux cookies tiers bloqués dans votre navigateur.',
      details: storedErrorInfo || 'accounts.google.com refused to connect'
    };

    return (
      <EmailConnectionError
        connectionError="Google a refusé la connexion"
        detailedErrorInfo={refusedError}
        googleAuthURL={googleAuthURL}
        retryConnection={retryConnection}
        checkSupabaseEdgeFunctionStatus={checkSupabaseEdgeFunctionStatus}
        connectGmail={connectGmail}
        isConnecting={isConnecting}
      />
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
