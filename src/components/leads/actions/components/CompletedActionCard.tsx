
import React from 'react';
import { format } from 'date-fns';
import { Check, Phone, Calendar } from 'lucide-react';
import { ActionHistory } from '@/types/actionHistory';

interface CompletedActionCardProps {
  action: ActionHistory;
}

const CompletedActionCard: React.FC<CompletedActionCardProps> = ({ action }) => {
  return (
    <div className="rounded-lg border border-gray-100 p-3 bg-white shadow-sm">
      <div className="flex items-start gap-3">
        <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
          {action.actionType === 'Call' ? (
            <Phone className="h-4 w-4 text-gray-500" />
          ) : (
            <Calendar className="h-4 w-4 text-gray-500" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-600">
              {action.actionType}
            </span>
            <span className="text-xs text-gray-400 whitespace-nowrap ml-2 flex items-center">
              <Check className="h-3 w-3 mr-1 text-green-500" />
              {format(new Date(action.completedDate || ''), 'dd/MM/yyyy HH:mm')}
            </span>
          </div>
          
          {action.notes && (
            <p className="text-sm mt-1.5 text-gray-500 break-words leading-relaxed">
              {action.notes}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompletedActionCard;
