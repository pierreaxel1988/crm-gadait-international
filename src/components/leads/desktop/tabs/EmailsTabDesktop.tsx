
import React, { useEffect, useState } from 'react';
import { useLeadDetail } from '@/hooks/useLeadDetail';
import { useGmailConnection } from '@/hooks/useGmailConnection';
import { useEmailData } from '@/hooks/useEmailData';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, RefreshCw, AlertCircle, Search, Clock, ArrowDownUp, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import EmailComposer from '../../../components/leads/mobile/tabs/EmailComposer';

interface EmailsTabDesktopProps {
  leadId: string;
}

// Composant pour afficher l'état de connexion Gmail (non connecté ou erreur)
const EmailConnectionState: React.FC<{
  isConnecting: boolean;
  connectGmail: () => void;
  onRetryConnection?: () => void;
}> = ({ isConnecting, connectGmail, onRetryConnection }) => {
  return (
    <div className="p-6 flex flex-col items-center justify-center space-y-4 bg-white rounded-lg border border-gray-100 shadow-sm">
      <div className="bg-loro-pearl/30 rounded-full p-4 border-2 border-loro-terracotta shadow-sm">
        <Search className="h-8 w-8 text-loro-terracotta" />
      </div>
      <h3 className="font-semibold text-lg">Connectez votre compte Gmail</h3>
      <p className="text-gray-500 text-center max-w-md">
        Pour voir et envoyer des emails liés à ce lead, connectez d'abord votre compte Gmail. 
        Cela permet à l'application de synchroniser les communications par email.
      </p>
      
      <Alert className="bg-blue-50 border-blue-200 mb-4 max-w-lg">
        <AlertDescription className="text-sm text-blue-800">
          <p className="font-medium mb-2">Important pour l'authentification Gmail:</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Assurez-vous que votre navigateur <strong>autorise les popups</strong> pour ce site</li>
            <li>Utilisez un compte Google avec un accès Gmail complet</li>
            <li>Après autorisation, vous serez automatiquement redirigé vers cette page</li>
          </ol>
        </AlertDescription>
      </Alert>
      
      <div className="w-full max-w-md">
        <Button 
          onClick={connectGmail} 
          disabled={isConnecting}
          className="w-full py-6 flex items-center justify-center gap-2 text-white shadow-md rounded-md bg-loro-terracotta hover:bg-loro-terracotta/90"
        >
          {isConnecting ? (
            <>
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span className="font-medium">Connexion en cours...</span>
            </>
          ) : (
            <>
              <Search className="h-5 w-5" />
              <span className="font-medium">Connecter Gmail</span>
            </>
          )}
        </Button>
        
        {onRetryConnection && (
          <Button 
            onClick={onRetryConnection}
            variant="outline"
            className="w-full mt-2 flex items-center justify-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Rafraîchir la connexion</span>
          </Button>
        )}
      </div>
    </div>
  );
};

