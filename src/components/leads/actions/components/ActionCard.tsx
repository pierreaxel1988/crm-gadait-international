
import React from 'react';
import { format } from 'date-fns';
import { Check, Clock, Calendar, Trash2, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ActionHistory } from '@/types/actionHistory';

interface ActionCardProps {
  action: ActionHistory;
  onMarkComplete: (action: ActionHistory) => void;
  onDelete: (id: string) => void;
  isOverdue: boolean;
  isCallAction: boolean;
}

const ActionCard: React.FC<ActionCardProps> = ({
  action,
  onMarkComplete,
  onDelete,
  isOverdue,
  isCallAction
}) => {
  return (
    <div 
      className={cn(
        "rounded-lg border p-2 mb-2 animate-[fade-in_0.3s_ease-out] w-full",
        isOverdue 
          ? isCallAction 
            ? 'bg-[#FDF4F6]/50 border-pink-200' 
            : 'bg-[#FFDEE2]/30 border-pink-200' 
          : 'bg-[#F2FCE2]/40 border-green-100'
      )}
    >
      <div className="flex items-start gap-2">
        <div className={cn(
          "h-6 w-6 rounded-full flex items-center justify-center shrink-0",
          isCallAction 
            ? isOverdue 
              ? 'bg-[#FDF4F6] text-[#D05A76]' 
              : 'bg-[#EBD5CE] text-[#D05A76]' 
            : isOverdue 
              ? 'bg-rose-100 text-rose-600' 
              : 'bg-green-100 text-green-600'
        )}>
          {action.actionType === 'Call' ? (
            <Phone className="h-3 w-3" />
          ) : (
            <Calendar className="h-3 w-3" />
          )}
        </div>
        
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-loro-navy truncate">
              {action.actionType}
            </span>
            <span className="text-[10px] text-gray-500 whitespace-nowrap ml-2">
              <Clock className="h-2.5 w-2.5 inline-block mr-0.5" />
              {format(new Date(action.scheduledDate), 'dd/MM/yyyy HH:mm')}
            </span>
          </div>
          
          {action.notes && (
            <p className={cn(
              "text-xs p-1.5 rounded-lg mt-1.5 break-words max-w-full overflow-hidden",
              isOverdue 
                ? 'bg-white/80 text-rose-800 border border-rose-100' 
                : 'bg-white/80 text-green-800 border border-green-100'
            )}>
              {action.notes}
            </p>
          )}
          
          <div className="flex justify-end items-center gap-1.5 mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(action.id)}
              className="h-7 w-7 p-0 text-gray-400 hover:text-rose-500 hover:bg-transparent"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
            
            <Button 
              variant="outline"
              size="sm"
              onClick={() => onMarkComplete(action)}
              className={cn(
                "h-7 px-2 text-[11px]",
                isOverdue 
                  ? "border-rose-300 text-rose-600 hover:bg-rose-50" 
                  : "border-green-300 text-green-600 hover:bg-green-50"
              )}
            >
              <Check className="h-3 w-3 mr-1" />
              Terminer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionCard;
