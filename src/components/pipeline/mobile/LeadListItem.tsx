import React from 'react';
import { Clock, Phone, Calendar, MapPin, Mail, MessageSquare } from 'lucide-react';
import { Avatar } from "@/components/ui/avatar";
import { format, isPast, isFuture, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Currency } from '@/types/lead';
import { LeadStatus } from '@/components/common/StatusBadge';
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

  return (
    <div 
      className={`py-3 px-4 flex items-center hover:bg-slate-50 transition-colors cursor-pointer ${nextFollowUpDate ? actionStyle.containerClassName : ''}`} 
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
        <div className="flex justify-between items-baseline">
          <h3 className="font-medium text-base truncate text-zinc-900">{formatName(name)}</h3>
          <span className="text-xs text-zinc-500 ml-2 whitespace-nowrap">
            {formatDate(createdAt)}
          </span>
        </div>
        
        <div className="flex flex-wrap items-center text-sm text-zinc-700 mt-1 gap-1.5">
          <Badge variant="outline" className="h-5 px-2 py-0.5 text-xs bg-zinc-100 text-zinc-900">
            {columnStatus}
          </Badge>
          
          {taskType && (
            <Badge 
              variant="outline" 
              className={`h-5 px-2 py-0.5 text-xs flex items-center gap-1 ${
                nextFollowUpDate 
                  ? taskType === 'Call' 
                    ? 'bg-rose-100 text-rose-800 hover:bg-rose-200' 
                    : taskType === 'Follow up' 
                      ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' 
                      : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                  : 'bg-zinc-100 text-zinc-800 hover:bg-zinc-200'
              }`}
              onClick={taskType === 'Call' && phone ? handlePhoneCall : undefined}
              style={taskType === 'Call' && phone ? { cursor: 'pointer' } : undefined}
            >
              {taskType === 'Call' ? (
                <Phone className={`h-3 w-3 ${nextFollowUpDate ? 'text-rose-600' : 'text-zinc-600'}`} />
              ) : taskType === 'Follow up' ? (
                <Clock className={`h-3 w-3 ${nextFollowUpDate ? 'text-amber-600' : 'text-zinc-600'}`} />
              ) : taskType === 'Visites' ? (
                <Calendar className={`h-3 w-3 ${nextFollowUpDate ? 'text-blue-600' : 'text-zinc-600'}`} />
              ) : null}
              <span>{taskType}</span>
            </Badge>
          )}
          
          {desiredLocation && (
            <Badge variant="outline" className="h-5 px-2 py-0.5 text-xs flex items-center gap-1 bg-zinc-100 text-zinc-900 hover:bg-zinc-200">
              <MapPin className="h-3 w-3 text-zinc-600" />
              <span>{desiredLocation}</span>
            </Badge>
          )}
          
          {budget && (
            <Badge variant="outline" className="h-5 px-2 py-0.5 text-xs font-medium bg-zinc-100 text-zinc-900 hover:bg-zinc-200">
              {formatBudget(budget, currency)}
            </Badge>
          )}
        </div>
        
        {(phone || email) && (
          <div className="flex mt-1.5 gap-2">
            <TooltipProvider>
              {phone && (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        onClick={handlePhoneCall}
                        className="p-1.5 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
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
                        className="p-1.5 rounded-full bg-teal-50 text-teal-600 hover:bg-teal-100 transition-colors"
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
                      className="p-1.5 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
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
        )}
      </div>
    </div>
  );
};

export default LeadListItem;
