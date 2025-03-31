
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Phone, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { formatBudget, getActionStatusStyle } from '@/components/pipeline/mobile/utils/leadFormatUtils';
import { Currency } from '@/types/lead';
import { LeadStatus } from '@/components/common/StatusBadge';
import { TaskType } from '@/components/kanban/KanbanCard';

interface LeadDetailHeaderProps {
  name: string;
  createdAt?: string;
  phone?: string;
  email?: string;
  budget?: string;
  currency?: Currency;
  desiredLocation?: string;
  country?: string;
  purchaseTimeframe?: string;
  onBackClick: () => void;
  onSave: () => void;
  isSaving: boolean;
  hasChanges: boolean;
  tags?: string[];
  status?: LeadStatus;
  nextFollowUpDate?: string;
  taskType?: TaskType;
}

const LeadDetailHeader: React.FC<LeadDetailHeaderProps> = ({
  name,
  createdAt,
  phone,
  email,
  budget,
  currency,
  desiredLocation,
  onBackClick,
  status,
  nextFollowUpDate,
  taskType
}) => {
  const handlePhoneClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (phone) {
      window.location.href = `tel:${phone}`;
    }
  };
  
  const handleEmailClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (email) {
      window.location.href = `mailto:${email}`;
    }
  };
  
  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (phone) {
      const cleanedPhone = phone.replace(/[^\d+]/g, '');
      window.open(`https://wa.me/${cleanedPhone}`, '_blank');
    }
  };
  
  const formattedDate = createdAt 
    ? format(new Date(createdAt), 'dd/MM/yyyy')
    : '';
  
  const formattedBudget = budget && currency 
    ? formatBudget(budget, currency) 
    : '';

  const actionStyle = nextFollowUpDate ? getActionStatusStyle(nextFollowUpDate) : { containerClassName: '' };
  
  return (
    <div className={`flex flex-col p-3 bg-white ${actionStyle.containerClassName}`}>
      {/* Header with back button and name */}
      <div className="flex items-start">
        <div className="flex items-center">
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full border-gray-200 mr-3 bg-white"
            onClick={onBackClick}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex flex-col">
            <div className="flex items-center">
              <h1 className="text-lg font-medium text-gray-800">{name}</h1>
            </div>
            
            <p className="text-sm text-gray-500">{formattedDate}</p>
          </div>
        </div>
        
        <div className="flex ml-auto gap-2">
          {phone && (
            <button 
              onClick={handlePhoneClick}
              className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center"
              aria-label="Appeler"
            >
              <Phone className="h-5 w-5 text-gray-700" />
            </button>
          )}
          
          {phone && (
            <button 
              onClick={handleWhatsAppClick}
              className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center"
              aria-label="WhatsApp"
            >
              <img 
                src="https://img.icons8.com/?size=100&id=16712&format=png&color=000000" 
                alt="WhatsApp" 
                className="h-5 w-5" 
              />
            </button>
          )}
          
          {email && (
            <button 
              onClick={handleEmailClick}
              className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center"
              aria-label="Email"
            >
              <Mail className="h-5 w-5 text-gray-700" />
            </button>
          )}
        </div>
      </div>
      
      {/* Tags row */}
      <div className="flex flex-wrap gap-2 mt-3">
        {/* Status */}
        {status && (
          <div className={`px-4 py-1.5 rounded-full text-sm font-medium bg-lime-100 text-lime-800`}>
            {status}
          </div>
        )}
        
        {/* Task Type */}
        {taskType === 'Call' && (
          <div className="px-4 py-1.5 rounded-full text-sm font-medium bg-pink-100 text-pink-800">
            Call
          </div>
        )}
        
        {/* Location */}
        {desiredLocation && (
          <div className="px-4 py-1.5 rounded-full text-sm font-medium border text-gray-800">
            {desiredLocation}
          </div>
        )}
      </div>
      
      {/* Budget */}
      {formattedBudget && (
        <div className="mt-2">
          <div className="px-4 py-1.5 rounded-full text-sm font-medium border border-gray-200 text-gray-800 inline-block">
            {formattedBudget}
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadDetailHeader;
