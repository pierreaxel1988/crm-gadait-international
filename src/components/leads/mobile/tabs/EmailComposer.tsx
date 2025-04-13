
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Send, X, Paperclip, ChevronDown, Loader2, File, Trash2 } from 'lucide-react';
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
  const [attachments, setAttachments] = useState<File[]>([]);

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      
      // Check file size (limit to 5MB per file)
      const oversizedFiles = newFiles.filter(file => file.size > 5 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        toast({
          variant: "destructive",
          title: "Fichier trop volumineux",
          description: "Les pièces jointes doivent faire moins de 5MB chacune."
        });
        return;
      }
      
      // Limit total number of attachments
      if (attachments.length + newFiles.length > 5) {
        toast({
          variant: "destructive",
          title: "Trop de pièces jointes",
          description: "Vous ne pouvez pas joindre plus de 5 fichiers."
        });
        return;
      }
      
      setAttachments(prev => [...prev, ...newFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

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

      // Note: File attachments support would require additional implementation
      // in the edge function to handle file uploads and Gmail API attachments
      
      const { data, error } = await supabase.functions.invoke('gmail-send', {
        body: {
          to: leadEmail,
          subject,
          message,
          cc: cc || undefined,
          bcc: bcc || undefined,
          leadId
          // For full attachment support, we would need to implement file encoding and transfer
          // attachments: base64EncodedFiles
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

      <div className="space-y-4 flex-1 overflow-auto">
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
            className="min-h-[200px] resize-none"
          />
        </div>

        {/* Attachments UI */}
        {attachments.length > 0 && (
          <div className="space-y-2">
            <Label>Pièces jointes</Label>
            <div className="space-y-2">
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                  <div className="flex items-center space-x-2">
                    <File className="h-4 w-4 text-gray-500" />
                    <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                    <span className="text-xs text-gray-400">
                      {(file.size / 1024).toFixed(0)} KB
                    </span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0" 
                    onClick={() => removeAttachment(index)}
                  >
                    <Trash2 className="h-4 w-4 text-gray-500" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mt-4 pt-2 border-t">
        <label className="cursor-pointer">
          <input 
            type="file" 
            className="hidden" 
            multiple 
            onChange={handleAttachmentChange}
            disabled={isSending}
          />
          <div className="flex items-center text-sm text-gray-700 hover:text-loro-chocolate">
            <Paperclip className="h-4 w-4 mr-1" /> 
            Pièce jointe
          </div>
        </label>
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
