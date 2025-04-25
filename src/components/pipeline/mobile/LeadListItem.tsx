
import React from 'react';
import { ChevronRight } from 'lucide-react';
import LeadTagsList from './components/LeadTagsList';
import { LeadStatus } from '@/components/common/StatusBadge';
import { Currency } from '@/types/lead';

export interface LeadListItemProps {
  id: string;
  title: string;
  status: LeadStatus;
  taskType?: string;
  nextFollowUpDate?: string;
  desiredLocation?: string;
  budget?: string;
  currency?: Currency;
  onClick: () => void;
}

const LeadListItem: React.FC<LeadListItemProps> = ({
  id,
  title,
  status,
  taskType,
  nextFollowUpDate,
  desiredLocation,
  budget,
  currency,
  onClick
}) => {
  return (
    <div 
      className="bg-white p-3 rounded-md mb-2 shadow-sm border border-gray-100 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between items-center">
        <h3 className="text-base font-medium">{title || 'Sans titre'}</h3>
        <ChevronRight className="h-4 w-4 text-gray-400" />
      </div>
      
      <LeadTagsList 
        columnStatus={status}
        taskType={taskType}
        nextFollowUpDate={nextFollowUpDate}
        desiredLocation={desiredLocation}
        budget={budget}
        currency={currency}
      />
    </div>
  );
};

export default LeadListItem;
