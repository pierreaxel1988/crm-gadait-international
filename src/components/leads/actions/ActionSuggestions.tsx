
import React from 'react';
import { Lightbulb } from 'lucide-react';
import { ActionSuggestion } from '@/services/noteAnalysisService';
import ActionSuggestionCard from './ActionSuggestion';

interface ActionSuggestionsProps {
  suggestions: ActionSuggestion[];
  onAccept: (suggestion: ActionSuggestion) => void;
  onReject: (suggestion: ActionSuggestion) => void;
  compact?: boolean;
}

const ActionSuggestions: React.FC<ActionSuggestionsProps> = ({
  suggestions,
  onAccept,
  onReject,
  compact = false
}) => {
  if (!suggestions || suggestions.length === 0) return null;

  if (compact) {
    return (
      <div className="space-y-3 mb-2">
        {suggestions.map((suggestion, index) => (
          <ActionSuggestionCard
            key={`${suggestion.actionType}-${suggestion.scheduledDate.getTime()}-${index}`}
            suggestion={suggestion}
            onAccept={onAccept}
            onReject={onReject}
            compact={true}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 mb-4 p-2">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-amber-600" />
        <h3 className="text-sm font-medium">Actions suggérées ({suggestions.length})</h3>
      </div>
      <div className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <ActionSuggestionCard
            key={`${suggestion.actionType}-${suggestion.scheduledDate.getTime()}-${index}`}
            suggestion={suggestion}
            onAccept={onAccept}
            onReject={onReject}
          />
        ))}
      </div>
    </div>
  );
};

export default ActionSuggestions;
