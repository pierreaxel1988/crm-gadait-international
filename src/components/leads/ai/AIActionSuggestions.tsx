
import React, { useState, useEffect } from 'react';
import { Lightbulb, Loader2 } from 'lucide-react';
import { LeadDetailed } from '@/types/lead';
import { AISuggestedAction, generateLeadActionSuggestions, implementSuggestedAction } from '@/services/aiActionSuggestionService';
import { ActionSuggestionCard } from './ActionSuggestionCard';

interface AIActionSuggestionsProps {
  lead: LeadDetailed;
  onActionAdded: () => void;
}

export function AIActionSuggestions({ lead, onActionAdded }: AIActionSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<AISuggestedAction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (lead?.id) {
      loadSuggestions();
    }
  }, [lead?.id]);

  const loadSuggestions = async () => {
    if (!lead) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const actionSuggestions = await generateLeadActionSuggestions(lead);
      if (actionSuggestions) {
        setSuggestions(actionSuggestions);
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
    
    const success = await implementSuggestedAction(lead.id, suggestion);
    
    if (success) {
      // Remove the implemented suggestion from the list
      setSuggestions(current => 
        current.filter(s => s.id !== suggestion.id)
      );
      
      // Notify parent that an action was added
      onActionAdded();
    }
  };

  const handleDismissSuggestion = (suggestion: AISuggestedAction) => {
    // Simply remove the suggestion from the list
    setSuggestions(current => 
      current.filter(s => s.id !== suggestion.id)
    );
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
      </div>
    );
  }

  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="h-4 w-4 text-loro-hazel" />
        <h3 className="text-sm font-medium">Actions suggérées par GADAIT AI ({suggestions.length})</h3>
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
