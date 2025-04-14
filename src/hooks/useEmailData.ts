
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface LeadEmail {
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

export const useEmailData = (leadId: string, leadEmail: string | undefined, isConnected: boolean) => {
  const { user } = useAuth();
  const [emails, setEmails] = useState<LeadEmail[]>([]);
  const [filteredEmails, setFilteredEmails] = useState<LeadEmail[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showComposer, setShowComposer] = useState(false);

  useEffect(() => {
    if (isConnected) {
      fetchEmails();
    }
  }, [isConnected, leadId, user]);

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
    if (!user || !leadId || !leadEmail) return;
    try {
      setIsRefreshing(true);
      
      console.log(`Synchronisation des emails pour le lead ${leadId} avec l'adresse ${leadEmail}`);
      
      const { data, error } = await supabase.functions.invoke('gmail-sync', {
        body: {
          leadId,
          leadEmail: leadEmail
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

  return {
    emails,
    filteredEmails,
    isRefreshing,
    searchTerm,
    sortOrder,
    showComposer,
    setSearchTerm,
    setShowComposer,
    fetchEmails,
    syncEmailsWithGmail,
    sendNewEmail,
    handleEmailSent,
    formatDate,
    toggleSortOrder
  };
};
