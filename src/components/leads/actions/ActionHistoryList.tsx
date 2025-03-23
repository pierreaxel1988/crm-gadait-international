
import React from 'react';
import { Check, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { TaskType } from '@/components/kanban/KanbanCard';
import { ActionHistory } from '@/types/actionHistory';
import CustomButton from '@/components/ui/CustomButton';
import { Card } from '@/components/ui/card';

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
      <Card className="text-center py-6 text-muted-foreground border border-dashed">
        Aucune action dans l'historique
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {actionHistory.map((action) => (
        <Card 
          key={action.id} 
          className={cn(
            "p-4 border",
            action.completedDate 
              ? "bg-gray-50 border-green-100" 
              : "bg-white/70 shadow-sm border-chocolate-light/20"
          )}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className={cn(
                  "p-2 rounded-md",
                  action.completedDate ? "bg-green-50" : "bg-chocolate-light/10"
                )}>
                  {getActionTypeIcon(action.actionType as TaskType)}
                </div>
                <span className={cn(
                  "text-sm font-medium px-2 py-1 rounded-full",
                  action.completedDate 
                    ? "bg-green-100 text-green-800" 
                    : "bg-orange-100 text-orange-800"
                )}>
                  {action.completedDate ? "Terminé" : "À faire"}
                </span>
              </div>
              
              {action.scheduledDate && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                  <Calendar className="h-4 w-4 text-chocolate-light" />
                  <span>
                    {format(new Date(action.scheduledDate), 'dd MMMM yyyy', { locale: fr })}
                  </span>
                  <Clock className="h-4 w-4 ml-2 text-chocolate-light" />
                  <span>
                    {format(new Date(action.scheduledDate), 'HH:mm', { locale: fr })}
                  </span>
                </div>
              )}
              
              {action.notes && (
                <p className="text-sm mt-3 bg-gray-50 p-3 rounded-md border border-gray-100">
                  {action.notes}
                </p>
              )}
              
              <p className="text-xs text-muted-foreground mt-3">
                Créé le {format(new Date(action.createdAt), 'dd MMMM yyyy', { locale: fr })}
              </p>
            </div>
            
            {!action.completedDate && (
              <CustomButton
                variant={action.completedDate ? "outline" : "chocolate"}
                size="sm"
                onClick={() => onMarkComplete(action.id)}
                className="text-xs flex items-center gap-1 whitespace-nowrap"
              >
                <Check className="h-3 w-3" /> Terminé
              </CustomButton>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ActionHistoryList;
