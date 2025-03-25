
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
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  
  if (!actionHistory || actionHistory.length === 0) {
    return (
      <div className="text-center py-6 px-4 animate-[fade-in_0.4s_ease-out] bg-loro-pearl/10 rounded-lg border border-loro-pearl/30">
        <div className="mx-auto h-12 w-12 rounded-full bg-loro-pearl/50 flex items-center justify-center mb-4">
          <AlertCircle className="h-6 w-6 text-loro-navy/70" />
        </div>
        <p className="text-loro-navy font-futura text-lg tracking-wide">Aucune action dans l'historique</p>
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
      return format(date, 'dd/MM/yyyy', { locale: fr });
    }
  };

  return (
    <div className="space-y-6">
      {sortedDates.map((dateString) => (
        <div key={dateString} className="animate-[fade-in_0.4s_ease-out]">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-6 w-6 rounded-full bg-loro-pearl/50 flex items-center justify-center">
              <Calendar className="h-3.5 w-3.5 text-loro-navy" />
            </div>
            <h3 className="text-sm font-futura text-loro-navy tracking-wide">
              {getFormattedDate(dateString)}
            </h3>
            <Separator className="flex-1 bg-loro-pearl/50" />
          </div>
          
          <div className="space-y-3 pl-4 border-l border-loro-pearl/30">
            {groupedActions[dateString].map((action) => (
              <Card 
                key={action.id} 
                className={cn(
                  "relative overflow-hidden transition-all duration-300 rounded-lg border",
                  action.completedDate 
                    ? "border-loro-pearl/50 bg-loro-pearl/10" 
                    : "border-loro-pearl/50 bg-loro-pearl/5"
                )}
              >
                {/* Dot on timeline */}
                <div 
                  className={cn(
                    "absolute -left-[14px] top-1/2 transform -translate-y-1/2 h-5 w-5 rounded-full border-2 border-white",
                    action.completedDate 
                      ? "bg-green-500" 
                      : "bg-amber-500"
                  )}
                />
                
                <div className={`${isMobile ? 'p-3' : 'p-4'}`}>
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={cn(
                          "p-2 rounded-md",
                          action.completedDate 
                            ? "bg-green-100" 
                            : "bg-amber-100"
                        )}>
                          {getActionTypeIcon(action.actionType as TaskType)}
                        </div>
                        <div>
                          <span className="text-loro-navy/80 font-futura text-sm">
                            {action.actionType}
                          </span>
                          <div className="flex items-center gap-1 text-xs text-loro-navy/60 mt-0.5 font-futuraLight">
                            <Clock className="h-3 w-3 text-loro-navy/50" />
                            <span>
                              {format(new Date(action.completedDate || action.scheduledDate), 'HH:mm', { locale: fr })}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {action.notes && (
                        <p className="text-sm mt-2 bg-white p-2.5 rounded-md font-futuraLight text-loro-navy/70 border border-loro-pearl/30">
                          {action.notes}
                        </p>
                      )}
                    </div>
                    
                    {!action.completedDate && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onMarkComplete(action.id)}
                        className="text-xs flex items-center gap-1 border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400 rounded-full px-2.5 py-1 h-7 font-futura"
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
