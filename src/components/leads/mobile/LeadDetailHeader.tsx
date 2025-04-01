
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Phone, Mail, MapPin, Clock, Euro } from 'lucide-react';
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

  return (
    <div className="bg-white shadow-sm border-b border-gray-100 p-3">
      {/* Header with back button and name */}
      <div className="flex items-center gap-3 mb-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onBackClick} 
          className="p-2 text-zinc-800 hover:bg-zinc-100 transition-all duration-200 flex-shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-futura leading-tight truncate max-w-[200px] sm:max-w-[300px] md:max-w-[500px]">
          {name}
        </h1>
      </div>

      {/* Contact details */}
      {(email || phone) && (
        <div className="mb-2 ml-10">
          {email && (
            <div className="flex items-center text-sm text-muted-foreground gap-1 mb-1">
              <Mail className="h-3.5 w-3.5 mr-1 text-zinc-600" />
              <span className="text-zinc-700 truncate max-w-[250px] sm:max-w-[300px] md:max-w-[400px]">{email}</span>
            </div>
          )}

          {phone && (
            <div className="flex items-center text-sm text-muted-foreground gap-2">
              <div className="flex items-center">
                <Phone className="h-3.5 w-3.5 mr-1 text-zinc-600" />
                <span className="text-zinc-700">{phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <a 
                  href={`tel:${phone}`} 
                  className="h-7 w-7 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                  aria-label="Appeler"
                >
                  <Phone className="h-3.5 w-3.5" />
                </a>
                <button 
                  onClick={handleWhatsAppClick}
                  className="h-7 w-7 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                  aria-label="Contacter via WhatsApp"
                >
                  <img 
                    src="/lovable-uploads/bf1a6b76-83f4-46cb-bb39-25f80e1c5289.png" 
                    alt="WhatsApp"
                    className="h-3.5 w-3.5"
                  />
                </button>
                {email && (
                  <a 
                    href={`mailto:${email}`} 
                    className="h-7 w-7 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                    aria-label="Envoyer un email"
                  >
                    <Mail className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Lead details */}
      <div className="ml-10">
        {/* Creation date */}
        {createdAt && (
          <div className="flex items-center text-xs text-loro-terracotta mb-1">
            <Clock className="h-3 w-3 mr-1" />
            <span>{format(new Date(createdAt), 'dd/MM/yyyy')}</span>
          </div>
        )}

        {/* Location and budget info */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-700 mb-2">
          {desiredLocation && (
            <div className="flex items-center bg-[#F5F3EE] text-[#7A6C5D] px-2 py-1 rounded-full">
              <MapPin className="h-3 w-3 mr-1" />
              <span>
                {desiredLocation}
                {country && ` (${country})`}
              </span>
            </div>
          )}
          
          {budget && (
            <div className="flex items-center bg-[#F5F3EE] text-[#7A6C5D] px-2 py-1 rounded-full">
              <Euro className="h-3 w-3 mr-1" />
              <span>{formatBudget(budget, currency)}</span>
            </div>
          )}
          
          {purchaseTimeframe && (
            <div className="bg-[#F5F3EE] text-[#7A6C5D] px-2 py-1 rounded-full">
              {purchaseTimeframe}
            </div>
          )}
        </div>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-1">
            {tags.map((tag, index) => (
              <TagBadge key={`${tag}-${index}`} tag={tag} className="text-xs py-0.5" />
            ))}
          </div>
        )}
      </div>

      {/* Save button - only show if there are changes */}
      {hasChanges && (
        <div className="mt-2 ml-10">
          <CustomButton
            variant="chocolate"
            onClick={onSave}
            disabled={isSaving}
            size="sm"
            className="text-xs py-1 px-3"
          >
            {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </CustomButton>
        </div>
      )}
    </div>
  );
};

export default LeadDetailHeader;
