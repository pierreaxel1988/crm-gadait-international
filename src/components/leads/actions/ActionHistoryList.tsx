
import React from 'react';
import { Check } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { TaskType } from '@/components/kanban/KanbanCard';
import { ActionHistory } from '@/types/actionHistory';
import CustomButton from '@/components/ui/CustomButton';

interface ActionHistoryListProps {
  actionHistory?: ActionHistory[];
  getActionTypeIcon: (type: TaskType) => React.ReactNode;
  onMarkComplete: (actionId: string) => void;
}

const ActionHistoryList: React.FC<ActionHistoryListProps> = ({
  actionHistory,
  getActionTypeIcon,
  onMarkComplete
}) => {
  if (!actionHistory || actionHistory.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground border border-dashed rounded-md">
        Aucune action dans l'historique
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {actionHistory.map((action) => (
        <div 
          key={action.id} 
          className={cn(
            "p-3 border rounded-md",
            action.completedDate ? "bg-gray-50" : "bg-white"
          )}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {getActionTypeIcon(action.actionType as TaskType)}
                <span className="text-sm font-medium">
                  {action.completedDate ? "Terminé" : "À faire"}
                </span>
              </div>
              
              {action.scheduledDate && (
                <p className="text-sm text-muted-foreground mt-1">
                  Prévu le: {format(new Date(action.scheduledDate), 'dd/MM/yyyy à HH:mm')}
                </p>
              )}
              
              {action.notes && (
                <p className="text-sm mt-2 bg-gray-50 p-2 rounded">
                  {action.notes}
                </p>
              )}
              
              <p className="text-xs text-muted-foreground mt-2">
                Créé le {format(new Date(action.createdAt), 'dd/MM/yyyy')}
              </p>
            </div>
            
            {!action.completedDate && (
              <CustomButton
                variant="outline"
                size="sm"
                onClick={() => onMarkComplete(action.id)}
                className="text-xs flex items-center gap-1 whitespace-nowrap"
              >
                <Check className="h-3 w-3" /> Terminé
              </CustomButton>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActionHistoryList;
