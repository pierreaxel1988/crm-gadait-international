
import React from 'react';
import { Check, Calendar, Clock, AlertCircle } from 'lucide-react';
import { format, isToday, isYesterday, isPast } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { TaskType } from '@/components/kanban/KanbanCard';
import { ActionHistory } from '@/types/actionHistory';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from '@/components/ui/scroll-area';

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
      <div className="text-center py-8 px-3 animate-[fade-in_0.4s_ease-out] bg-white rounded-lg border border-gray-100 shadow-sm">
        <div className="mx-auto h-14 w-14 rounded-full bg-gray-50 flex items-center justify-center mb-3">
          <AlertCircle className="h-7 w-7 text-loro-navy/40" />
        </div>
        <p className="text-loro-navy font-futura text-base tracking-wide">Aucune action dans l'historique</p>
        <p className="text-sm text-loro-navy/60 font-futuraLight mt-1">Les actions terminées apparaîtront ici</p>
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
      return format(date, 'dd MMMM yyyy', { locale: fr });
    }
  };
  
  // Check if a date is in the past
  const isDatePast = (dateString: string): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <ScrollArea className="h-[calc(100vh-280px)]">
      <div className="space-y-8 pr-3">
        {sortedDates.map((dateString, dateIndex) => (
          <div key={dateString} className={`animate-[fade-in_0.${dateIndex + 3}s_ease-out]`}>
            <div className="flex items-center gap-2 mb-4 sticky top-0 bg-white py-2 z-10">
              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-loro-navy/70" />
              </div>
              <h3 className="text-base font-medium text-loro-navy tracking-wide">
                {getFormattedDate(dateString)}
              </h3>
              <Separator className="flex-1 bg-gray-200" />
            </div>
            
            <div className="space-y-4 pl-6 border-l-2 border-gray-200">
              {groupedActions[dateString].map((action, actionIndex) => {
                // Determine if action is overdue (past date and not completed)
                const isOverdue = isDatePast(action.scheduledDate) && !action.completedDate;
                
                return (
                  <div 
                    key={action.id} 
                    className={cn(
                      "relative transition-all duration-300 hover:translate-x-1",
                      "transform-gpu animate-[fade-in_0.6s_ease-out]",
                      actionIndex % 2 === 0 ? "animate-delay-100" : "animate-delay-200"
                    )}
                    style={{animationDelay: `${actionIndex * 0.1}s`}}
                  >
                    {/* Timeline dot */}
                    <div 
                      className={cn(
                        "absolute -left-[25px] top-4 h-5 w-5 rounded-full border-4 border-white",
                        action.completedDate 
                          ? "bg-green-500" 
                          : isOverdue
                            ? "bg-red-400"
                            : "bg-blue-400"
                      )}
                    />
                    
                    <Card 
                      className={cn(
                        "overflow-hidden transition-all duration-300 hover:shadow-md",
                        action.completedDate 
                          ? "border-green-100 bg-green-50/40" 
                          : isOverdue
                            ? "border-red-100 bg-red-50/40"
                            : "border-blue-100 bg-blue-50/40"
                      )}
                    >
                      <div className={`p-4`}>
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                `p-2 rounded-md`,
                                action.completedDate 
                                  ? "bg-green-100" 
                                  : isOverdue
                                    ? "bg-red-100"
                                    : "bg-blue-100"
                              )}>
                                {getActionTypeIcon(action.actionType as TaskType)}
                              </div>
                              <div>
                                <span className={`${
                                  action.completedDate 
                                    ? 'text-green-800' 
                                    : isOverdue
                                      ? 'text-red-800'
                                      : 'text-blue-800'
                                } font-medium text-base`}>
                                  {action.actionType}
                                </span>
                                <div className="flex items-center gap-1.5 text-sm mt-0.5">
                                  {action.completedDate ? (
                                    <>
                                      <Check className="h-3.5 w-3.5 text-green-600" />
                                      <span className="text-green-700">
                                        Terminé à {format(new Date(action.completedDate), 'HH:mm', { locale: fr })}
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <Clock className={`h-3.5 w-3.5 ${isOverdue ? 'text-red-500' : 'text-blue-500'}`} />
                                      <span className={isOverdue ? 'text-red-700' : 'text-blue-700'}>
                                        {isOverdue ? 'En retard depuis ' : 'Prévu pour '} 
                                        {format(new Date(action.scheduledDate), 'HH:mm', { locale: fr })}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {action.notes && (
                              <p className={`text-sm mt-3 p-3 rounded-md font-light leading-relaxed ${
                                action.completedDate 
                                  ? 'bg-white text-gray-700 border border-green-100' 
                                  : isOverdue
                                    ? 'bg-white text-gray-700 border border-red-100'
                                    : 'bg-white text-gray-700 border border-blue-100'
                              }`}>
                                {action.notes}
                              </p>
                            )}
                          </div>
                          
                          {!action.completedDate && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onMarkComplete(action.id)}
                              className={`text-xs px-3 py-1 h-8 flex items-center gap-1 ${
                                isOverdue 
                                  ? 'border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800' 
                                  : 'border-blue-300 text-blue-700 hover:bg-blue-50 hover:text-blue-800'
                              } rounded-full`}
                            >
                              <Check className="h-3.5 w-3.5" /> Terminer
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default ActionHistoryList;
