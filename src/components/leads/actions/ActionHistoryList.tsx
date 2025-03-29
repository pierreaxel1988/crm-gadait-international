
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
      <div className="text-center py-4 px-3 animate-[fade-in_0.4s_ease-out] bg-loro-pearl/5 rounded-lg border border-loro-pearl/20">
        <div className="mx-auto h-10 w-10 rounded-full bg-loro-pearl/30 flex items-center justify-center mb-3">
          <AlertCircle className="h-5 w-5 text-loro-navy/60" />
        </div>
        <p className="text-loro-navy font-futura text-base tracking-wide">Aucune action dans l'historique</p>
        <p className="text-xs text-loro-navy/60 font-futuraLight mt-1">Les actions terminées apparaîtront ici</p>
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
    <ScrollArea className="h-[calc(100vh-280px)]">
      <div className="space-y-5 pr-3">
        {sortedDates.map((dateString) => (
          <div key={dateString} className="animate-[fade-in_0.4s_ease-out]">
            <div className="flex items-center gap-2 mb-2.5 sticky top-0 bg-white py-1">
              <div className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} rounded-full bg-loro-pearl/30 flex items-center justify-center`}>
                <Calendar className={`${isMobile ? 'h-3 w-3' : 'h-3.5 w-3.5'} text-loro-navy/70`} />
              </div>
              <h3 className={`${isMobile ? 'text-xs' : 'text-sm'} font-futura text-loro-navy/80 tracking-wide`}>
                {getFormattedDate(dateString)}
              </h3>
              <Separator className="flex-1 bg-loro-pearl/30" />
            </div>
            
            <div className={`space-y-2 pl-${isMobile ? '3' : '4'} border-l border-loro-pearl/20`}>
              {groupedActions[dateString].map((action) => (
                <Card 
                  key={action.id} 
                  className={cn(
                    "relative overflow-hidden transition-all duration-300 rounded-lg border shadow-sm",
                    action.completedDate 
                      ? "border-loro-pearl/30 bg-[#F1F0FB]" // Soft gray for completed actions
                      : "border-loro-pearl/30 bg-white"
                  )}
                >
                  {/* Dot on timeline */}
                  <div 
                    className={cn(
                      "absolute -left-[10px] top-1/2 transform -translate-y-1/2 h-4 w-4 rounded-full border-2 border-white",
                      action.completedDate 
                        ? "bg-green-500" 
                        : "bg-amber-500"
                    )}
                  />
                  
                  <div className={`${isMobile ? 'p-2.5' : 'p-3'}`}>
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2.5">
                          <div className={cn(
                            `${isMobile ? 'p-1.5' : 'p-1.5'} rounded-md`,
                            action.completedDate 
                              ? "bg-green-50" 
                              : "bg-amber-50"
                          )}>
                            {getActionTypeIcon(action.actionType as TaskType)}
                          </div>
                          <div>
                            <span className={`${action.completedDate ? 'text-gray-600' : 'text-loro-navy/80'} font-futura ${isMobile ? 'text-xs' : 'text-sm'}`}>
                              {action.actionType}
                            </span>
                            <div className="flex items-center gap-1 text-xs text-loro-navy/50 mt-0.5 font-futuraLight">
                              {action.completedDate ? (
                                <Check className="h-3 w-3 text-green-500" />
                              ) : (
                                <Clock className="h-3 w-3 text-loro-navy/40" />
                              )}
                              <span>
                                {format(new Date(action.completedDate || action.scheduledDate), 'HH:mm', { locale: fr })}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {action.notes && (
                          <p className={`${isMobile ? 'text-xs mt-1.5 p-2' : 'text-sm mt-2 p-2.5'} ${
                            action.completedDate 
                              ? 'bg-white rounded-md font-futuraLight text-gray-500 border border-loro-pearl/20' 
                              : 'bg-white rounded-md font-futuraLight text-loro-navy/70 border border-loro-pearl/20'
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
                          className={`${isMobile ? 'text-[10px] px-2 py-0.5 h-6' : 'text-xs px-2.5 py-1 h-7'} flex items-center gap-1 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 rounded-full font-futura`}
                        >
                          <Check className={`${isMobile ? 'h-2.5 w-2.5' : 'h-3 w-3'}`} /> Terminer
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
    </ScrollArea>
  );
};

export default ActionHistoryList;
