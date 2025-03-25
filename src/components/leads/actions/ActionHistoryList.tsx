
import React from 'react';
import { Check, Calendar, Clock, AlertCircle } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { TaskType } from '@/components/kanban/KanbanCard';
import { ActionHistory } from '@/types/actionHistory';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

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
      <div className="text-center py-10 px-4 animate-[fade-in_0.4s_ease-out] bg-gradient-to-b from-loro-pearl/10 to-white rounded-xl border border-loro-pearl/30">
        <div className="mx-auto h-14 w-14 rounded-full bg-chocolate-dark/10 flex items-center justify-center mb-4 shadow-inner">
          <AlertCircle className="h-7 w-7 text-chocolate-dark/70" />
        </div>
        <p className="text-loro-navy font-optima text-lg">Aucune action dans l'historique</p>
        <p className="text-sm text-loro-navy/60 font-futuraLight mt-2">Les actions terminées apparaîtront ici</p>
      </div>
    );
  }

  // Group actions by completion date (for completed) or scheduled date (for pending)
  const groupedActions = actionHistory.reduce((groups, action) => {
    const date = action.completedDate 
      ? new Date(action.completedDate).toDateString() 
      : new Date(action.scheduledDate).toDateString();
    
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(action);
    return groups;
  }, {} as Record<string, ActionHistory[]>);

  // Sort dates with most recent first
  const sortedDates = Object.keys(groupedActions).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  const getFormattedDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return "Aujourd'hui";
    } else if (isYesterday(date)) {
      return "Hier";
    } else {
      return format(date, 'EEEE d MMMM', { locale: fr });
    }
  };

  return (
    <div className="space-y-6">
      {sortedDates.map((dateString) => (
        <div key={dateString} className="animate-[fade-in_0.4s_ease-out]">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-6 w-6 rounded-full bg-chocolate-dark/15 flex items-center justify-center shadow-inner">
              <Calendar className="h-3.5 w-3.5 text-chocolate-dark" />
            </div>
            <h3 className="text-sm font-optima text-loro-navy capitalize">
              {getFormattedDate(dateString)}
            </h3>
            <Separator className="flex-1 bg-gradient-to-r from-loro-pearl to-loro-pearl/20" />
          </div>
          
          <div className="space-y-4 pl-4 border-l-2 border-chocolate-dark/20">
            {groupedActions[dateString].map((action) => (
              <Card 
                key={action.id} 
                className={cn(
                  "relative overflow-hidden transition-all duration-300 rounded-xl",
                  action.completedDate 
                    ? "border-loro-pearl/50 bg-gradient-to-br from-white to-loro-pearl/20 hover:shadow-md" 
                    : "border-chocolate-dark/30 bg-gradient-to-br from-white to-loro-pearl/10 hover:shadow-md"
                )}
              >
                {/* Dot on timeline */}
                <div 
                  className={cn(
                    "absolute -left-[21px] top-1/2 transform -translate-y-1/2 h-5 w-5 rounded-full border-2 border-white shadow-md",
                    action.completedDate 
                      ? "bg-green-500" 
                      : "bg-amber-500"
                  )}
                />
                
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={cn(
                          "p-2 rounded-lg shadow-inner",
                          action.completedDate 
                            ? "bg-green-100" 
                            : "bg-chocolate-dark/10"
                        )}>
                          {getActionTypeIcon(action.actionType as TaskType)}
                        </div>
                        <span className={cn(
                          "text-xs py-1 px-3 rounded-full font-futura",
                          action.completedDate 
                            ? "bg-green-50 text-green-700 border border-green-200 shadow-sm" 
                            : "bg-amber-50 text-amber-700 border border-amber-200 shadow-sm"
                        )}>
                          {action.completedDate ? "Terminé" : "À faire"}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-loro-navy/60 mt-1 mb-2 font-futuraLight">
                        <Clock className="h-3 w-3 text-chocolate-dark/70" />
                        <span>
                          {format(new Date(action.completedDate || action.scheduledDate), 'HH:mm')}
                        </span>
                      </div>
                      
                      {action.notes && (
                        <p className="text-sm mt-3 bg-white p-3 rounded-lg font-futuraLight text-loro-navy/70 border border-loro-pearl/40 shadow-sm">
                          {action.notes}
                        </p>
                      )}
                    </div>
                    
                    {!action.completedDate && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onMarkComplete(action.id)}
                        className="text-xs flex items-center gap-1 border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400 rounded-full px-3 shadow-sm"
                      >
                        <Check className="h-3 w-3" /> Terminer
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActionHistoryList;
