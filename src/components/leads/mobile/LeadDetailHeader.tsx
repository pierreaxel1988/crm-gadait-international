
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Phone, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { formatBudget, getActionStatusStyle, getStatusColors } from '@/components/pipeline/mobile/utils/leadFormatUtils';
import { Currency } from '@/types/lead';
import { LeadStatus } from '@/components/common/StatusBadge';
import TaskTypeIndicator from '@/components/kanban/card/TaskTypeIndicator';

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
  status?: string;
  nextFollowUpDate?: string;
  taskType?: string;
}

const LeadDetailHeader: React.FC<LeadDetailHeaderProps> = ({
  name,
  createdAt,
  phone,
  email,
  budget,
  currency,
  desiredLocation,
  country,
  purchaseTimeframe,
  onBackClick,
  onSave,
  isSaving,
  hasChanges,
  tags,
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
  
  const statusConfig = status ? getStatusColors(status as LeadStatus) : { bg: 'bg-gray-200', text: 'text-gray-700' };
  
  return (
    <div className={`flex flex-col p-2 ${actionStyle.containerClassName}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full border-gray-300"
            onClick={onBackClick}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-lg font-medium text-gray-800 font-futura">{name}</h1>
            <p className="text-xs text-gray-600">{formattedDate}</p>
          </div>
        </div>
        
        <div className="flex gap-1">
          {phone && (
            <button 
              onClick={handlePhoneClick}
              className="h-8 w-8 rounded-full bg-[#F5F5F0] flex items-center justify-center"
              aria-label="Appeler"
            >
              <Phone className="h-4 w-4 text-gray-700" />
            </button>
          )}
          
          {phone && (
            <button 
              onClick={handleWhatsAppClick}
              className="h-8 w-8 rounded-full bg-[#F5F5F0] flex items-center justify-center"
              aria-label="WhatsApp"
            >
              <img 
                src="/lovable-uploads/bf1a6b76-83f4-46cb-bb39-25f80e1c5289.png" 
                alt="WhatsApp" 
                className="h-4 w-4"
              />
            </button>
          )}
          
          {email && (
            <button 
              onClick={handleEmailClick}
              className="h-8 w-8 rounded-full bg-[#F5F5F0] flex items-center justify-center"
              aria-label="Email"
            >
              <Mail className="h-4 w-4 text-gray-700" />
            </button>
          )}
        </div>
      </div>
      
      <div className="flex flex-wrap gap-1 mt-1">
        {/* Statut */}
        {status && (
          <div className={`px-2.5 py-0.5 rounded-full text-xs ${statusConfig.bg} ${statusConfig.text} font-futura`}>
            {status}
          </div>
        )}
        
        {/* Task Type Indicator à la façon de la carte pipeline */}
        {taskType && (
          <TaskTypeIndicator 
            taskType={taskType} 
            phoneNumber={phone}
            nextFollowUpDate={nextFollowUpDate}
            isOverdue={nextFollowUpDate ? actionStyle.containerClassName.includes('red') : false}
            className="text-xs"
          />
        )}
        
        {/* Tags spécifiques */}
        {tags && tags.map((tag) => (
          <div 
            key={tag} 
            className="px-2.5 py-0.5 bg-[#EBD5CE] text-[#D05A76] rounded-full text-xs font-futura"
          >
            {tag}
          </div>
        ))}
        
        {/* Localisation */}
        {desiredLocation && (
          <div className="px-2.5 py-0.5 bg-[#F5F3EE] text-[#7A6C5D] rounded-full text-xs font-futura">
            {desiredLocation}
          </div>
        )}
        
        {/* Budget */}
        {formattedBudget && (
          <div className="px-2.5 py-0.5 bg-[#F5F3EE] text-[#7A6C5D] rounded-full text-xs font-futura">
            {formattedBudget}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadDetailHeader;
