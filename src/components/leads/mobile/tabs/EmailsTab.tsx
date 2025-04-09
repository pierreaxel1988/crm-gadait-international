import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Mail, ExternalLink, Clock, Send, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useLeadDetail } from '@/hooks/useLeadDetail';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

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

const EmailsTab: React.FC<EmailConnectionProps> = ({ leadId }) => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [emails, setEmails] = useState<LeadEmail[]>([]);
  const [connectedEmail, setConnectedEmail] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { lead } = useLeadDetail(leadId);

  useEffect(() => {
    async function checkEmailConnection() {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('user_email_connections')
          .select('email, id')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (error) {
          console.error('Error checking email connection:', error);
          setIsConnected(false);
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
      } finally {
        setIsLoading(false);
      }
    }
    
    checkEmailConnection();
  }, [user, leadId]);

  const connectGmail = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('gmail-auth', {
        body: { 
          redirectUri: window.location.origin + '/leads/' + leadId + '?tab=emails',
          action: 'authorize'
        }
      });
      
      if (error) {
        console.error('Error starting Gmail auth:', error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de démarrer l'authentification Gmail."
        });
        return;
      }
      
      window.location.href = data.authorizationUrl;
    } catch (error) {
      console.error('Error in connectGmail:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur s'est produite lors de la connexion à Gmail."
      });
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
      
      const { data, error } = await supabase.functions.invoke('gmail-sync', {
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

  if (isLoading) {
    return (
      <div className="p-4 flex flex-col items-center justify-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-loro-hazel"></div>
        <p className="mt-2 text-sm text-gray-500">Chargement...</p>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="p-4 flex flex-col items-center justify-center space-y-4 pt-8">
        <div className="bg-loro-pearl/30 rounded-full p-4">
          <Mail className="h-8 w-8 text-loro-hazel" />
        </div>
        <h3 className="font-semibold text-lg">Connectez votre compte Gmail</h3>
        <p className="text-gray-500 text-center text-sm mb-4">
          Connectez votre compte Gmail pour synchroniser les emails avec ce lead.
        </p>
        <Button 
          onClick={connectGmail}
          className="w-full max-w-xs flex items-center justify-center gap-2 bg-loro-hazel hover:bg-loro-500 text-white shadow-md py-6 rounded-md"
        >
          <Mail className="h-5 w-5" />
          <span className="font-medium">Connecter Gmail</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-2">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Connecté avec:</p>
            <p className="text-xs text-gray-500">{connectedEmail}</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={syncEmailsWithGmail}
              disabled={isRefreshing}
              className="flex items-center gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              Sync
            </Button>
            <Button 
              size="sm" 
              onClick={sendNewEmail}
              className="flex items-center gap-1.5 bg-loro-dark hover:bg-loro-chocolate"
            >
              <Send className="h-3.5 w-3.5" />
              Email
            </Button>
          </div>
        </div>
        
        <Separator className="my-3" />
      </div>
      
      <ScrollArea className="flex-1 px-2 pb-16">
        {emails.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-500">Aucun email trouvé pour ce lead.</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={syncEmailsWithGmail} 
              className="mt-2"
            >
              Synchroniser avec Gmail
            </Button>
          </div>
        ) : (
          <div className="space-y-3 pb-4">
            {emails.map((email) => (
              <div key={email.id} className="border rounded-md p-3 bg-white shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-sm">{email.is_sent ? 'Envoyé' : 'Reçu'}</h4>
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
                <h3 className="font-medium text-sm mt-2">{email.subject || '(Sans objet)'}</h3>
                <p className="text-xs text-gray-600 mt-1">{email.snippet || ''}</p>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default EmailsTab;
