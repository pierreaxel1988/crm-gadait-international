
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Phone, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { formatBudget } from '@/components/pipeline/mobile/utils/leadFormatUtils';
import { Currency } from '@/types/lead';
import { LeadStatus } from '@/components/common/StatusBadge';
import { getActionStatusStyle } from '@/components/pipeline/mobile/utils/leadFormatUtils';

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
    <div className={`flex flex-col p-4 ${actionStyle.containerClassName}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full border-gray-300"
            onClick={onBackClick}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-xl font-medium text-gray-800">{name}</h1>
            <p className="text-sm text-gray-600">{formattedDate}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {phone && (
            <button 
              onClick={handlePhoneClick}
              className="h-10 w-10 rounded-full bg-[#F5F5F0] flex items-center justify-center"
              aria-label="Appeler"
            >
              <Phone className="h-5 w-5 text-gray-700" />
            </button>
          )}
          
          {phone && (
            <button 
              onClick={handleWhatsAppClick}
              className="h-10 w-10 rounded-full bg-[#F5F5F0] flex items-center justify-center"
              aria-label="WhatsApp"
            >
              <img 
                src="/lovable-uploads/bf1a6b76-83f4-46cb-bb39-25f80e1c5289.png" 
                alt="WhatsApp" 
                className="h-5 w-5"
              />
            </button>
          )}
          
          {email && (
            <button 
              onClick={handleEmailClick}
              className="h-10 w-10 rounded-full bg-[#F5F5F0] flex items-center justify-center"
              aria-label="Email"
            >
              <Mail className="h-5 w-5 text-gray-700" />
            </button>
          )}
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 mt-2">
        {status && (
          <div className="px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full text-sm">
            {status}
          </div>
        )}
        
        {tags && tags.includes("Call") && (
          <div className="px-4 py-2 bg-pink-100 text-pink-700 rounded-full text-sm">
            Call
          </div>
        )}
        
        {desiredLocation && (
          <div className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full text-sm">
            {desiredLocation}
          </div>
        )}
        
        {formattedBudget && (
          <div className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full text-sm">
            {formattedBudget}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadDetailHeader;
