
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Phone, Mail } from 'lucide-react';
import { format } from 'date-fns';
import CustomButton from '@/components/ui/CustomButton';
import TagBadge, { LeadTag } from '@/components/common/TagBadge';
import { formatBudget } from '@/components/pipeline/mobile/utils/leadFormatUtils';
import { Currency } from '@/types/lead';

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
  tags?: LeadTag[];
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
  tags
}) => {
  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (phone) {
      const cleanedPhone = phone.replace(/[^\d+]/g, '');
      window.open(`https://wa.me/${cleanedPhone}`, '_blank');
    }
  };

  return <div className="flex items-center justify-between p-3 bg-loro-sand">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onBackClick} 
          className="p-2 text-loro-900 hover:bg-transparent transition-transform hover:scale-110 duration-200"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="truncate">
          <h1 className="text-lg font-futura leading-tight truncate">{name}</h1>
          <p className="text-xs text-loro-terracotta">
            {createdAt && format(new Date(createdAt), 'dd/MM/yyyy')}
          </p>
          <p className="text-xs flex items-center gap-1 text-zinc-800">
            {budget && formatBudget(budget, currency)}
            {(budget && (desiredLocation || country || purchaseTimeframe)) && ' • '}
            {desiredLocation}
            {(!desiredLocation && country) ? country : (desiredLocation && country) ? ` (${country})` : ''}
            {(desiredLocation || country) && purchaseTimeframe && ' • '}
            {purchaseTimeframe}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {phone && <>
            <a href={`tel:${phone}`} className="h-8 w-8 flex items-center justify-center rounded-full border border-white transition-transform hover:scale-110 duration-200" aria-label="Appeler">
              <div className="bg-loro-sand/20 h-full w-full flex items-center justify-center text-zinc-900 text-lg font-medium rounded-full">
                <Phone className="h-4 w-4" />
              </div>
            </a>
            <button onClick={handleWhatsAppClick} className="h-8 w-8 flex items-center justify-center rounded-full border border-white transition-transform hover:scale-110 duration-200" aria-label="Contacter via WhatsApp">
              <div className="bg-loro-sand/20 h-full w-full flex items-center justify-center text-zinc-900 text-lg font-medium rounded-full">
                <img 
                  src="/lovable-uploads/bf1a6b76-83f4-46cb-bb39-25f80e1c5289.png" 
                  alt="WhatsApp"
                  className="h-4 w-4"
                />
              </div>
            </button>
          </>}
        {email && <a href={`mailto:${email}`} className="h-8 w-8 flex items-center justify-center rounded-full border border-white transition-transform hover:scale-110 duration-200" aria-label="Envoyer un email">
            <div className="bg-loro-sand/20 h-full w-full flex items-center justify-center text-zinc-900 text-lg font-medium rounded-full">
              <Mail className="h-4 w-4" />
            </div>
          </a>}
        {tags && tags.length > 0 && <TagBadge tag={tags[0]} />}
      </div>
    </div>;
};

export default LeadDetailHeader;
