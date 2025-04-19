
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Phone, Mail } from 'lucide-react';
import { format } from 'date-fns';
import CustomButton from '@/components/ui/CustomButton';
import TagBadge, { LeadTag } from '@/components/common/TagBadge';
import { formatBudget } from '@/components/pipeline/mobile/utils/leadFormatUtils';
import { Currency } from '@/types/lead';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

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
  onPhoneCall?: (e: React.MouseEvent) => void;
  onWhatsAppClick?: (e: React.MouseEvent) => void;
  onEmailClick?: (e: React.MouseEvent) => void;
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
  onPhoneCall,
  onWhatsAppClick,
  onEmailClick
}) => {
  const { isAdmin } = useAuth();
  const isMobile = useIsMobile();

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onWhatsAppClick) {
      onWhatsAppClick(e);
    } else if (phone) {
      const cleanedPhone = phone.replace(/[^\d+]/g, '');
      window.open(`https://wa.me/${cleanedPhone}`, '_blank');
    }
  };

  const handlePhoneClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onPhoneCall) {
      onPhoneCall(e);
    } else if (phone) {
      window.location.href = `tel:${phone}`;
    }
  };

  const handleEmailClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEmailClick) {
      onEmailClick(e);
    } else if (email) {
      window.location.href = `mailto:${email}`;
    }
  };

  const headerClasses = cn(
    "flex items-center justify-between p-2 sm:p-3 md:p-4 w-full bg-loro-50 box-border",
    "overflow-visible min-w-0"
  );

  return (
    <div className={headerClasses}>
      <div className="flex items-center gap-2 min-w-0 flex-1 pr-1">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onBackClick} 
          className="p-1 sm:p-2 text-loro-900 hover:bg-transparent transition-transform hover:scale-110 duration-200 flex-shrink-0"
        >
          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
        <div className="min-w-0 w-full overflow-hidden">
          <h1 className={cn(
            "font-futura leading-tight truncate break-words",
            "text-sm sm:text-base md:text-lg"
          )}>
            {name}
          </h1>
          <p className="text-[10px] sm:text-xs text-loro-terracotta truncate">
            {createdAt && format(new Date(createdAt), 'dd/MM/yyyy')}
          </p>
          <div className="flex flex-wrap gap-1 mt-1 w-full pr-1">
            {budget && (
              <span className="text-[10px] sm:text-xs bg-[#F5F3EE] px-2 py-0.5 rounded-xl border border-zinc-200 max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
                {formatBudget(budget, currency)}
              </span>
            )}
            {desiredLocation && (
              <span className="text-[10px] sm:text-xs bg-[#EBD5CE] px-2 py-0.5 rounded-xl max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
                {desiredLocation}
              </span>
            )}
            {country && (
              <span className="text-[10px] sm:text-xs bg-[#F3E9D6] px-2 py-0.5 rounded-xl border border-zinc-200 max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
                {country}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2 flex-shrink-0 ml-1">
        <div className="flex items-center gap-1">
          {phone && <>
              <a href="#" onClick={handlePhoneClick} className="h-7 w-7 flex items-center justify-center rounded-full border border-white transition-transform hover:scale-110 duration-200" aria-label="Appeler">
                <div className="bg-loro-sand/20 h-full w-full flex items-center justify-center text-zinc-900 text-lg font-medium rounded-full">
                  <Phone className="h-3.5 w-3.5" />
                </div>
              </a>
              <button onClick={handleWhatsAppClick} className="h-7 w-7 flex items-center justify-center rounded-full border border-white transition-transform hover:scale-110 duration-200" aria-label="Contacter via WhatsApp">
                <div className="bg-loro-sand/20 h-full w-full flex items-center justify-center text-zinc-900 text-lg font-medium rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                    <path d="M9 10a.5.5 0 0 1 1 0c0 1.97 1.53 3.5 3.5 3.5a.5.5 0 0 1 0 1c-2.47 0-4.5-2.02-4.5-4.5" />
                  </svg>
                </div>
              </button>
            </>}
          {email && <a href="#" onClick={handleEmailClick} className="h-7 w-7 flex items-center justify-center rounded-full border border-white transition-transform hover:scale-110 duration-200" aria-label="Envoyer un email">
              <div className="bg-loro-sand/20 h-full w-full flex items-center justify-center text-zinc-900 text-lg font-medium rounded-full">
                <Mail className="h-3.5 w-3.5" />
              </div>
            </a>}
        </div>
        {tags && tags.length > 0 && <div className="flex flex-wrap justify-end gap-1 max-w-[120px]">
            {tags.map((tag, index) => <TagBadge key={`${tag}-${index}`} tag={tag} className="text-[10px] py-0.5" />)}
          </div>}
      </div>
    </div>
  );
};

export default LeadDetailHeader;
