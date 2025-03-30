
import React from 'react';
import { Clock, Phone, Calendar, MapPin, Mail, MessageSquare } from 'lucide-react';
import { Avatar } from "@/components/ui/avatar";
import { format, isPast, isFuture, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Currency } from '@/types/lead';
import { LeadStatus } from '@/components/common/StatusBadge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import LeadTag from '@/components/common/LeadTag';

interface LeadListItemProps {
  id: string;
  name: string;
  columnStatus: LeadStatus;
  budget?: string;
  currency?: Currency;
  desiredLocation?: string;
  taskType?: string;
  createdAt?: string;
  nextFollowUpDate?: string;
  phone?: string;
  email?: string;
  onClick: (id: string) => void;
}

const LeadListItem = ({
  id,
  name,
  columnStatus,
  budget,
  currency,
  desiredLocation,
  taskType,
  createdAt,
  nextFollowUpDate,
  phone,
  email,
  onClick
}: LeadListItemProps) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (new Date().toDateString() === date.toDateString()) {
        return format(date, 'HH:mm');
      }
      return format(date, 'd MMM', {
        locale: fr
      });
    } catch (error) {
      return dateString;
    }
  };

  const formatBudget = (budgetStr?: string, currency?: string) => {
    if (!budgetStr) return '';
    if (budgetStr.includes(',') || budgetStr.includes(' ') || budgetStr.includes('$') || budgetStr.includes('€')) {
      return budgetStr;
    }
    const numValue = parseInt(budgetStr.replace(/[^\d]/g, ''));
    if (isNaN(numValue)) return budgetStr;
    const currencySymbol = getCurrencySymbol(currency);
    const formattedNumber = new Intl.NumberFormat('fr-FR').format(numValue);
    if (currency === 'EUR') {
      return `${formattedNumber} ${currencySymbol}`;
    } else {
      return `${currencySymbol}${formattedNumber}`;
    }
  };

  const getCurrencySymbol = (currency?: string): string => {
    switch (currency) {
      case 'EUR':
        return '€';
      case 'USD':
        return '$';
      case 'GBP':
        return '£';
      case 'CHF':
        return 'CHF';
      case 'AED':
        return 'AED';
      case 'MUR':
        return 'Rs';
      default:
        return '€';
    }
  };

  const getActionStatusStyle = (followUpDate?: string) => {
    if (!followUpDate) return {};
    const followUpDateTime = new Date(followUpDate);
    if (isPast(followUpDateTime) && !isToday(followUpDateTime)) {
      return {
        taskClassName: "bg-red-100 text-red-800 rounded-full px-2 py-0.5",
        iconClassName: "text-red-600",
        containerClassName: "border-red-200 bg-red-50/50"
      };
    } else if (isToday(followUpDateTime)) {
      return {
        taskClassName: "bg-amber-100 text-amber-800 rounded-full px-2 py-0.5",
        iconClassName: "text-amber-600",
        containerClassName: "border-amber-200 bg-amber-50/50"
      };
    } else {
      return {
        taskClassName: "bg-green-100 text-green-800 rounded-full px-2 py-0.5",
        iconClassName: "text-green-600",
        containerClassName: "border-green-200 bg-green-50/50"
      };
    }
  };

  const formatName = (name: string): string => {
    if (!name) return '';
    return name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  };

  const actionStyle = getActionStatusStyle(nextFollowUpDate);

  const handlePhoneCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (phone) {
      window.location.href = `tel:${phone}`;
    }
  };

  const handleEmailClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (email) {
      window.location.href = `mailto:${email}`;
    }
  };

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (phone) {
      const cleanedPhone = phone.replace(/[^\d+]/g, '');
      window.open(`https://wa.me/${cleanedPhone}`, '_blank');
    }
  };

  // Get background and text colors based on status
  const getStatusColors = (status: LeadStatus) => {
    switch(status) {
      case 'New':
        return { bg: 'bg-[#F5F3EE]', text: 'text-[#7A6C5D]' };
      case 'Contacted':
        return { bg: 'bg-[#DCE4E3]', text: 'text-[#4C5C59]' };
      case 'Qualified':
        return { bg: 'bg-[#EBD5CE]', text: 'text-[#96493D]' };
      case 'Proposal':
      case 'Offer':
      case 'Offre':
      case 'Negotiation':
        return { bg: 'bg-[#F3E9D6]', text: 'text-[#B58C59]' };
      case 'Won':
      case 'Gagné':
      case 'Signed':
        return { bg: 'bg-[#DCE4E3]', text: 'text-[#4C5C59]' };
      case 'Lost':
      case 'Perdu':
        return { bg: 'bg-[#EFEAE4]', text: 'text-[#3F3C3B]' };
      default:
        return { bg: 'bg-[#F5F3EE]', text: 'text-[#7A6C5D]' };
    }
  };

  const statusColors = getStatusColors(columnStatus);

  return (
    <div 
      className={`py-3 px-4 flex hover:bg-slate-50 transition-colors cursor-pointer ${nextFollowUpDate ? actionStyle.containerClassName : ''}`} 
      onClick={() => onClick(id)}
    >
      <div className="mr-3">
        <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
          <div className="bg-loro-sand/20 h-full w-full flex items-center justify-center text-zinc-900 text-lg font-medium">
            {name ? name.charAt(0).toUpperCase() : ''}
          </div>
        </Avatar>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-futuraLight text-base text-zinc-700">{formatName(name)}</h3>
            <div className="text-xs text-zinc-500 whitespace-nowrap font-futuraLight">
              {formatDate(createdAt)}
            </div>
          </div>
          
          <div className="flex items-center gap-1.5">
            <TooltipProvider>
              {phone && (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        onClick={handlePhoneCall}
                        className="p-1 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                        aria-label="Appeler"
                      >
                        <Phone className="h-3.5 w-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Appeler</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        onClick={handleWhatsAppClick}
                        className="p-1 rounded-full bg-teal-50 text-teal-600 hover:bg-teal-100 transition-colors"
                        aria-label="WhatsApp"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>WhatsApp</p>
                    </TooltipContent>
                  </Tooltip>
                </>
              )}
              
              {email && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      onClick={handleEmailClick}
                      className="p-1 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                      aria-label="Email"
                    >
                      <Mail className="h-3.5 w-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Email</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </TooltipProvider>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center text-sm text-zinc-500 mt-1 gap-1.5">
          <LeadTag 
            label={columnStatus} 
            bgColor={statusColors.bg} 
            textColor={statusColors.text}
            className="font-futuraLight" 
          />
          
          {taskType && (
            <LeadTag
              label={taskType}
              bgColor={
                nextFollowUpDate 
                  ? taskType === 'Call' 
                    ? 'bg-[#EBD5CE]' 
                    : taskType === 'Follow up' 
                      ? 'bg-[#F3E9D6]' 
                      : 'bg-[#DCE4E3]'
                  : 'bg-[#F5F3EE]'
              }
              textColor={
                nextFollowUpDate 
                  ? taskType === 'Call' 
                    ? 'text-[#96493D]' 
                    : taskType === 'Follow up' 
                      ? 'text-[#B58C59]' 
                      : 'text-[#4C5C59]'
                  : 'text-[#7A6C5D]'
              }
              className="font-futuraLight"
            />
          )}
          
          {desiredLocation && (
            <LeadTag
              label={desiredLocation}
              bgColor="bg-[#F5F3EE]"
              textColor="text-[#7A6C5D]"
              className="font-futuraLight"
            />
          )}
          
          {budget && (
            <LeadTag
              label={formatBudget(budget, currency)}
              bgColor="bg-[#F5F3EE]"
              textColor="text-[#7A6C5D]"
              className="font-futuraLight min-w-[100px] text-center"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadListItem;
