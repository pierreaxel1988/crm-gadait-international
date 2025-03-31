
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Phone, Mail } from 'lucide-react';
import { format } from 'date-fns';
import TagBadge, { LeadTag } from '@/components/common/TagBadge';
import { formatBudget } from '@/components/pipeline/mobile/utils/leadFormatUtils';
import { Currency } from '@/types/lead';
import { TaskType } from '@/components/kanban/KanbanCard';

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
  taskType
}) => {
  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (phone) {
      const cleanedPhone = phone.replace(/[^\d+]/g, '');
      window.open(`https://wa.me/${cleanedPhone}`, '_blank');
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
          <div className="text-xs text-gray-600 flex items-center gap-1 truncate">
            {budget && formatBudget(budget, currency)}
            {budget && (desiredLocation || country || purchaseTimeframe) && ' • '}
            {desiredLocation}
            {!desiredLocation && country ? country : (desiredLocation && country ? ` (${country})` : '')}
            {(desiredLocation || country) && purchaseTimeframe && ' • '}
            {purchaseTimeframe}
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
        
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap justify-end gap-1 max-w-[150px]">
            {/* Only display the first tag, just like in the pipeline card */}
            <TagBadge key={tags[0]} tag={tags[0]} className="text-xs py-0.5 px-2 font-futura tracking-wide" />
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadDetailHeader;
