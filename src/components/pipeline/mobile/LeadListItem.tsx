import React from 'react';
import { Clock, Phone, Calendar, MapPin, Mail, MessageSquare } from 'lucide-react';
import { Avatar } from "@/components/ui/avatar";
import { format, isPast, isFuture, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Currency } from '@/types/lead';
import { LeadStatus } from '@/components/common/StatusBadge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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
        bg: "bg-red-100",
        text: "text-red-800",
        icon: "text-red-600",
        containerClassName: "border-red-200 bg-red-50/50"
      };
    } else if (isToday(followUpDateTime)) {
      return {
        bg: "bg-amber-100",
        text: "text-amber-800",
        icon: "text-amber-600",
        containerClassName: "border-amber-200 bg-amber-50/50"
      };
    } else {
      return {
        bg: "bg-green-100",
        text: "text-green-800",
        icon: "text-green-600",
        containerClassName: "border-green-200 bg-green-50/50"
      };
    }
  };

  const formatName = (name: string): string => {
    if (!name) return '';
    return name.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
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
      // Format phone number for WhatsApp (remove spaces and any non-digit characters except +)
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
          <div className="flex items-center">
            <h3 className="font-medium text-base truncate text-zinc-900 mr-2">{formatName(name)}</h3>
            
            <TooltipProvider>
              <div className="flex items-center">
                {email && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-full hover:bg-amber-100 transition-colors p-0.5 hover:scale-110"
                        onClick={handleEmailClick}
                      >
                        <Mail className="h-4 w-4 text-amber-600" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Envoyer un email</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                
                {phone && (
                  <>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-full hover:bg-blue-100 transition-colors p-0.5 hover:scale-110"
                          onClick={handlePhoneCall}
                        >
                          <Phone className="h-4 w-4 text-blue-600" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Appeler</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-full hover:bg-green-100 transition-colors p-0.5 hover:scale-110"
                          onClick={handleWhatsAppClick}
                        >
                          <MessageSquare className="h-4 w-4 text-green-600" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>WhatsApp</p>
                      </TooltipContent>
                    </Tooltip>
                  </>
                )}
              </div>
            </TooltipProvider>
          </div>
          
          <span className="text-xs text-zinc-500 ml-2 whitespace-nowrap">
            {formatDate(createdAt)}
          </span>
        </div>
        <div className="flex flex-wrap items-center text-sm text-zinc-700 mt-1 gap-1.5">
          <Badge
            variant="outline"
            className="px-2 py-0.5 h-5 text-xs font-medium bg-zinc-100 text-zinc-900 border-none"
          >
            {columnStatus}
          </Badge>
          
          {taskType && (
            <Badge
              variant="outline"
              className={cn(
                "flex items-center gap-1 px-2 py-0.5 h-5 text-xs font-medium border-none",
                nextFollowUpDate ? `${actionStyle.bg} ${actionStyle.text}` : "bg-zinc-100 text-zinc-900",
                taskType === 'Call' && phone ? "cursor-pointer" : ""
              )}
              onClick={taskType === 'Call' && phone ? handlePhoneCall : undefined}
            >
              {taskType === 'Call' ? 
                <Phone className={`h-3 w-3 ${nextFollowUpDate ? actionStyle.icon : 'text-zinc-600'}`} /> : 
               taskType === 'Follow up' ? 
                <Clock className={`h-3 w-3 ${nextFollowUpDate ? actionStyle.icon : 'text-zinc-600'}`} /> : 
               taskType === 'Visites' ? 
                <Calendar className={`h-3 w-3 ${nextFollowUpDate ? actionStyle.icon : 'text-zinc-600'}`} /> : 
                null
              }
              {taskType}
            </Badge>
          )}
          
          {desiredLocation && (
            <Badge
              variant="outline"
              className="flex items-center gap-1 px-2 py-0.5 h-5 text-xs font-medium bg-zinc-100 text-zinc-900 border-none"
            >
              <MapPin className="h-3 w-3 text-zinc-600" />
              {desiredLocation}
            </Badge>
          )}
          
          {budget && (
            <Badge
              variant="outline"
              className="px-2 py-0.5 h-5 text-xs font-medium bg-zinc-100 text-zinc-900 border-none"
            >
              {formatBudget(budget, currency)}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadListItem;
