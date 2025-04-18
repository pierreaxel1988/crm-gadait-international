
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { LeadDetailed } from '@/types/lead';
import { Lightbulb, Copy, Check, RefreshCw } from 'lucide-react';

interface ActionSuggestion {
  type: string;
  description: string;
  messageTexte: string;
}

interface LeadActionSuggestionsProps {
  lead: LeadDetailed;
  compact?: boolean;
}

const LeadActionSuggestions: React.FC<LeadActionSuggestionsProps> = ({ lead, compact = false }) => {
  const [suggestions, setSuggestions] = useState<ActionSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCopied, setIsCopied] = useState<string | null>(null);

  const fetchSuggestions = async () => {
    if (!lead) return;
    
    setLoading(true);
    try {
      const response = await fetch("https://hxqoqkfnhbpwzkjgukrc.functions.supabase.co/lead-action-suggestions", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lead })
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la génération des suggestions");
      }

      const data = await response.json();
      if (data.actions && Array.isArray(data.actions)) {
        setSuggestions(data.actions);
      } else {
        console.warn("Format de réponse inattendu pour les suggestions d'actions:", data);
        setSuggestions([]);
      }
    } catch (error) {
      console.error("Erreur lors de la génération des suggestions:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de générer des suggestions d'actions"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(id);
    
    toast({
      title: "Texte copié",
      description: "Le message a été copié dans le presse-papier"
    });
    
    setTimeout(() => {
      setIsCopied(null);
    }, 2000);
  };

  useEffect(() => {
    if (lead?.id) {
      fetchSuggestions();
    }
  }, [lead?.id]);

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin h-5 w-5 border-2 border-loro-navy/20 border-t-loro-navy rounded-full mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Génération des suggestions...</p>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="text-center py-4">
        <Lightbulb className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground mb-2">Aucune suggestion disponible</p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchSuggestions}
          className="mx-auto"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          Générer des suggestions
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {suggestions.map((suggestion, i) => (
        <div 
          key={i} 
          className={`bg-loro-pearl/30 border rounded-lg ${compact ? 'p-2' : 'p-3'} space-y-1.5 animate-[fade-in_0.3s_ease-out]`}
        >
          <div className="flex items-start gap-2">
            <div className="h-6 w-6 rounded-full bg-loro-sand flex items-center justify-center shrink-0 mt-0.5">
              <Lightbulb className="h-3 w-3 text-loro-navy" />
            </div>
            <div className="space-y-1 flex-1">
              <h5 className={`font-medium ${compact ? 'text-xs' : 'text-sm'}`}>{suggestion.type}</h5>
              {!compact && <p className="text-xs text-gray-600">{suggestion.description}</p>}
              
              <div className={`bg-white rounded-md ${compact ? 'p-1.5' : 'p-2'} text-xs mt-1 border relative`}>
                <p className={`whitespace-pre-wrap ${compact ? 'text-[10px]' : 'text-xs'}`}>
                  {compact ? suggestion.messageTexte.substring(0, 100) + (suggestion.messageTexte.length > 100 ? '...' : '') : suggestion.messageTexte}
                </p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`absolute ${compact ? 'top-0.5 right-0.5 h-5 w-5' : 'top-1 right-1 h-6 w-6'} p-0`}
                  onClick={() => copyToClipboard(suggestion.messageTexte, `suggestion-${i}`)}
                >
                  {isCopied === `suggestion-${i}` ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full border-loro-navy text-loro-navy hover:bg-loro-pearl/20"
        onClick={fetchSuggestions}
      >
        <RefreshCw className="mr-2 h-3.5 w-3.5" />
        Actualiser les suggestions
      </Button>
    </div>
  );
};

export default LeadActionSuggestions;
