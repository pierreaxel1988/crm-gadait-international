import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { format } from 'date-fns';
import { Check, X, Calendar, Clock } from 'lucide-react';
import { fr } from 'date-fns/locale';
import { ActionSuggestion as ActionSuggestionType } from '@/services/noteAnalysisService';
import { TaskType } from '@/types/actionHistory';

interface ActionSuggestionProps {
  suggestion: ActionSuggestionType;
  onAccept: (suggestion: ActionSuggestionType) => void;
  onReject: (suggestion: ActionSuggestionType) => void;
  className?: string;
  compact?: boolean;
}

const ActionSuggestionCard: React.FC<ActionSuggestionProps> = ({
  suggestion,
  onAccept,
  onReject,
  className,
  compact = false
}) => {
  if (compact) {
    return (
      <div className={`border rounded-md p-2 shadow-sm bg-amber-50/80 animate-[fade-in_0.4s_ease-out] ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
              <Lightbulb className="h-3.5 w-3.5" />
            </div>
            <div>
              <div className="text-xs font-medium text-amber-800">{suggestion.actionType}</div>
              <div className="text-xs text-amber-700/80">
                {format(suggestion.scheduledDate, 'EEEE d MMMM', { locale: fr })} à {format(suggestion.scheduledDate, 'HH:mm')}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button 
              size="sm"
              variant="ghost" 
              onClick={() => onAccept(suggestion)}
              className="h-6 w-6 p-0 text-green-600"
            >
              <Check className="h-3.5 w-3.5" />
            </Button>
            <Button 
              size="sm"
              variant="ghost" 
              onClick={() => onReject(suggestion)}
              className="h-6 w-6 p-0 text-gray-500 hover:text-red-500"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`border rounded-md p-3 shadow-sm bg-loro-pearl/30 animate-[fade-in_0.4s_ease-out] ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <div className="h-7 w-7 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
          <Lightbulb className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <h4 className="font-futura text-sm">Action suggérée</h4>
          <div className="text-xs text-muted-foreground">
            Basée sur les notes du client
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button 
            size="sm"
            variant="ghost" 
            onClick={() => onReject(suggestion)}
            className="h-7 w-7 p-0 text-gray-500 hover:text-red-500"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="bg-white border rounded-md p-2 mb-2">
        <div className="flex items-start gap-2">
          <CalendarClock className="h-4 w-4 text-chocolate-dark mt-0.5" />
          <div>
            <div className="text-sm font-medium">{suggestion.actionType}</div>
            <div className="text-xs text-muted-foreground">
              {format(suggestion.scheduledDate, 'EEEE d MMMM yyyy', { locale: fr })} à {format(suggestion.scheduledDate, 'HH:mm')}
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-xs bg-amber-50 border border-amber-100 rounded p-2 mb-3 text-amber-800">
        {suggestion.matchedText}
      </div>
      
      <Button 
        onClick={() => onAccept(suggestion)} 
        size="sm" 
        variant="outline"
        className="w-full border-green-500 hover:bg-green-50 text-green-600 flex items-center gap-1.5"
      >
        <Check className="h-3.5 w-3.5" />
        <span>Ajouter cette action</span>
      </Button>
    </div>
  );
};

export default ActionSuggestionCard;
