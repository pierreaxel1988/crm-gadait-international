
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
        "rounded-lg border p-3 animate-[fade-in_0.3s_ease-out]",
        isOverdue 
          ? isCallAction 
            ? 'bg-[#FDF4F6]/50 border-pink-200' 
            : 'bg-[#FFDEE2]/30 border-pink-200' 
          : 'bg-[#F2FCE2]/40 border-green-100'
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
          isCallAction 
            ? isOverdue 
              ? 'bg-[#FDF4F6] text-[#D05A76]' 
              : 'bg-[#EBD5CE] text-[#D05A76]' 
            : isOverdue 
              ? 'bg-rose-100 text-rose-600' 
              : 'bg-green-100 text-green-600'
        )}>
          {action.actionType === 'Call' ? (
            <Phone className="h-5 w-5" />
          ) : (
            <Calendar className="h-5 w-5" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-loro-navy truncate">
              {action.actionType}
            </span>
            <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
              <Clock className="h-3 w-3 inline-block mr-1" />
              {format(new Date(action.scheduledDate), 'dd/MM/yyyy HH:mm')}
            </span>
          </div>
          
          {action.notes && (
            <p className={cn(
              "text-sm p-2 rounded-lg mt-2 break-words",
              isOverdue 
                ? 'bg-white/80 text-rose-800 border border-rose-100' 
                : 'bg-white/80 text-green-800 border border-green-100'
            )}>
              {action.notes}
            </p>
          )}
          
          <div className="flex justify-end items-center gap-2 mt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(action.id)}
              className="h-8 w-8 p-0 text-gray-400 hover:text-rose-500 hover:bg-transparent"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline"
              size="sm"
              onClick={() => onMarkComplete(action)}
              className={cn(
                "h-8 font-futura text-xs",
                isOverdue 
                  ? "border-rose-300 text-rose-600 hover:bg-rose-50" 
                  : "border-green-300 text-green-600 hover:bg-green-50"
              )}
            >
              <Check className="h-3.5 w-3.5 mr-1.5" />
              Terminer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionCard;
