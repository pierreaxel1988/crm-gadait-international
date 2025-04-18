
import React, { useState, useEffect } from 'react';
import { Lightbulb, Loader2 } from 'lucide-react';
import { LeadDetailed } from '@/types/lead';
import { AISuggestedAction, generateLeadActionSuggestions, implementSuggestedAction } from '@/services/aiActionSuggestionService';
import { ActionSuggestionCard } from './ActionSuggestionCard';
import { toast } from '@/hooks/use-toast';

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
    
    // Don't reload suggestions if we've loaded them in the last 5 minutes
    const now = Date.now();
    if (now - lastLoadTime < 5 * 60 * 1000 && suggestions.length > 0) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Generating action suggestions for lead:', lead.id);
      const actionSuggestions = await generateLeadActionSuggestions(lead);
      console.log('Received action suggestions:', actionSuggestions);
      
      if (actionSuggestions && actionSuggestions.length > 0) {
        setSuggestions(actionSuggestions);
        setLastLoadTime(now);
      } else {
        console.log('No suggestions were returned from the AI');
      }
    } catch (err) {
      console.error('Error loading action suggestions:', err);
      setError('Impossible de charger les suggestions d\'actions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImplementSuggestion = async (suggestion: AISuggestedAction) => {
    if (!lead?.id) return;
    
    try {
      setIsLoading(true);
      const success = await implementSuggestedAction(lead.id, suggestion);
      
      if (success) {
        // Remove the implemented suggestion from the list
        setSuggestions(current => 
          current.filter(s => s.id !== suggestion.id)
        );
        
        // Notify parent that an action was added
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
    // Simply remove the suggestion from the list
    setSuggestions(current => 
      current.filter(s => s.id !== suggestion.id)
    );
  };

  const handleManualRefresh = () => {
    loadSuggestions();
  };

  if (isLoading) {
    return (
      <div className="border rounded-md p-4 bg-loro-hazel/5 flex flex-col items-center justify-center">
        <Loader2 className="h-5 w-5 text-loro-hazel animate-spin mb-2" />
        <p className="text-sm text-muted-foreground">Génération de suggestions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border rounded-md p-4 bg-red-50 text-center">
        <p className="text-sm text-red-600">{error}</p>
        <button 
          onClick={handleManualRefresh}
          className="mt-2 text-xs text-loro-hazel hover:underline"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!suggestions || suggestions.length === 0) {
    return (
      <div className="border rounded-md p-4 bg-loro-hazel/5 text-center animate-[fade-in_0.3s_ease-out]">
        <Lightbulb className="h-5 w-5 text-loro-hazel/60 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Aucune suggestion d'action pour le moment</p>
        <button 
          onClick={handleManualRefresh}
          className="mt-2 text-xs text-loro-hazel hover:underline"
        >
          Générer des suggestions
        </button>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-loro-hazel" />
          <h3 className="text-sm font-medium">Actions suggérées par GADAIT AI ({suggestions.length})</h3>
        </div>
        <button 
          onClick={handleManualRefresh}
          className="text-xs text-loro-hazel hover:underline"
        >
          Actualiser
        </button>
      </div>
      
      <div className="space-y-2">
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
