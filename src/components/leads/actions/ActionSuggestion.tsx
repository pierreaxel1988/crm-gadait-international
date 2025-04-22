
import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Check, X, CalendarClock, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ActionSuggestion } from '@/services/noteAnalysisService';
import { TaskType } from '@/types/actionHistory';

interface ActionSuggestionItemProps {
  suggestion: ActionSuggestion;
  onAccept: (suggestion: ActionSuggestion) => void;
  onReject: (suggestion: ActionSuggestion) => void;
}

const ActionSuggestionItem: React.FC<ActionSuggestionItemProps> = ({
  suggestion,
  onAccept,
  onReject
}) => {
  return (
    <Card className="mb-3 border-amber-100">
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          <div className="mt-1 text-amber-500">
            <Lightbulb className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium">
              Action suggérée : <span className="font-semibold text-amber-700">{suggestion.actionType}</span>
            </h3>
            <p className="text-xs text-gray-500 mb-2 mt-1">
              <span className="flex items-center gap-1">
                <CalendarClock className="h-3.5 w-3.5 mr-1" />
                {format(suggestion.scheduledDate, "EEEE d MMMM yyyy à HH:mm", { locale: fr })}
              </span>
            </p>
            <p className="text-xs italic text-gray-500 my-1">
              Créée à partir de : "{suggestion.matchedText}"
            </p>
            <div className="flex gap-2 mt-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="h-7 rounded px-2 py-0 text-xs border-green-600 text-green-700 hover:bg-green-50"
                onClick={() => onAccept(suggestion)}
              >
                <Check className="h-3.5 w-3.5 mr-1" />
                Accepter
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="h-7 rounded px-2 py-0 text-xs border-gray-300 text-gray-600 hover:bg-gray-50"
                onClick={() => onReject(suggestion)}
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Ignorer
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActionSuggestionItem;
