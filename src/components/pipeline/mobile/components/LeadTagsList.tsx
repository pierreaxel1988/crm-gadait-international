
import React from 'react';
import LeadTag from '@/components/common/LeadTag';
import { getStatusColors } from '../utils/leadFormatUtils';
import { LeadStatus } from '@/components/common/StatusBadge';
import { formatBudget } from '../utils/leadFormatUtils';
import { Currency } from '@/types/lead';
import { isPast, isToday } from 'date-fns';

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
  
  const isOverdue = () => {
    if (!nextFollowUpDate) return false;
    const followUpDateTime = new Date(nextFollowUpDate);
    return isPast(followUpDateTime) && !isToday(followUpDateTime);
  };
  
  const getTaskTypeStyle = () => {
    if (taskType === 'Call') {
      // Use the terracotta color for Call tag regardless of status
      return {
        bg: 'bg-[#EBD5CE]', // Terracotta/pink background
        text: isOverdue() ? 'text-[#D05A76]' : 'text-[#96493D]' // Pink text when overdue, otherwise terracotta
      };
    } else if (taskType === 'Follow up') {
      return {
        bg: 'bg-[#F3E9D6]',
        text: 'text-[#B58C59]'
      };
    } else if (nextFollowUpDate) {
      return {
        bg: 'bg-[#DCE4E3]',
        text: 'text-[#4C5C59]'
      };
    } else {
      return {
        bg: 'bg-[#F5F3EE]',
        text: 'text-[#7A6C5D]'
      };
    }
  };
  
  const taskStyle = taskType ? getTaskTypeStyle() : { bg: 'bg-[#F5F3EE]', text: 'text-[#7A6C5D]' };
  
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
          bgColor={taskStyle.bg} 
          textColor={taskStyle.text} 
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
