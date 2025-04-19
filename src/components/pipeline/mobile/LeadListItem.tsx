
import React from 'react';
import { LeadStatus } from '@/components/common/StatusBadge';
import { Currency } from '@/types/lead';
import { formatDate, formatName, getActionStatusStyle } from './utils/leadFormatUtils';
import LeadAvatar from './components/LeadAvatar';
import LeadContactActions from './components/LeadContactActions';
import LeadTagsList from './components/LeadTagsList';
import { cn } from '@/lib/utils';

interface LeadListItemProps {
  id: string;
  name: string;
  columnStatus: LeadStatus;
  budget?: string;
  currency?: Currency;
  desiredLocation?: string;
  taskType?: string;
  createdAt?: string;
  nextFollowUpDate?: string;
  phone?: string;
  email?: string;
  onClick: (id: string) => void;
}

const LeadListItem: React.FC<LeadListItemProps> = ({
  id,
  name,
  columnStatus,
  budget,
  currency,
  desiredLocation,
  taskType,
  createdAt,
  nextFollowUpDate,
  phone,
  email,
  onClick
}) => {
  const actionStyle = getActionStatusStyle(nextFollowUpDate);

  const handlePhoneCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (phone) {
      window.location.href = `tel:${phone}`;
    }
  };

  const handleEmailClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (email) {
      window.location.href = `mailto:${email}`;
    }
  };

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (phone) {
      const cleanedPhone = phone.replace(/[^\d+]/g, '');
      window.open(`https://wa.me/${cleanedPhone}`, '_blank');
    }
  };

  return (
    <div 
      className={cn(
        "py-3 px-3 sm:px-4 flex hover:bg-slate-50 transition-colors cursor-pointer overflow-hidden w-full",
        nextFollowUpDate ? actionStyle.containerClassName : ''
      )}
      onClick={() => onClick(id)}
    >
      <LeadAvatar name={name} />
      
      <div className="flex-1 min-w-0 overflow-hidden">
        <div className="flex justify-between items-start">
          <div className="min-w-0 overflow-hidden pr-2 flex-1">
            <h3 className="font-futuraLight text-base text-zinc-700 truncate">{formatName(name)}</h3>
            <div className="text-xs text-zinc-500 whitespace-nowrap font-futuraLight truncate">
              {formatDate(createdAt)}
            </div>
          </div>
          
          <LeadContactActions 
            phone={phone}
            email={email}
            handlePhoneCall={handlePhoneCall}
            handleWhatsAppClick={handleWhatsAppClick}
            handleEmailClick={handleEmailClick}
          />
        </div>
        
        <LeadTagsList 
          columnStatus={columnStatus}
          taskType={taskType}
          nextFollowUpDate={nextFollowUpDate}
          desiredLocation={desiredLocation}
          budget={budget}
          currency={currency}
        />
      </div>
    </div>
  );
};

export default LeadListItem;
