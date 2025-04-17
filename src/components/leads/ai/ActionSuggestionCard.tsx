
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Check, Loader2, Wand2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AISuggestedAction } from '@/services/aiActionSuggestionService';

interface ActionSuggestionCardProps {
  suggestion: AISuggestedAction;
  onImplement: (suggestion: AISuggestedAction) => Promise<void>;
  onDismiss: (suggestion: AISuggestedAction) => void;
}

export function ActionSuggestionCard({ 
  suggestion, 
  onImplement, 
  onDismiss 
}: ActionSuggestionCardProps) {
  const [isImplementing, setIsImplementing] = useState(false);

  const handleImplement = async () => {
    setIsImplementing(true);
    try {
      await onImplement(suggestion);
    } finally {
      setIsImplementing(false);
    }
  };

  return (
    <div className="border rounded-md p-3 bg-loro-hazel/10 shadow-sm mb-3 animate-[fade-in_0.4s_ease-out]">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-8 w-8 rounded-full bg-loro-hazel/20 flex items-center justify-center text-loro-hazel">
          <Wand2 className="h-4 w-4" />
        </div>
        <div>
          <h4 className="font-futura text-sm">Suggestion d'action</h4>
          <div className="text-xs text-muted-foreground">
            GADAIT AI a analysé le profil client
          </div>
        </div>
      </div>
      
      <div className="bg-white border rounded-md p-2 mb-3">
        <div className="flex items-start gap-2">
          <Calendar className="h-4 w-4 text-loro-navy mt-0.5" />
          <div>
            <div className="text-sm font-medium">{suggestion.actionType}</div>
            <div className="text-xs text-muted-foreground">
              {format(suggestion.scheduledDate, 'EEEE d MMMM yyyy', { locale: fr })} à {format(suggestion.scheduledDate, 'HH:mm')}
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-xs bg-loro-hazel/5 border border-loro-hazel/20 rounded p-2 mb-3">
        {suggestion.notes}
      </div>
      
      <div className="flex justify-between gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onDismiss(suggestion)}
          className="text-muted-foreground flex-1"
        >
          Ne pas utiliser
        </Button>
        
        <Button 
          onClick={handleImplement} 
          variant="default"
          size="sm" 
          disabled={isImplementing}
          className="bg-loro-hazel hover:bg-loro-hazel/80 text-white flex-1"
        >
          {isImplementing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> 
              Ajout en cours...
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" /> 
              Appliquer
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
