
import React from 'react';
import { ActionSuggestion } from '@/types/actionSuggestion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export interface ActionSuggestionItemProps {
  suggestion: ActionSuggestion;
  onAccept: (suggestion: ActionSuggestion) => void;
  onReject: (suggestion: ActionSuggestion) => void;
  compact?: boolean;
}

const ActionSuggestionItem: React.FC<ActionSuggestionItemProps> = ({
  suggestion,
  onAccept,
  onReject,
  compact = false
}) => {
  const formatDate = (date: string) => {
    return format(new Date(date), 'dd MMM yyyy', { locale: fr });
  };

  return (
    <Card className={`overflow-hidden border border-loro-sand/30 ${compact ? 'shadow-sm' : 'shadow-md'}`}>
      <CardContent className={`p-4 ${compact ? 'space-y-2' : 'space-y-4'}`}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className={`font-medium ${compact ? 'text-sm' : 'text-base'}`}>{suggestion.title}</h3>
            {suggestion.description && (
              <p className={`text-muted-foreground ${compact ? 'text-xs' : 'text-sm'} mt-1`}>
                {suggestion.description}
              </p>
            )}
          </div>
          {!compact && (
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10" 
                onClick={() => onReject(suggestion)}
              >
                <X className="h-4 w-4 mr-1" />
                <span className="sr-only">Rejeter</span>
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-8 text-emerald-600 hover:text-emerald-600 hover:bg-emerald-50" 
                onClick={() => onAccept(suggestion)}
              >
                <Check className="h-4 w-4 mr-1" />
                <span className="sr-only">Accepter</span>
              </Button>
            </div>
          )}
        </div>
        
        {suggestion.dueDate && (
          <div className="flex items-center text-muted-foreground text-xs gap-1">
            <Clock className="h-3 w-3" />
            <span>{formatDate(suggestion.dueDate)}</span>
          </div>
        )}
        
        {compact && (
          <div className="flex items-center justify-end gap-2 pt-1">
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 px-2" 
              onClick={() => onReject(suggestion)}
            >
              <X className="h-3 w-3 mr-1" />
              Rejeter
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-7 text-xs text-emerald-600 hover:text-emerald-600 hover:bg-emerald-50 px-2" 
              onClick={() => onAccept(suggestion)}
            >
              <Check className="h-3 w-3 mr-1" />
              Accepter
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActionSuggestionItem;
