
import React from 'react';
import { format } from 'date-fns';
import { Check, Phone, Calendar } from 'lucide-react';
import { ActionHistory } from '@/types/actionHistory';

interface CompletedActionCardProps {
  action: ActionHistory;
}

const CompletedActionCard: React.FC<CompletedActionCardProps> = ({ action }) => {
  return (
    <div className="rounded-lg border border-gray-200 p-3 bg-gray-50">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
          {action.actionType === 'Call' ? (
            <Phone className="h-5 w-5 text-gray-600" />
          ) : (
            <Calendar className="h-5 w-5 text-gray-600" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-600 truncate">
              {action.actionType}
            </span>
            <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
              <Check className="h-3 w-3 inline-block mr-1 text-green-500" />
              {format(new Date(action.completedDate || ''), 'dd/MM/yyyy HH:mm')}
            </span>
          </div>
          
          {action.notes && (
            <p className="text-sm p-2 rounded-lg mt-2 bg-white text-gray-600 break-words border border-gray-100">
              {action.notes}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompletedActionCard;
