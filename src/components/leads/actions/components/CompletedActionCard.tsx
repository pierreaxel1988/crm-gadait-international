
import React from 'react';
import { format } from 'date-fns';
import { Check, Phone, Calendar } from 'lucide-react';
import { ActionHistory } from '@/types/actionHistory';

interface CompletedActionCardProps {
  action: ActionHistory;
}

const CompletedActionCard: React.FC<CompletedActionCardProps> = ({ action }) => {
  return (
    <div className="rounded-lg border border-gray-100 p-2 bg-white shadow-sm mb-2 w-full">
      <div className="flex items-start gap-2">
        <div className="h-6 w-6 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
          {action.actionType === 'Call' ? (
            <Phone className="h-3 w-3 text-gray-500" />
          ) : (
            <Calendar className="h-3 w-3 text-gray-500" />
          )}
        </div>
        
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-600 truncate">
              {action.actionType}
            </span>
            <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2 flex items-center">
              <Check className="h-2.5 w-2.5 mr-1 text-green-500" />
              {format(new Date(action.completedDate || ''), 'dd/MM/yyyy HH:mm')}
            </span>
          </div>
          
          {action.notes && (
            <p className="text-xs mt-1 text-gray-500 break-words leading-tight max-w-full overflow-hidden">
              {action.notes}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompletedActionCard;
