import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { 
  Mail, 
  ExternalLink, 
  Clock, 
  Send, 
  RefreshCw, 
  AlertCircle, 
  ChevronDown, 
  Info,
  Search,
  ArrowUp,
  ArrowDown,
  Edit
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useLeadDetail } from '@/hooks/useLeadDetail';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import EmailComposer from './EmailComposer';

interface EmailConnectionProps {
  leadId: string;
}

interface EmailConnection {
  email: string;
  id: string;
}

interface LeadEmail {
  id: string;
  lead_id: string;
  date: string;
  subject: string | null;
  snippet: string | null;
  is_sent: boolean;
  gmail_message_id: string;
  sender?: string;
  recipient?: string;
  body_text?: string;
  body_html?: string;
}

const EmailsTab: React.FC<EmailConnectionProps> = ({
  leadId
}) => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [emails, setEmails] = useState<LeadEmail[]>([]);
  const [filteredEmails, setFilteredEmails] = useState<LeadEmail[]>([]);
  const [connectedEmail, setConnectedEmail] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [connectionAttemptCount, setConnectionAttemptCount] = useState(0);
  const [detailedErrorInfo, setDetailedErrorInfo] = useState<any>(null);
  const [googleAuthURL, setGoogleAuthURL] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showComposer, setShowComposer] = useState(false);
  const [checkingConnection, setCheckingConnection] = useState(true);

  const { lead } = useLeadDetail(leadId);

  useEffect(() => {
    const redirectTarget = localStorage.getItem('oauthRedirectTarget');
    if (redirectTarget) {
      console.log('Detected OAuth redirect with target:', redirectTarget);
      
      if (window.history && window.history.replaceState) {
        const cleanUrl = window.location.href.split('?')[0];
        window.history.replaceState({}, document.title, cleanUrl);
      }
      
      localStorage.removeItem('oauthRedirectTarget');
      
      setConnectionAttemptCount(prev => prev + 1);
      
      toast({
        title: "Connection réussie",
        description: "Votre compte Gmail a été connecté avec succès."
      });
    }
  }, []);

  useEffect(() => {
    async function checkEmailConnection() {
      if (!user) return;
      try {
        setCheckingConnection(true);
        setIsLoading(true);
        setConnectionError(null);
        setDetailedErrorInfo(null);
        
        console.log("Vérification de la connexion Gmail pour l'utilisateur:", user.id);
        
        const { data, error } = await supabase
          .from('user_email_connections')
          .select('email, id')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (error) {
          console.error('Erreur lors de la vérification de la connexion:', error);
          setIsConnected(false);
          setConnectionError(`Erreur lors de la vérification de la connexion: ${error.message}`);
          return;
        }
        
        if (data) {
          console.log("Connexion Gmail trouvée:", data.email);
          setIsConnected(true);
          setConnectedEmail((data as EmailConnection).email);
          fetchEmails();
        } else {
          console.log("Aucune connexion Gmail trouvée");
          setIsConnected(false);
        }
      } catch (error) {
        console.error('Erreur dans checkEmailConnection:', error);
        setConnectionError(`Une erreur est survenue: ${(error as Error).message}`);
      } finally {
        setIsLoading(false);
        setCheckingConnection(false);
      }
    }
    
    checkEmailConnection();
  }, [user, leadId, connectionAttemptCount]);

  useEffect(() => {
    if (!emails.length) return;
    
    const filtered = emails.filter(email => {
      const searchIn = `${email.subject || ''} ${email.snippet || ''} ${email.sender || ''} ${email.recipient || ''}`.toLowerCase();
      return searchTerm ? searchIn.includes(searchTerm.toLowerCase()) : true;
    });
    
    const sorted = [...filtered].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
    
    setFilteredEmails(sorted);
  }, [emails, searchTerm, sortOrder]);

  const connectGmail = async () => {
    if (isConnecting) return;
    
    try {
      setIsConnecting(true);
      setConnectionError(null);
      setDetailedErrorInfo(null);
      setGoogleAuthURL(null);
      
      console.log('Démarrage du processus de connexion Gmail pour le lead:', leadId);
      
      if (!user) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Vous devez être connecté pour utiliser cette fonctionnalité."
        });
        return;
      }
      
      const currentPath = window.location.pathname;
      const baseUrl = window.location.origin;
      const redirectUri = `${baseUrl}${currentPath}?tab=emails`;
      
      console.log('Utilisation de la URI de redirection:', redirectUri);
      console.log('ID utilisateur:', user.id);
      
      try {
        const { data, error } = await supabase.functions.invoke('gmail-auth', {
          body: {
            action: 'authorize',
            userId: user.id,
            redirectUri: redirectUri
          }
        });
        
        if (error) {
          console.error('Erreur lors du démarrage de l\'authentification Gmail:', error);
          setConnectionError(`Erreur de démarrage de l'authentification: ${error.message}`);
          setDetailedErrorInfo({
            error: error,
            context: "Invoking gmail-auth function"
          });
          
          toast({
            variant: "destructive",
            title: "Erreur",
            description: "Impossible de démarrer l'authentification Gmail."
          });
          return;
        }
        
        if (!data || !data.authorizationUrl) {
          const errorMsg = "La réponse du serveur ne contient pas d'URL d'autorisation.";
          setConnectionError(errorMsg);
          setDetailedErrorInfo({
            error: errorMsg,
            data: data
          });
          return;
        }
        
        console.log('URL d\'autorisation reçue:', data.authorizationUrl.substring(0, 100) + '...');
        setGoogleAuthURL(data.authorizationUrl);
        
        localStorage.setItem('gmailAuthRedirectFrom', window.location.href);
        
        window.location.href = data.authorizationUrl;
      } catch (invokeError) {
        console.error('Erreur lors de l\'invocation de la fonction gmail-auth:', invokeError);
        setConnectionError(`Erreur d'invocation de la fonction: ${(invokeError as Error).message}`);
        setDetailedErrorInfo({
          error: invokeError,
          context: "Try-catch block for function invocation"
        });
        
        toast({
          variant: "destructive",
          title: "Erreur technique",
          description: "Une erreur s'est produite lors de la connexion à Gmail."
        });
      }
    } catch (error) {
      console.error('Erreur dans connectGmail:', error);
      setConnectionError(`Erreur: ${(error as Error).message}`);
      setDetailedErrorInfo({
        error: error,
        context: "Main try-catch block"
      });
      
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur s'est produite lors de la connexion à Gmail."
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const fetchEmails = async () => {
    if (!user || !leadId) return;
    try {
      setIsRefreshing(true);
      const { data, error } = await supabase
        .from('lead_emails')
        .select('*')
        .eq('lead_id', leadId)
        .eq('user_id', user.id)
        .order('date', { ascending: false });
        
      if (error) {
        console.error('Erreur lors de la récupération des emails:', error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de récupérer les emails."
        });
        return;
      }
      
      console.log(`${data?.length || 0} emails récupérés pour le lead ${leadId}`);
      setEmails(data || []);
      setFilteredEmails(data || []);
    } catch (error) {
      console.error('Erreur dans fetchEmails:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const syncEmailsWithGmail = async () => {
    if (!user || !leadId || !lead?.email) return;
    try {
      setIsRefreshing(true);
      
      console.log(`Synchronisation des emails pour le lead ${leadId} avec l'adresse ${lead.email}`);
      
      const { data, error } = await supabase.functions.invoke('gmail-sync', {
        body: {
          leadId,
          leadEmail: lead.email
        }
      });
      
      if (error) {
        console.error('Erreur lors de la synchronisation des emails:', error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de synchroniser les emails avec Gmail."
        });
        return;
      }
      
      console.log('Résultat de la synchronisation:', data);
      
      toast({
        title: "Synchronisation réussie",
        description: `${data.newEmails || 0} nouveaux emails trouvés.`
      });
      
      fetchEmails();
    } catch (error) {
      console.error('Erreur dans syncEmailsWithGmail:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const sendNewEmail = () => {
    setShowComposer(true);
  };

  const handleEmailSent = () => {
    setShowComposer(false);
    setTimeout(() => {
      fetchEmails();
    }, 500);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const retryConnection = () => {
    setConnectionAttemptCount(prev => prev + 1);
  };

  const checkSupabaseEdgeFunctionStatus = () => {
    window.open('https://status.supabase.com', '_blank');
  };

  if (isLoading || checkingConnection) {
    return <div className="p-4 flex flex-col items-center justify-center h-40">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-loro-hazel"></div>
      <p className="mt-2 text-sm text-gray-500">Chargement...</p>
    </div>;
  }

  if (connectionError) {
    return <div className="p-4 flex flex-col space-y-4">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erreur de connexion</AlertTitle>
        <AlertDescription>
          {connectionError}
        </AlertDescription>
      </Alert>
      
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="details">
          <AccordionTrigger className="text-sm font-medium">
            <div className="flex items-center gap-1">
              <Info className="h-3.5 w-3.5" />
              Informations techniques
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="bg-gray-100 p-2 rounded text-xs font-mono whitespace-pre-wrap">
              {detailedErrorInfo ? JSON.stringify(detailedErrorInfo, null, 2) : "Aucune information détaillée disponible"}
            </div>
            <p className="text-xs mt-2 text-gray-500">Ces informations peuvent être utiles pour le support technique.</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      {googleAuthURL && (
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-500" />
          <AlertTitle className="text-blue-700">Lien direct disponible</AlertTitle>
          <AlertDescription className="text-blue-600">
            Vous pouvez essayer d'ouvrir le lien d'autorisation directement ci-dessous :
            <div className="mt-2">
              <Button 
                onClick={() => window.open(googleAuthURL, '_blank')}
                variant="outline" 
                className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                <ExternalLink className="mr-2 h-4 w-4" /> Ouvrir le lien d'autorisation
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      <Button 
        onClick={retryConnection} 
        variant="outline" 
        className="w-full mt-4"
      >
        <RefreshCw className="mr-2 h-4 w-4" /> Rafraîchir la connexion
      </Button>
      
      <Button 
        onClick={checkSupabaseEdgeFunctionStatus}
        variant="outline"
        className="w-full"
      >
        <Info className="mr-2 h-4 w-4" /> Vérifier le statut des serveurs
      </Button>
      
      <div className="bg-loro-pearl/30 rounded-lg p-4 text-sm">
        <p className="font-medium mb-2">Conseils de dépannage:</p>
        <ul className="list-disc pl-5 space-y-1 text-gray-600">
          <li>Vérifiez que votre projet Google est correctement configuré dans la <a href="https://console.cloud.google.com/apis/credentials" target="_blank" className="text-loro-chocolate underline">Console Google Cloud</a></li>
          <li>Assurez-vous que l'URI de redirection autorisée dans la console Google est: <code className="bg-gray-100 p-1 rounded text-xs">https://success.gadait-international.com/oauth/callback</code></li>
          <li>Vérifiez que le client ID et le client secret sont corrects</li>
          <li>Assurez-vous que l'API Gmail est activée dans la <a href="https://console.cloud.google.com/apis/library" target="_blank" className="text-loro-chocolate underline">bibliothèque d'API Google</a></li>
          <li>Assurez-vous que l'application est de type <strong>Application Web</strong></li>
          <li><strong>Important:</strong> Vérifiez que l'erreur 403 n'est pas due à des restrictions sur votre compte Google. Si vous utilisez Google Workspace, contactez votre administrateur</li>
          <li>Assurez-vous que le compte Google utilisé a l'autorisation d'accéder à l'API Gmail</li>
          <li>Vérifiez que les cookies tiers sont autorisés dans votre navigateur</li>
          <li>Essayez d'utiliser une fenêtre de navigation privée</li>
          <li>Si le problème persiste, essayez de vous déconnecter de tous vos comptes Google et reconnectez-vous uniquement avec le compte que vous souhaitez utiliser</li>
        </ul>
      </div>
      
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm">
        <p className="font-medium mb-2 text-amber-800">Note sur l'erreur 403:</p>
        <p className="text-amber-700">
          Une erreur 403 indique généralement un problème de permissions. Voici quelques vérifications supplémentaires:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-amber-600 mt-2">
          <li>Assurez-vous que l'API Gmail a été activée pour le projet</li>
          <li>Vérifiez que le compte utilisé n'est pas soumis à des restrictions organisationnelles</li>
          <li>Confirmez que tous les scopes nécessaires sont configurés dans le projet Google Cloud</li>
          <li>Si vous utilisez un compte Gmail, assurez-vous qu'il n'est pas configuré avec une sécurité accrue qui bloque les connexions d'applications</li>
        </ul>
      </div>
      
      <Button 
        onClick={connectGmail} 
        disabled={isConnecting}
        className="w-full flex items-center justify-center gap-2 text-white shadow-md py-6 rounded-md bg-loro-terracotta hover:bg-loro-terracotta/90"
      >
        {isConnecting ? (
          <>
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span className="font-medium">Connexion en cours...</span>
          </>
        ) : (
          <>
            <Mail className="h-5 w-5" />
            <span className="font-medium">Réessayer la connexion Gmail</span>
          </>
        )}
      </Button>
    </div>;
  }

  if (!isConnected) {
    return <div className="p-4 flex flex-col items-center justify-center space-y-4 pt-8">
      <div className="bg-loro-pearl/30 rounded-full p-4 border-2 border-loro-terracotta shadow-sm">
        <Mail className="h-8 w-8 text-loro-terracotta" />
      </div>
      <h3 className="font-semibold text-lg">Connectez votre compte Gmail</h3>
      <p className="text-gray-500 text-center text-sm mb-4">
        Connectez votre compte Gmail pour synchroniser les emails avec ce lead.
      </p>
      <Button 
        onClick={connectGmail} 
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
      <p className="text-xs text-gray-400 mt-2 text-center">
        Assurez-vous que les autorisations d'API ont été configurées dans Google Cloud Console
      </p>
    </div>;
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

  return <div className="flex flex-col h-full">
    <div className="p-2">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Connecté avec:</p>
          <p className="text-xs text-gray-500">{connectedEmail}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={syncEmailsWithGmail} disabled={isRefreshing} className="flex items-center gap-1.5">
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Sync
          </Button>
          <Button size="sm" onClick={sendNewEmail} className="flex items-center gap-1.5 bg-loro-dark hover:bg-loro-chocolate">
            <Edit className="h-3.5 w-3.5" />
            Nouveau
          </Button>
        </div>
      </div>
      
      <div className="flex items-center space-x-2 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher..."
            className="pl-8"
          />
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={toggleSortOrder}
          className="h-10 w-10"
        >
          {sortOrder === 'desc' ? <ArrowDown className="h-4 w-4" /> : <ArrowUp className="h-4 w-4" />}
        </Button>
      </div>
      
      <Separator className="my-3" />
    </div>
    
    <ScrollArea className="flex-1 px-2 pb-16">
      {filteredEmails.length === 0 ? (
        <div className="text-center py-6">
          {emails.length === 0 ? (
            <>
              <p className="text-gray-500">Aucun email trouvé pour ce lead.</p>
              <Button variant="outline" size="sm" onClick={syncEmailsWithGmail} className="mt-2">
                Synchroniser avec Gmail
              </Button>
            </>
          ) : (
            <p className="text-gray-500">Aucun résultat pour "{searchTerm}"</p>
          )}
        </div>
      ) : (
        <div className="space-y-3 pb-4">
          {filteredEmails.map(email => (
            <div key={email.id} className="border rounded-md p-3 bg-white shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-1">
                    <h4 className={`font-medium text-sm ${email.is_sent ? 'text-loro-terracotta' : 'text-loro-chocolate'}`}>
                      {email.is_sent ? 'Envoyé' : 'Reçu'}
                    </h4>
                    {email.is_sent && <Send className="h-3 w-3 text-loro-terracotta" />}
                  </div>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {formatDate(email.date)}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6" 
                  onClick={() => window.open(`https://mail.google.com/mail/u/0/#inbox/${email.gmail_message_id}`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
              
              <Accordion type="single" collapsible className="w-full mt-2">
                <AccordionItem value="content" className="border-0">
                  <AccordionTrigger className="py-1 hover:no-underline">
                    <h3 className="font-medium text-sm text-left">{email.subject || '(Sans objet)'}</h3>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="border-t pt-2 mt-1">
                      {email.is_sent ? (
                        <div className="text-xs text-gray-600">
                          <span className="font-medium">À:</span> {email.recipient || 'N/A'}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-600">
                          <span className="font-medium">De:</span> {email.sender || 'N/A'}
                        </div>
                      )}
                      
                      <div className="mt-2 text-sm">
                        {email.body_html ? (
                          <div dangerouslySetInnerHTML={{ __html: email.body_html }} className="prose prose-sm max-w-none" />
                        ) : email.body_text ? (
                          <div className="whitespace-pre-wrap">{email.body_text}</div>
                        ) : (
                          <div>{email.snippet || ''}</div>
                        )}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              
              {!email.body_html && !email.body_text && (
                <p className="text-xs text-gray-600 mt-1">{email.snippet || ''}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </ScrollArea>
  </div>;
};

export default EmailsTab;
