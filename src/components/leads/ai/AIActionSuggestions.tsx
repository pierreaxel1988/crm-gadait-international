
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
    setSuggestions(current => current.filter(s => s.id !== suggestion.id));
  };

  if (isLoading) {
    return (
      <div className="border rounded-lg p-4 bg-loro-pearl/20 flex flex-col items-center justify-center animate-[fade-in_0.3s_ease-out] space-y-2.5">
        <Loader2 className="h-6 w-6 text-loro-navy animate-spin" />
        <p className="text-sm text-loro-navy/80 font-medium">Génération des suggestions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border rounded-lg p-4 bg-red-50 animate-[fade-in_0.3s_ease-out] space-y-3">
        <p className="text-sm text-red-600 text-center font-medium">{error}</p>
        <div className="flex justify-center">
          <Button 
            onClick={loadSuggestions}
            variant="outline"
            size="sm"
            className="text-sm border-red-200 text-red-600 hover:bg-red-50 h-9 px-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  if (!suggestions || suggestions.length === 0) {
    return (
      <div className="border rounded-lg p-4 bg-loro-pearl/20 text-center animate-[fade-in_0.3s_ease-out] space-y-3">
        <Lightbulb className="h-6 w-6 text-loro-navy/60 mx-auto" />
        <p className="text-sm text-loro-navy/80 font-medium">Aucune suggestion pour le moment</p>
        <Button 
          onClick={loadSuggestions}
          variant="outline" 
          size="sm"
          className="text-sm border-loro-navy text-loro-navy hover:bg-loro-pearl/20 h-9 px-4 w-full"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Générer des suggestions
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-[fade-in_0.4s_ease-out]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-md bg-loro-pearl">
            <Lightbulb className="h-5 w-5 text-loro-navy" />
          </div>
          <span className="text-sm font-semibold text-loro-navy">
            {suggestions.length} suggestion{suggestions.length > 1 ? 's' : ''}
          </span>
        </div>
        <Button 
          onClick={loadSuggestions}
          variant="ghost"
          size="sm"
          className="h-9 px-3 text-sm text-loro-navy hover:bg-loro-pearl/20"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      <div className="space-y-3">
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
