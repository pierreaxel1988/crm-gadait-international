
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { LeadDetailed } from '@/types/lead';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, User, Home } from 'lucide-react';
import { format } from 'date-fns';

interface AssistantIAProps {
  leadId: string;
  lead: LeadDetailed;
  refresh?: () => void;
}

const AssistantIA: React.FC<AssistantIAProps> = ({ leadId, lead, refresh }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAIResponse] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  const quickActions = [
    {
      label: "Relance WhatsApp",
      icon: MessageCircle,
      prompt: "Rédige une relance WhatsApp en anglais pour ce client, élégante et professionnelle."
    },
    {
      label: "Résumé du Client",
      icon: User,
      prompt: "Fais un résumé structuré du profil de ce client pour transmission interne."
    },
    {
      label: "Proposition de Biens",
      icon: Home,
      prompt: "Propose trois biens qui correspondent au budget et aux critères de ce client."
    }
  ];

  const fetchHistory = async () => {
    const { data, error } = await supabase
      .from('lead_ai_history')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false });

    if (!error) setHistory(data || []);
  };

  const handleSendToGPT = async () => {
    if (!prompt || !leadId) return;
    setLoading(true);
    setAIResponse(null);

    try {
      const response = await fetch("https://hxqoqkfnhbpwzkjgukrc.functions.supabase.co/gpt-assistant", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt,
          lead: {
            id: lead.id,
            nom: lead.name,
            langue: lead.preferredLanguage,
            budget_min: lead.budgetMin,
            budget_max: lead.budget,
            devise: lead.currency,
            type_bien: lead.propertyTypes?.join(', '),
            vue_souhaitee: lead.views?.join(', '),
            nb_chambres: Array.isArray(lead.bedrooms) 
              ? lead.bedrooms.join(', ') 
              : lead.bedrooms?.toString(),
            localisation: lead.desiredLocation,
            notes_generales: lead.notes,
            agent: lead.assignedTo
          }
        })
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la communication avec l'assistant");
      }

      const data = await response.json();
      setAIResponse(data.result);
      
      toast({
        title: "Message envoyé",
        description: "L'assistant traite votre demande"
      });

      refresh?.();
      fetchHistory();
      setPrompt('');

    } catch (error) {
      console.error("Erreur lors de l'envoi à l'IA:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de communiquer avec l'assistant IA"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (leadId) fetchHistory();
  }, [leadId]);

  return (
    <div className="space-y-4 animate-[fade-in_0.3s_ease-out]">
      <div className="flex items-center gap-2 pb-2">
        <h3 className="text-xl font-futura">ACTIONS IA (mobile)</h3>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {quickActions.map((action, i) => (
          <Button
            key={i}
            variant="outline"
            className="flex-col h-auto py-6 gap-2 aspect-square bg-white hover:bg-loro-sand/10"
            onClick={() => setPrompt(action.prompt)}
          >
            <action.icon className="h-8 w-8" />
            <span className="text-xs text-center font-medium">{action.label}</span>
          </Button>
        ))}
      </div>

      <div className="space-y-2">
        <h3 className="font-futura">Assistant IA GADAIT</h3>
        <div className="space-y-2">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="resize-none min-h-[80px]"
            placeholder="Écris ici ta demande (ex: relance WhatsApp, résumé du client...)"
          />
          <Button
            onClick={handleSendToGPT}
            disabled={loading || !prompt.trim()}
            className="w-full bg-loro-navy hover:bg-loro-navy/90"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-white/20 border-t-white rounded-full" />
                Envoi en cours...
              </div>
            ) : (
              <>
                <Bot className="mr-2 h-4 w-4" />
                Envoyer à l'IA
              </>
            )}
          </Button>
        </div>
      </div>

      {aiResponse && (
        <div className="rounded-lg border bg-card p-4 text-card-foreground animate-[fade-in_0.3s_ease-out]">
          <div className="flex items-start gap-2">
            <div className="h-6 w-6 rounded-full bg-loro-sand flex items-center justify-center">
              <Bot className="h-3 w-3 text-loro-navy" />
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm whitespace-pre-wrap">{aiResponse}</p>
            </div>
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="rounded-lg border">
          <div className="px-4 py-2 border-b">
            <h4 className="text-xs text-muted-foreground uppercase">Historique IA</h4>
          </div>
          <ScrollArea className="h-[300px] rounded-b-lg">
            <div className="p-4 space-y-4">
              {history.map((entry, i) => (
                <div 
                  key={i} 
                  className="rounded-lg bg-muted/50 p-3 space-y-2 animate-[fade-in_0.3s_ease-out]"
                >
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    {format(new Date(entry.created_at), 'dd/MM/yyyy HH:mm')}
                  </div>
                  <div className="text-sm space-y-1">
                    <p><span className="font-medium">Demande :</span> {entry.prompt}</p>
                    <p><span className="font-medium">Réponse :</span> {entry.response}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default AssistantIA;
