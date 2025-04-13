
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Mail, ExternalLink, Clock, Send, RefreshCw, AlertCircle, ChevronDown, Info } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useLeadDetail } from '@/hooks/useLeadDetail';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

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
}

const EmailsTab: React.FC<EmailConnectionProps> = ({
  leadId
}) => {
  const {
    user
  } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [emails, setEmails] = useState<LeadEmail[]>([]);
  const [connectedEmail, setConnectedEmail] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [connectionAttemptCount, setConnectionAttemptCount] = useState(0);
  const [detailedErrorInfo, setDetailedErrorInfo] = useState<any>(null);

  const {
    lead
  } = useLeadDetail(leadId);

  useEffect(() => {
    async function checkEmailConnection() {
      if (!user) return;
      try {
        setIsLoading(true);
        setConnectionError(null);
        setDetailedErrorInfo(null);
        
        const {
          data,
          error
        } = await supabase.from('user_email_connections').select('email, id').eq('user_id', user.id).maybeSingle();
        
        if (error) {
          console.error('Error checking email connection:', error);
          setIsConnected(false);
          setConnectionError(`Erreur lors de la vérification de la connexion: ${error.message}`);
          return;
        }
        
        if (data) {
          setIsConnected(true);
          setConnectedEmail((data as EmailConnection).email);
          fetchEmails();
        } else {
          setIsConnected(false);
        }
      } catch (error) {
        console.error('Error in checkEmailConnection:', error);
        setConnectionError(`Une erreur est survenue: ${(error as Error).message}`);
      } finally {
        setIsLoading(false);
      }
    }
    
    checkEmailConnection();
  }, [user, leadId, connectionAttemptCount]);

  const connectGmail = async () => {
    if (isConnecting) return;
    
    try {
      setIsConnecting(true);
      setConnectionError(null);
      setDetailedErrorInfo(null);
      
      console.log('Starting Gmail connection process for lead:', leadId);
      
      // Vérifions que l'utilisateur est connecté
      if (!user) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Vous devez être connecté pour utiliser cette fonctionnalité."
        });
        return;
      }
      
      // Build the redirect URI with the current URL
      const currentPath = window.location.pathname;
      const baseUrl = window.location.origin;
      // Ensure we maintain the tab parameter
      const redirectUri = `${baseUrl}${currentPath}?tab=emails`;
      
      console.log('Using redirect URI:', redirectUri);
      console.log('User ID:', user.id);
      
      try {
        const {
          data,
          error
        } = await supabase.functions.invoke('gmail-auth', {
          body: {
            action: 'authorize',
            userId: user.id,
            redirectUri: redirectUri
          }
        });
        
        if (error) {
          console.error('Error starting Gmail auth:', error);
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
        
        console.log('Received authorization URL, redirecting user:', data.authorizationUrl.substring(0, 100) + '...');
        // Store current page in localStorage so we can return here
        localStorage.setItem('gmailAuthRedirectFrom', window.location.href);
        window.location.href = data.authorizationUrl;
      } catch (invokeError) {
        console.error('Error invoking gmail-auth function:', invokeError);
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
      console.error('Error in connectGmail:', error);
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
      const {
        data,
        error
      } = await supabase.from('lead_emails').select('*').eq('lead_id', leadId).eq('user_id', user.id).order('date', {
        ascending: false
      });
      if (error) {
        console.error('Error fetching emails:', error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de récupérer les emails."
        });
        return;
      }
      setEmails(data || []);
    } catch (error) {
      console.error('Error in fetchEmails:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const syncEmailsWithGmail = async () => {
    if (!user || !leadId || !lead?.email) return;
    try {
      setIsRefreshing(true);
      const {
        data,
        error
      } = await supabase.functions.invoke('gmail-sync', {
        body: {
          leadId,
          leadEmail: lead.email
        }
      });
      if (error) {
        console.error('Error syncing emails:', error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de synchroniser les emails avec Gmail."
        });
        return;
      }
      toast({
        title: "Synchronisation réussie",
        description: `${data.newEmails || 0} nouveaux emails trouvés.`
      });
      fetchEmails();
    } catch (error) {
      console.error('Error in syncEmailsWithGmail:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const sendNewEmail = () => {
    if (!lead) return;
    const mailtoLink = `mailto:${lead.email}?subject=RE: ${lead.name}`;
    window.open(mailtoLink, '_blank');
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

  const retryConnection = () => {
    // Incrémenter le compteur pour forcer un nouveau check
    setConnectionAttemptCount(prev => prev + 1);
    // Recharger la page
    window.location.reload();
  };

  // Fonction pour obtenir le statut actuel des serveurs Supabase Edge Functions
  const checkSupabaseEdgeFunctionStatus = () => {
    window.open('https://status.supabase.com', '_blank');
  };

  if (isLoading) {
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
      
      <Button 
        onClick={retryConnection} 
        variant="outline" 
        className="w-full mt-4"
      >
        <RefreshCw className="mr-2 h-4 w-4" /> Rafraîchir la page
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
          <li>Assurez-vous que l'accès est configuré pour une <strong>application Web</strong> et non mobile</li>
          <li>Vérifiez que les cookies tiers sont autorisés dans votre navigateur</li>
          <li>Essayez d'utiliser une fenêtre de navigation privée</li>
          <li>Si le problème persiste, essayez de vous déconnecter de tous vos comptes Google et reconnectez-vous uniquement avec le compte que vous souhaitez utiliser</li>
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
            <Send className="h-3.5 w-3.5" />
            Email
          </Button>
        </div>
      </div>
      
      <Separator className="my-3" />
    </div>
    
    <ScrollArea className="flex-1 px-2 pb-16">
      {emails.length === 0 ? <div className="text-center py-6">
          <p className="text-gray-500">Aucun email trouvé pour ce lead.</p>
          <Button variant="outline" size="sm" onClick={syncEmailsWithGmail} className="mt-2">
            Synchroniser avec Gmail
          </Button>
        </div> : <div className="space-y-3 pb-4">
          {emails.map(email => <div key={email.id} className="border rounded-md p-3 bg-white shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-sm">{email.is_sent ? 'Envoyé' : 'Reçu'}</h4>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {formatDate(email.date)}
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => window.open(`https://mail.google.com/mail/u/0/#inbox/${email.gmail_message_id}`, '_blank')}>
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
              <h3 className="font-medium text-sm mt-2">{email.subject || '(Sans objet)'}</h3>
              <p className="text-xs text-gray-600 mt-1">{email.snippet || ''}</p>
            </div>)}
        </div>}
    </ScrollArea>
  </div>;
};

export default EmailsTab;
