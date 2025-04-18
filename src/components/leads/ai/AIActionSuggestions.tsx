
import React, { useState, useEffect } from 'react';
import { Lightbulb, Loader2, RefreshCw } from 'lucide-react';
import { LeadDetailed } from '@/types/lead';
import { AISuggestedAction, generateLeadActionSuggestions, implementSuggestedAction } from '@/services/aiActionSuggestionService';
import { ActionSuggestionCard } from './ActionSuggestionCard';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

interface AIActionSuggestionsProps {
  lead: LeadDetailed;
  onActionAdded: () => void;
}

export function AIActionSuggestions({ lead, onActionAdded }: AIActionSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<AISuggestedAction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastLoadTime, setLastLoadTime] = useState<number>(0);

  useEffect(() => {
    if (lead?.id) {
      loadSuggestions();
    }
  }, [lead?.id]);

  const loadSuggestions = async () => {
    if (!lead) return;
    
    const now = Date.now();
    if (now - lastLoadTime < 5 * 60 * 1000 && suggestions.length > 0) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const actionSuggestions = await generateLeadActionSuggestions(lead);
      
      if (actionSuggestions && actionSuggestions.length > 0) {
        setSuggestions(actionSuggestions);
        setLastLoadTime(now);
      } else {
        setSuggestions([]);
      }
    } catch (err) {
      console.error('Error loading action suggestions:', err);
      setError('Impossible de charger les suggestions d\'actions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImplementSuggestion = async (suggestion: AISuggestedAction) => {
    try {
      setIsLoading(true);
      const success = await implementSuggestedAction(lead.id, suggestion);
      
      if (success) {
        setSuggestions(current => current.filter(s => s.id !== suggestion.id));
        onActionAdded();
        
        toast({
          title: "Action ajoutée",
          description: `${suggestion.actionType} a été ajouté avec succès`
        });
      }
    } catch (error) {
      console.error('Error implementing suggestion:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'ajouter l'action suggérée"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismissSuggestion = (suggestion: AISuggestedAction) => {
    setSuggestions(current => {
      const updatedSuggestions = current.filter(s => s.id !== suggestion.id);
      
      toast({
        title: "Suggestion ignorée",
        description: `L'action "${suggestion.actionType}" a été retirée des suggestions`
      });
      
      return updatedSuggestions;
    });
  };

  const handleManualRefresh = () => {
    setLastLoadTime(0);
    loadSuggestions();
  };

  if (isLoading) {
    return (
      <div className="border rounded-lg p-6 bg-loro-pearl/20 flex flex-col items-center justify-center animate-[fade-in_0.3s_ease-out] space-y-4 mx-2 my-3">
        <Loader2 className="h-8 w-8 text-loro-navy animate-spin" />
        <p className="text-base text-loro-navy/80 font-medium text-center">Génération des suggestions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border rounded-lg p-6 bg-red-50 animate-[fade-in_0.3s_ease-out] space-y-4 mx-2 my-3">
        <p className="text-base text-red-600 text-center font-medium">{error}</p>
        <div className="flex justify-center">
          <Button
            onClick={handleManualRefresh}
            variant="destructive"
            size="lg"
            className="w-full max-w-xs h-12 text-base font-medium"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  if (!suggestions || suggestions.length === 0) {
    return (
      <div className="border rounded-lg p-6 bg-loro-pearl/20 text-center animate-[fade-in_0.3s_ease-out] space-y-4 mx-2 my-3">
        <Lightbulb className="h-8 w-8 text-loro-navy/60 mx-auto" />
        <p className="text-base text-loro-navy/80 font-medium">Aucune suggestion pour le moment</p>
        <Button 
          onClick={loadSuggestions}
          variant="outline" 
          size="lg"
          className="w-full h-12 text-base border-loro-navy text-loro-navy hover:bg-loro-pearl/20"
        >
          <RefreshCw className="h-5 w-5 mr-2" />
          Générer des suggestions
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-[fade-in_0.4s_ease-out] p-3">
      <div className="flex items-center justify-between bg-loro-pearl/10 p-3 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-md bg-loro-pearl">
            <Lightbulb className="h-6 w-6 text-loro-navy" />
          </div>
          <span className="text-base font-semibold text-loro-navy">
            {suggestions.length} suggestion{suggestions.length > 1 ? 's' : ''}
          </span>
        </div>
        <Button 
          onClick={handleManualRefresh}
          variant="ghost"
          size="lg"
          className="h-11 px-4 text-base text-loro-navy hover:bg-loro-pearl/20"
        >
          <RefreshCw className="h-5 w-5 mr-2" />
          Actualiser
        </Button>
      </div>

      <div className="space-y-4">
        {suggestions.map((suggestion) => (
          <ActionSuggestionCard
            key={suggestion.id}
            suggestion={suggestion}
            onImplement={handleImplementSuggestion}
            onDismiss={handleDismissSuggestion}
          />
        ))}
      </div>
    </div>
  );
}
