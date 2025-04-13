
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Send, X, Paperclip, ChevronDown, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  const [subject, setSubject] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [showCc, setShowCc] = useState<boolean>(false);
  const [cc, setCc] = useState<string>('');
  const [bcc, setBcc] = useState<string>('');

  const handleSend = async () => {
    if (!leadEmail) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "L'email du lead n'est pas disponible."
      });
      return;
    }

    if (!subject.trim()) {
      toast({
        variant: "destructive",
        title: "Sujet requis",
        description: "Veuillez ajouter un sujet à votre email."
      });
      return;
    }

    if (!message.trim()) {
      toast({
        variant: "destructive",
        title: "Message requis",
        description: "Veuillez ajouter un contenu à votre email."
      });
      return;
    }

    try {
      setIsSending(true);

      const { data, error } = await supabase.functions.invoke('gmail-send', {
        body: {
          to: leadEmail,
          subject,
          message,
          cc: cc || undefined,
          bcc: bcc || undefined,
          leadId
        }
      });

      if (error) {
        console.error('Error sending email:', error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: `Impossible d'envoyer l'email: ${error.message}`
        });
        return;
      }

      toast({
        title: "Email envoyé",
        description: "Votre email a été envoyé avec succès."
      });
      
      onSent();
    } catch (error) {
      console.error('Error in handleSend:', error);
      toast({
        variant: "destructive",
        title: "Erreur technique",
        description: `Une erreur s'est produite: ${(error as Error).message}`
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white p-4 rounded-md border">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">Nouvel email</h3>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4 flex-1">
        <div>
          <Label htmlFor="to">À</Label>
          <Input id="to" value={leadEmail || ''} disabled className="bg-gray-50" />
        </div>

        <div>
          <div className="flex justify-between items-center">
            <Label htmlFor="subject">Sujet</Label>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 px-2 text-xs"
              onClick={() => setShowCc(!showCc)}
            >
              {showCc ? 'Masquer' : 'Cc/Bcc'} <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </div>
          <Input 
            id="subject" 
            value={subject} 
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Objet de l'email" 
          />
        </div>

        {showCc && (
          <>
            <div>
              <Label htmlFor="cc">Cc</Label>
              <Input 
                id="cc" 
                value={cc} 
                onChange={(e) => setCc(e.target.value)}
                placeholder="email@exemple.com" 
              />
            </div>
            <div>
              <Label htmlFor="bcc">Bcc</Label>
              <Input 
                id="bcc" 
                value={bcc} 
                onChange={(e) => setBcc(e.target.value)}
                placeholder="email@exemple.com" 
              />
            </div>
          </>
        )}

        <div className="flex-1">
          <Label htmlFor="message">Message</Label>
          <Textarea 
            id="message" 
            value={message} 
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Saisissez votre message ici..." 
            className="min-h-[200px] h-full resize-none"
          />
        </div>
      </div>

      <div className="flex justify-between items-center mt-4 pt-2 border-t">
        <Button 
          variant="outline" 
          size="sm"
          disabled={isSending}
        >
          <Paperclip className="h-4 w-4 mr-1" /> Pièce jointe
        </Button>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onCancel}
            disabled={isSending}
          >
            Annuler
          </Button>
          <Button 
            variant="default" 
            size="sm"
            onClick={handleSend}
            disabled={isSending}
            className="bg-loro-terracotta hover:bg-loro-terracotta/90"
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Envoi...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-1" /> Envoyer
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmailComposer;
