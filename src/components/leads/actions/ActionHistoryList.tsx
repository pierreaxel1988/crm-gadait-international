
import React from 'react';
import { format, isPast, isToday } from 'date-fns';
import { Check, AlertTriangle, Phone, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ActionHistory, TaskType } from '@/types/actionHistory';

interface ActionHistoryListProps {
  actionHistory: ActionHistory[];
  getActionTypeIcon: (type: TaskType) => React.ReactNode;
  onMarkComplete: (actionId: string) => void;
}

const ActionHistoryList: React.FC<ActionHistoryListProps> = ({
  actionHistory,
  getActionTypeIcon,
  onMarkComplete
}) => {
  if (!actionHistory || actionHistory.length === 0) {
    return <div className="text-sm text-gray-500 italic">Aucun historique d'actions pour le moment.</div>;
  }

  return (
    <div className="space-y-3">
      {actionHistory.map(action => (
        <div key={action.id} className="rounded-md border p-3 shadow-sm transition-all hover:shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-sm font-medium flex items-center gap-2">
                {getActionTypeIcon(action.actionType as TaskType)}
                {action.notes && (
                  <span className="text-xs text-gray-500 italic">
                    {action.notes}
                  </span>
                )}
              </h4>
              <p className="text-xs text-gray-500">
                {action.completedDate ? (
                  <>
                    Terminée le {format(new Date(action.completedDate), 'dd/MM/yyyy à HH:mm')}
                  </>
                ) : (
                  <>
                    Prévue le {format(new Date(action.scheduledDate), 'dd/MM/yyyy à HH:mm')}
                    {isPast(new Date(action.scheduledDate)) && !isToday(new Date(action.scheduledDate)) && (
                      <span className="ml-1 text-rose-500 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        En retard
                      </span>
                    )}
                  </>
                )}
              </p>
            </div>
            
            {!action.completedDate && (
              <Button variant="outline" size="sm" onClick={() => onMarkComplete(action.id)}>
                <Check className="h-3 w-3 mr-2" />
                Terminer
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActionHistoryList;
