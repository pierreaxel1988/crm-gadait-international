
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
      <Card className="text-center py-6 text-loro-navy/60 border border-dashed border-loro-sand/30 font-futuraLight">
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
              ? "bg-loro-white/90 border-loro-sand/20" 
              : "bg-loro-white shadow-luxury border-loro-sand/30"
          )}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className={cn(
                  "p-2 rounded-md",
                  action.completedDate ? "bg-loro-pearl/30" : "bg-loro-pearl/50"
                )}>
                  {getActionTypeIcon(action.actionType as TaskType)}
                </div>
                <span className={cn(
                  "text-sm font-futuraLight px-2 py-1 rounded-full",
                  action.completedDate 
                    ? "bg-loro-sand/20 text-loro-hazel" 
                    : "bg-loro-pearl/70 text-loro-navy"
                )}>
                  {action.completedDate ? "Terminé" : "À faire"}
                </span>
              </div>
              
              {action.scheduledDate && (
                <div className="flex items-center gap-2 text-sm text-loro-navy/60 mt-2 font-futuraLight">
                  <Calendar className="h-4 w-4 text-loro-hazel" />
                  <span>
                    {format(new Date(action.scheduledDate), 'dd MMMM yyyy', { locale: fr })}
                  </span>
                  <Clock className="h-4 w-4 ml-2 text-loro-hazel" />
                  <span>
                    {format(new Date(action.scheduledDate), 'HH:mm', { locale: fr })}
                  </span>
                </div>
              )}
              
              {action.notes && (
                <p className="text-sm mt-3 bg-loro-pearl/20 p-3 rounded-md border border-loro-pearl/30 font-futuraLight text-loro-navy/80">
                  {action.notes}
                </p>
              )}
              
              <p className="text-xs text-loro-navy/50 mt-3 font-futuraLight">
                Créé le {format(new Date(action.createdAt), 'dd MMMM yyyy', { locale: fr })}
              </p>
            </div>
            
            {!action.completedDate && (
              <CustomButton
                variant="loropiana"
                size="sm"
                onClick={() => onMarkComplete(action.id)}
                className="text-xs flex items-center gap-1 whitespace-nowrap"
                fontStyle="optima"
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
