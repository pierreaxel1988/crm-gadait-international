import React from 'react';
import { ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';

export interface ActionItem {
  id: string;
  leadId: string;
  leadName: string;
  actionType: string;
  scheduledDate: string;
  status: 'overdue' | 'today' | 'upcoming';
  dayLabel?: string;
}

interface ActionRowProps {
  action: ActionItem;
  onClick: () => void;
  onComplete?: (action: ActionItem) => void;
  completing?: boolean;
}

const ActionRow = ({ action, onClick, onComplete, completing }: ActionRowProps) => (
  <div className="w-full flex items-center justify-between px-2 py-1.5 rounded hover:bg-muted/50 transition-colors text-left">
    <button onClick={onClick} className="flex-1 min-w-0 text-left">
      <p className="text-sm font-medium text-foreground truncate">{action.leadName}</p>
      <p className="text-xs text-muted-foreground">
        {action.actionType}
        {action.dayLabel && <span className="ml-1">· {action.dayLabel}</span>}
      </p>
    </button>
    <div className="flex items-center gap-1 flex-shrink-0 ml-2">
      {onComplete && (
        <button
          onClick={(e) => { e.stopPropagation(); onComplete(action); }}
          disabled={completing}
          className="p-1 rounded-full hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-muted-foreground hover:text-green-600"
          title="Marquer comme fait"
        >
          {completing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
        </button>
      )}
      <button onClick={onClick} className="p-1">
        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
      </button>
    </div>
  </div>
);

export default ActionRow;
