
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Phone, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import TagBadge, { LeadTag } from '@/components/common/TagBadge';
import { formatBudget } from '@/components/pipeline/mobile/utils/leadFormatUtils';
import { Currency } from '@/types/lead';
import { Avatar } from '@/components/ui/avatar';

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

  // Format name to get first letter for avatar
  const getFirstLetter = () => {
    if (!name) return '';
    return name.charAt(0).toUpperCase();
  };

  // Format date as DD/MM/YYYY
  const formattedDate = createdAt 
    ? format(new Date(createdAt), 'dd/MM/yyyy')
    : '';
    
  // Check if tags include specific values
  const hasDepositTag = tags?.includes('Vip');
  const hasCallTag = tags?.includes('Hot');

  return (
    <div className="flex items-center p-4 bg-white border-b border-gray-100 shadow-sm">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16 bg-[#f7f7f7] text-gray-700 text-2xl font-futura">
          <div className="flex items-center justify-center h-full w-full">
            {getFirstLetter()}
          </div>
        </Avatar>
        
        <div className="flex flex-col">
          <h1 className="text-lg font-futura font-medium">{name}</h1>
          {createdAt && (
            <p className="text-sm text-gray-500">{formattedDate}</p>
          )}
          
          <div className="flex flex-wrap gap-2 mt-2">
            {hasDepositTag && (
              <span className="px-3 py-1 bg-[#307251] text-white rounded-full text-xs font-medium whitespace-nowrap">
                Deposit
              </span>
            )}
            
            {hasCallTag && (
              <span className="px-3 py-1 bg-[#CC6E7E] text-white rounded-full text-xs font-medium whitespace-nowrap">
                Call
              </span>
            )}
            
            {desiredLocation && (
              <span className="px-3 py-1 bg-[#f5f2ec] border border-[#d8c9b9] text-[#8B6F4E] rounded-full text-xs font-medium whitespace-nowrap">
                {desiredLocation}{country ? `, ${country}` : ''}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Budget Badge */}
      {budget && (
        <div className="ml-auto mr-4 hidden sm:block">
          <span className="px-3 py-1 bg-[#f5f2ec] border border-[#d8c9b9] text-[#8B6F4E] rounded-full text-xs font-medium whitespace-nowrap">
            {formatBudget(budget, currency)}
          </span>
        </div>
      )}
      
      {/* Contact Actions */}
      <div className="ml-auto flex gap-2">
        <TooltipProvider>
          {phone && (
            <Tooltip>
              <TooltipTrigger asChild>
                <a 
                  href={`tel:${phone}`} 
                  className="h-10 w-10 rounded-full bg-[#f5f5f5] flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <Phone size={18} className="text-gray-700" />
                </a>
              </TooltipTrigger>
              <TooltipContent>
                <p>Appeler</p>
              </TooltipContent>
            </Tooltip>
          )}
          
          {phone && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleWhatsAppClick}
                  className="h-10 w-10 rounded-full bg-[#f5f5f5] flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <img 
                    src="/public/lovable-uploads/3e074daa-5c5c-4dc5-a56b-e0878acbdb26.png" 
                    alt="WhatsApp" 
                    className="h-[18px] w-[18px]" 
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>WhatsApp</p>
              </TooltipContent>
            </Tooltip>
          )}
          
          {email && (
            <Tooltip>
              <TooltipTrigger asChild>
                <a 
                  href={`mailto:${email}`} 
                  className="h-10 w-10 rounded-full bg-[#f5f5f5] flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <Mail size={18} className="text-gray-700" />
                </a>
              </TooltipTrigger>
              <TooltipContent>
                <p>Email</p>
              </TooltipContent>
            </Tooltip>
          )}
        </TooltipProvider>
      </div>
      
      {/* Mobile Budget Badge */}
      {budget && (
        <div className="w-full mt-2 sm:hidden">
          <span className="px-3 py-1 bg-[#f5f2ec] border border-[#d8c9b9] text-[#8B6F4E] rounded-full text-xs font-medium whitespace-nowrap">
            {formatBudget(budget, currency)}
          </span>
        </div>
      )}
      
      {/* Back button - hidden but kept for functionality */}
      <button 
        onClick={onBackClick} 
        className="hidden"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>
    </div>
  );
};

export default LeadDetailHeader;
