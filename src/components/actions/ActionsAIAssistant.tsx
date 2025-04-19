
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X, SendHorizontal, Sparkles, Loader2, Check } from 'lucide-react';
import { generateAIActionSuggestions } from '@/services/aiActionsAssistantService';
import { AISuggestedAction } from '@/services/aiActionSuggestionService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ActionsAIAssistantProps {
  onClose: () => void;
  onActionCreated: () => void;
}

const ActionsAIAssistant: React.FC<ActionsAIAssistantProps> = ({ onClose, onActionCreated }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AISuggestedAction[]>([]);
  const [implementingAction, setImplementingAction] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    try {
      const suggestedActions = await generateAIActionSuggestions(prompt);
      if (suggestedActions && suggestedActions.length > 0) {
        setSuggestions(suggestedActions);
      } else {
        toast({
          title: "Aucune suggestion",
          description: "L'assistant n'a pas pu générer de suggestions. Veuillez reformuler votre demande.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erreur lors de la génération des suggestions:", error);
      toast({
        title: "Erreur",
        description: "Impossible de générer des suggestions pour le moment.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const implementAction = async (suggestion: AISuggestedAction) => {
    setImplementingAction(suggestion.id);
    try {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      if (!userId) {
        throw new Error("Utilisateur non authentifié");
      }
      
      // Create a new action in the leads table
      // Note: This is a simplified implementation. In a real scenario,
      // you would need to select a specific lead to add this action to.
      const { error } = await supabase.rpc('create_ai_suggested_action', {
        action_type: suggestion.actionType,
        scheduled_date: suggestion.scheduledDate.toISOString(),
        notes: suggestion.notes,
        assigned_to: userId
      });
      
      if (error) throw error;
      
      toast({
        title: "Action créée",
        description: `L'action a été ajoutée avec succès.`,
      });
      
      // Remove this suggestion from the list
      setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
      
      // Refresh the actions list
      onActionCreated();
      
    } catch (error) {
      console.error("Erreur lors de l'implémentation de l'action:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter cette action pour le moment.",
        variant: "destructive"
      });
    } finally {
      setImplementingAction(null);
    }
  };

  return (
    <Card className="border border-loro-hazel/30 overflow-hidden">
      <div className="flex items-center justify-between bg-loro-hazel/10 p-3 border-b border-loro-hazel/20">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-loro-hazel" />
          <h3 className="font-futura text-sm text-loro-night">Assistant Gadait IA - Création d'actions</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="p-4">
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="text-sm text-muted-foreground mb-2">
            Décrivez la situation ou demandez à l'assistant de suggérer des actions :
          </div>
          <div className="flex gap-2">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex: Suggère-moi 3 actions pour relancer des prospects qui n'ont pas répondu depuis 2 semaines"
              className="flex-1 min-h-[80px] border-loro-sand/60 focus-visible:ring-loro-hazel"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              className="bg-loro-hazel hover:bg-loro-hazel/80 text-white self-end"
              disabled={isLoading || !prompt.trim()}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <SendHorizontal className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
        
        {suggestions.length > 0 && (
          <div className="space-y-3 mt-4">
            <h4 className="text-sm font-medium">Actions suggérées:</h4>
            {suggestions.map((suggestion) => (
              <div key={suggestion.id} className="border rounded-md p-3 bg-loro-pearl/20">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-sm">{suggestion.actionType}</div>
                    <div className="text-xs text-muted-foreground">
                      {format(suggestion.scheduledDate, 'EEEE d MMMM', { locale: fr })} 
                      {' à '} 
                      {format(suggestion.scheduledDate, 'HH:mm')}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => implementAction(suggestion)}
                    disabled={!!implementingAction}
                    className="h-8 border-loro-hazel text-loro-hazel hover:bg-loro-hazel/10"
                  >
                    {implementingAction === suggestion.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                    ) : (
                      <Check className="h-3.5 w-3.5 mr-1" />
                    )}
                    Ajouter
                  </Button>
                </div>
                <div className="mt-2 text-xs p-2 bg-white rounded border">
                  {suggestion.notes}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-loro-hazel/70" />
            <div className="ml-3 text-sm text-muted-foreground">Génération des suggestions en cours...</div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ActionsAIAssistant;