// Composant pour afficher les erreurs de connexion
const EmailConnectionError: React.FC<{
  connectionError: string;
  detailedErrorInfo?: any;
  googleAuthURL?: string | null;
  retryConnection: () => void;
  connectGmail: () => void;
  isConnecting: boolean;
  checkSupabaseEdgeFunctionStatus?: () => void;
}> = ({ 
  connectionError, 
  detailedErrorInfo, 
  retryConnection, 
  connectGmail, 
  isConnecting 
}) => {
  return (
    <div className="p-6 bg-white rounded-lg border border-red-100 shadow-sm">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="bg-red-50 rounded-full p-4 border-2 border-red-300">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="font-semibold text-lg text-red-700">Problème de connexion Gmail</h3>
        <p className="text-gray-600 text-center max-w-lg">
          Une erreur s'est produite lors de la tentative de connexion à Gmail. 
          Veuillez réessayer ou contacter le support si le problème persiste.
        </p>
        
        <Alert className="bg-red-50 border-red-200 w-full max-w-lg">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription>
            <p className="font-medium text-red-800">{connectionError}</p>
            {detailedErrorInfo && (
              <p className="text-sm text-red-700 mt-1">{detailedErrorInfo.helpMessage || 'Détails non disponibles'}</p>
            )}
          </AlertDescription>
        </Alert>
        
        <div className="flex flex-col w-full max-w-md space-y-2">
          <Button 
            onClick={retryConnection}
            variant="outline" 
            className="w-full border-red-300 bg-red-50 hover:bg-red-100 text-red-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer la connexion
          </Button>
          <Button 
            onClick={connectGmail} 
            disabled={isConnecting}
            className="w-full bg-loro-terracotta hover:bg-loro-terracotta/90"
          >
            {isConnecting ? "Connexion en cours..." : "Nouvelle tentative de connexion"}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Composant principal pour l'onglet Emails en desktop
const EmailsTabDesktop: React.FC<EmailsTabDesktopProps> = ({ leadId }) => {
  const { lead } = useLeadDetail(leadId);
  const [forceReload, setForceReload] = useState(0);
  const [showRefreshAlert, setShowRefreshAlert] = useState(false);

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
    retryConnection
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

  // Effect pour vérifier si on vient d'une authentification réussie
  useEffect(() => {
    const oauthSuccess = localStorage.getItem('oauth_success') === 'true';
    
    if (oauthSuccess) {
      console.log("Succès OAuth détecté dans localStorage");
      localStorage.removeItem('oauth_success');
      setForceReload(prev => prev + 1);
      setShowRefreshAlert(true);
      
      toast({
        title: "Authentification réussie",
        description: "Votre compte Gmail a été connecté avec succès."
      });
    }
  }, []);

  // Forcer la vérification de connexion lorsque forceReload change
  useEffect(() => {
    if (forceReload > 0) {
      retryConnection();
    }
  }, [forceReload, retryConnection]);

  const handleManualRefresh = () => {
    setForceReload(prev => prev + 1);
    setShowRefreshAlert(false);
    
    // Efface tous les indicateurs OAuth
    localStorage.removeItem('oauth_pending');
    localStorage.removeItem('oauth_success');
    localStorage.removeItem('oauth_connection_error');
    
    window.location.reload();
  };

  if (isLoading || checkingConnection) {
    return (
      <div className="p-6 bg-white rounded-lg">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="flex flex-col items-center">
            <RefreshCw className="h-10 w-10 animate-spin text-loro-hazel mb-4" />
            <h3 className="text-lg font-semibold mb-2">Vérification de la connexion Gmail</h3>
            <p className="text-gray-500 mb-4">Veuillez patienter pendant que nous vérifions votre connexion...</p>
            <div className="w-full max-w-md space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-3/4" />
            </div>
          </div>
        </div>
        
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

  if (connectionError) {
    return (
      <EmailConnectionError
        connectionError={connectionError}
        detailedErrorInfo={detailedErrorInfo}
        googleAuthURL={googleAuthURL}
        retryConnection={retryConnection}
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
      <div className="h-full bg-white rounded-lg">
        <EmailComposer 
          leadId={leadId} 
          leadEmail={lead?.email || null}
          onCancel={() => setShowComposer(false)}
          onSent={handleEmailSent}
        />
      </div>
    );
  }

  // Affichage des emails pour la version desktop
  return (
    <div className="bg-white rounded-lg p-4">
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
      
      {/* Barre d'actions et recherche */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-3">
        <div className="flex-1 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Rechercher dans les emails..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button
            onClick={syncEmailsWithGmail}
            variant="outline"
            disabled={isRefreshing}
            className="flex-1 md:flex-none"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Synchronisation...' : 'Synchroniser'}
          </Button>
          
          <Button
            onClick={toggleSortOrder}
            variant="outline"
            className="flex-1 md:flex-none"
          >
            <ArrowDownUp className="h-4 w-4 mr-2" />
            {sortOrder === 'asc' ? 'Plus ancien' : 'Plus récent'}
          </Button>
          
          <Button 
            onClick={sendNewEmail}
            className="bg-loro-terracotta hover:bg-loro-terracotta/90 flex-1 md:flex-none"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvel email
          </Button>
        </div>
      </div>
      
      {/* Information sur la connexion */}
      <div className="rounded-lg bg-gray-50 p-2 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
            Connecté
          </Badge>
          <span className="text-sm text-gray-600">
            {connectedEmail}
          </span>
        </div>
      </div>
      
      {/* Liste des emails */}
      <div className="space-y-3">
        {filteredEmails.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Clock className="mx-auto h-12 w-12 text-gray-400 mb-2" />
            <h3 className="text-lg font-medium text-gray-700 mb-1">Aucun email trouvé</h3>
            <p className="text-gray-500 mb-4">
              {emails.length > 0
                ? "Aucun résultat ne correspond à votre recherche."
                : "Synchronisez pour voir les emails échangés avec ce lead."}
            </p>
            <Button 
              onClick={syncEmailsWithGmail}
              variant="outline"
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Synchroniser les emails
            </Button>
          </div>
        ) : (
          filteredEmails.map((email) => (
            <Card key={email.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-medium">{email.is_sent ? `À: ${email.recipient}` : `De: ${email.sender}`}</div>
                  <div className="text-lg font-medium">{email.subject || '(Sans objet)'}</div>
                </div>
                <div className="text-sm text-gray-500">
                  {formatDate(email.date)}
                </div>
              </div>
              <div className="text-gray-600 line-clamp-2">{email.snippet}</div>
              {email.is_sent && (
                <Badge className="mt-2 bg-blue-50 text-blue-600 border-blue-100">
                  Envoyé
                </Badge>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default EmailsTabDesktop;
