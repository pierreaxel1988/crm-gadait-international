
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Phone, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { formatBudget } from '@/components/pipeline/mobile/utils/leadFormatUtils';
import { LeadTag } from '@/components/common/TagBadge';

interface LeadDetailMobileHeaderProps {
  name: string;
  createdAt?: string;
  phone?: string;
  email?: string;
  budget?: string;
  currency?: string;
  desiredLocation?: string;
  onPhoneCall?: () => void;
  onWhatsAppClick?: () => void;
  onEmailClick?: () => void;
  tags?: LeadTag[];
}

const LeadDetailMobileHeader: React.FC<LeadDetailMobileHeaderProps> = ({
  name,
  createdAt,
  phone,
  email,
  budget,
  currency,
  desiredLocation,
  onPhoneCall,
  onWhatsAppClick,
  onEmailClick,
  tags
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-start justify-between p-3 w-full bg-loro-50">
      <div className="flex items-start gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/pipeline')}
          className="p-1.5 text-loro-900 hover:bg-transparent transition-transform hover:scale-110 duration-200"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-base font-futura leading-tight truncate max-w-[180px]">{name}</h1>
          <p className="text-xs text-loro-terracotta">
            {createdAt && format(new Date(createdAt), 'dd/MM/yyyy')}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-1 max-w-[180px]">
            {budget && (
              <span className="text-xs bg-[#F5F3EE] px-2 py-0.5 rounded-xl">
                {formatBudget(budget, currency)}
              </span>
            )}
            {desiredLocation && (
              <span className="text-xs bg-[#EBD5CE] px-2 py-0.5 rounded-xl">
                {desiredLocation}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2">
        <div className="flex items-center gap-1.5">
          {phone && (
            <>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onPhoneCall}
                className="h-7 w-7 rounded-full bg-loro-sand/20"
              >
                <Phone className="h-3.5 w-3.5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onWhatsAppClick}
                className="h-7 w-7 rounded-full bg-loro-sand/20"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                  <path d="M9 10a.5.5 0 0 1 1 0c0 1.97 1.53 3.5 3.5 3.5a.5.5 0 0 1 0 1c-2.47 0-4.5-2.02-4.5-4.5" />
                </svg>
              </Button>
            </>
          )}
          {email && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onEmailClick}
              className="h-7 w-7 rounded-full bg-loro-sand/20"
            >
              <Mail className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap justify-end gap-1 max-w-[120px]">
            {tags.map((tag, index) => (
              <span 
                key={index}
                className="text-[10px] px-1.5 py-0.5 rounded-full bg-loro-pearl/50"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadDetailMobileHeader;
