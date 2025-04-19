
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
      console.log('Generating action suggestions for lead:', lead.id);
      const actionSuggestions = await generateLeadActionSuggestions(lead);
      console.log('Received action suggestions:', actionSuggestions);
      
      if (actionSuggestions && actionSuggestions.length > 0) {
        setSuggestions(actionSuggestions);
        setLastLoadTime(now);
      } else {
        console.log('No suggestions were returned from the AI');
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
    if (!lead?.id) return;
    
    try {
      setIsLoading(true);
      const success = await implementSuggestedAction(lead.id, suggestion);
      
      if (success) {
        setSuggestions(current => 
          current.filter(s => s.id !== suggestion.id)
        );
        
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
    setSuggestions(current => 
      current.filter(s => s.id !== suggestion.id)
    );
  };

  const handleManualRefresh = () => {
    loadSuggestions();
  };

  if (isLoading) {
    return (
      <div className="border rounded-lg p-4 bg-gray-50 flex flex-col items-center justify-center w-full mx-0">
        <Loader2 className="h-5 w-5 text-gray-500 animate-spin mb-2" />
        <p className="text-sm text-gray-500">Génération des suggestions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border rounded-lg p-4 bg-red-50 w-full mx-0">
        <p className="text-sm text-red-600 text-center mb-2">{error}</p>
        <div className="flex justify-center">
          <Button 
            onClick={handleManualRefresh}
            variant="outline"
            size="sm"
            className="text-sm border-red-200 text-red-600 hover:bg-red-50"
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
      <div className="border rounded-lg p-4 bg-gray-50 text-center w-full mx-0">
        <Lightbulb className="h-6 w-6 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-500 mb-3">Aucune suggestion pour le moment</p>
        <Button 
          onClick={handleManualRefresh}
          variant="outline" 
          size="sm"
          className="text-sm border-gray-300 text-gray-700 hover:bg-gray-100 w-full"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Générer des suggestions
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full mx-0 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-gray-100">
            <Lightbulb className="h-4 w-4 text-gray-700" />
          </div>
          <span className="text-sm text-gray-700 font-medium">
            {suggestions.length} suggestion{suggestions.length > 1 ? 's' : ''}
          </span>
        </div>
        <Button 
          onClick={handleManualRefresh}
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-sm text-gray-600 hover:bg-gray-100"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>
      
      <div className="w-full">
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
