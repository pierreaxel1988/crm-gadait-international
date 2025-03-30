
import React from 'react';
import LeadTag from '@/components/common/LeadTag';
import { getStatusColors } from '../utils/leadFormatUtils';
import { LeadStatus } from '@/components/common/StatusBadge';
import { formatBudget } from '../utils/leadFormatUtils';
import { Currency } from '@/types/lead';

interface LeadTagsListProps {
  columnStatus: LeadStatus;
  taskType?: string;
  nextFollowUpDate?: string;
  desiredLocation?: string;
  budget?: string;
  currency?: Currency;
}

const LeadTagsList: React.FC<LeadTagsListProps> = ({
  columnStatus,
  taskType,
  nextFollowUpDate,
  desiredLocation,
  budget,
  currency
}) => {
  const statusColors = getStatusColors(columnStatus);
  
  return (
    <div className="flex flex-wrap items-center text-sm mt-1 gap-1.5 rounded-sm mx-0 px-0 py-[4px] bg-black/0">
      <LeadTag 
        label={columnStatus} 
        bgColor={statusColors.bg} 
        textColor={statusColors.text} 
        className="font-futuraLight" 
      />
      
      {taskType && (
        <LeadTag 
          label={taskType} 
          bgColor={nextFollowUpDate ? 
            taskType === 'Call' ? 'bg-[#EBD5CE]' : 
            taskType === 'Follow up' ? 'bg-[#F3E9D6]' : 
            'bg-[#DCE4E3]' 
            : 'bg-[#F5F3EE]'
          } 
          textColor={nextFollowUpDate ? 
            taskType === 'Call' ? 'text-[#96493D]' : 
            taskType === 'Follow up' ? 'text-[#B58C59]' : 
            'text-[#4C5C59]' 
            : 'text-[#7A6C5D]'
          } 
          className="font-futuraLight" 
        />
      )}
      
      {desiredLocation && (
        <LeadTag 
          label={desiredLocation} 
          bgColor="bg-[#F5F3EE]" 
          textColor="text-[#7A6C5D]" 
          className="font-futuraLight" 
        />
      )}
      
      {budget && (
        <LeadTag 
          label={formatBudget(budget, currency)} 
          bgColor="bg-[#F5F3EE]" 
          textColor="text-[#7A6C5D]" 
          className="font-futuraLight min-w-[100px] text-center" 
        />
      )}
    </div>
  );
};

export default LeadTagsList;
