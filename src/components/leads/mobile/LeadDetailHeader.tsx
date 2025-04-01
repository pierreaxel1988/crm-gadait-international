
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Phone, Mail } from 'lucide-react';
import { format } from 'date-fns';
import TagBadge, { LeadTag } from '@/components/common/TagBadge';
import { Currency } from '@/types/lead';
import { TaskType } from '@/types/actionHistory';
import LeadTagComponent from '@/components/common/LeadTag';
import { LeadStatus } from '@/components/common/StatusBadge';
import { formatBudget } from '@/components/pipeline/mobile/utils/leadFormatUtils';

interface LeadDetailHeaderProps {
  id: string;
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
  tags?: LeadTag[];
  taskType?: TaskType;
  status?: LeadStatus;
}

const LeadDetailHeader: React.FC<LeadDetailHeaderProps> = ({
  id,
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
  taskType,
  status
}) => {
  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (phone) {
      const cleanedPhone = phone.replace(/[^\d+]/g, '');
      window.open(`https://wa.me/${cleanedPhone}`, '_blank');
    }
  };

  // Helper function to get tag colors based on tag type
  const getTagStyle = (tag: string) => {
    if (tag === 'Call') {
      return {
        bg: 'bg-[#EBD5CE]',
        text: 'text-[#D05A76]'
      };
    } else if (tag === 'Follow up') {
      return {
        bg: 'bg-[#F3E9D6]',
        text: 'text-[#B58C59]'
      };
    } else if (tag === status) {
      // Status tag styles
      switch (status) {
        case 'Deposit':
          return {
            bg: 'bg-green-100',
            text: 'text-green-800'
          };
        default:
          return {
            bg: 'bg-gray-100',
            text: 'text-gray-800'
          };
      }
    } else if (tag === desiredLocation) {
      return {
        bg: 'bg-[#F5F3EE]',
        text: 'text-[#7A6C5D]'
      };
    } else {
      return {
        bg: 'bg-[#F5F3EE]',
        text: 'text-[#7A6C5D]'
      };
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white border-b">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onBackClick} 
          className="p-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="overflow-hidden">
          <h1 className="text-base font-medium text-gray-900 leading-tight truncate">{name}</h1>
          <p className="text-xs text-gray-600">
            {createdAt && format(new Date(createdAt), 'dd/MM/yyyy')}
          </p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {status && (
              <LeadTagComponent
                label={status}
                bgColor={getTagStyle(status).bg}
                textColor={getTagStyle(status).text}
                className="font-futuraLight text-xs py-0.5 px-2"
              />
            )}
            
            {taskType && (
              <LeadTagComponent
                label={taskType}
                bgColor={getTagStyle(taskType).bg}
                textColor={getTagStyle(taskType).text}
                className="font-futuraLight text-xs py-0.5 px-2"
              />
            )}
            
            {desiredLocation && (
              <LeadTagComponent
                label={desiredLocation}
                bgColor={getTagStyle(desiredLocation).bg}
                textColor={getTagStyle(desiredLocation).text}
                className="font-futuraLight text-xs py-0.5 px-2"
              />
            )}
            
            {budget && (
              <LeadTagComponent
                label={formatBudget(budget, currency)}
                bgColor="bg-[#F5F3EE]"
                textColor="text-[#7A6C5D]"
                className="font-futuraLight text-xs py-0.5 px-2"
              />
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2">
        <div className="flex items-center gap-2 mr-1">
          {phone && (
            <>
              <a 
                href={`tel:${phone}`} 
                className="h-8 w-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200" 
                aria-label="Appeler"
              >
                <Phone className="h-4 w-4" />
              </a>
              <button 
                onClick={handleWhatsAppClick} 
                className="h-8 w-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200" 
                aria-label="Contacter via WhatsApp"
              >
                <img 
                  alt="WhatsApp" 
                  className="h-4 w-4" 
                  src="https://img.icons8.com/?size=100&id=16712&format=png&color=000000" 
                />
              </button>
            </>
          )}
          {email && (
            <a 
              href={`mailto:${email}`} 
              className="h-8 w-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200" 
              aria-label="Envoyer un email"
            >
              <Mail className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadDetailHeader;
