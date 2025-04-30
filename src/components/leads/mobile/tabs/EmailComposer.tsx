
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Send, Paperclip, Loader2 } from 'lucide-react';

interface EmailComposerProps {
  leadId: string;
  leadEmail: string | null;
  onCancel: () => void;
  onSent: () => void;
}

const EmailComposer: React.FC<EmailComposerProps> = ({
  leadId,
  leadEmail,
  onCancel,
  onSent
}) => {
  const { user } = useAuth();
  const [to, setTo] = useState(leadEmail || '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  const handleSend = async () => {
    if (!to || !subject || !message) {
      toast({
        title: "Champs manquants",
        description: "Veuillez remplir tous les champs requis.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSending(true);
      
      const { data, error } = await supabase.functions.invoke('gmail-send', {
        body: {
          to,
          subject,
          message,
          leadId
        }
      });
      
      if (error) {
        console.error('Erreur lors de l\'envoi de l\'email:', error);
        toast({
          title: "Échec de l'envoi",
          description: `Erreur: ${error.message}`,
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Email envoyé",
        description: "Votre email a été envoyé avec succès.",
      });
      
      onSent();
    } catch (e) {
      console.error('Exception lors de l\'envoi de l\'email:', e);
      toast({
        title: "Erreur",
        description: `Une erreur est survenue: ${(e as Error).message}`,
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <div className="flex flex-col h-full bg-white p-4 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <Button 
          onClick={onCancel} 
          variant="ghost" 
          className="text-loro-terracotta"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <h2 className="text-xl font-medium">Nouvel email</h2>
        <div className="w-20" />
      </div>
      
      <div className="space-y-4 flex-grow">
        <div>
          <Label htmlFor="to">Destinataire</Label>
          <Input
            id="to"
            type="email"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="adresse@email.com"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="subject">Sujet</Label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Objet de l'email"
            required
          />
        </div>
        
        <div className="flex-grow">
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Écrivez votre message ici..."
            className="resize-none h-60"
            required
          />
        </div>
      </div>
      
      <div className="flex justify-between mt-4 pt-4 border-t">
        <Button variant="outline" disabled={isSending} className="flex items-center">
          <Paperclip className="h-4 w-4 mr-2" />
          Pièce jointe
        </Button>
        <Button 
          onClick={handleSend} 
          disabled={isSending || !to || !subject || !message} 
          className="bg-loro-terracotta hover:bg-loro-terracotta/90"
        >
          {isSending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Envoi...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Envoyer
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default EmailComposer;
