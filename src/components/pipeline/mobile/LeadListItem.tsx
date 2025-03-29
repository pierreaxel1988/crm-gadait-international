
import React from 'react';
import { Clock, Phone, Calendar, MapPin } from 'lucide-react';
import { Avatar } from "@/components/ui/avatar";
import { format, isPast, isFuture, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Currency } from '@/types/lead';
import { LeadStatus } from '@/components/common/StatusBadge';

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
    return name.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };
  
  const actionStyle = getActionStatusStyle(nextFollowUpDate);
  
  const handlePhoneCall = (e: React.MouseEvent) => {
    if (taskType === 'Call' && phone) {
      e.stopPropagation();
      window.location.href = `tel:${phone}`;
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
        <div className="flex flex-wrap items-center text-sm text-zinc-700 mt-1 gap-1">
          <span className="inline-flex items-center bg-zinc-100 text-zinc-900 text-xs px-2 py-0.5 rounded-full">
            {columnStatus}
          </span>
          
          {taskType && (
            <span 
              className={`flex items-center ${nextFollowUpDate ? actionStyle.taskClassName : 'bg-zinc-100 text-zinc-700 rounded-full px-2 py-0.5'}`}
              onClick={taskType === 'Call' && phone ? handlePhoneCall : undefined}
              style={taskType === 'Call' && phone ? { cursor: 'pointer' } : undefined}
            >
              {taskType === 'Call' ? 
                <Phone className={`h-3 w-3 mr-1 ${nextFollowUpDate ? actionStyle.iconClassName : 'text-zinc-600'}`} /> : 
               taskType === 'Follow up' ? 
                <Clock className={`h-3 w-3 mr-1 ${nextFollowUpDate ? actionStyle.iconClassName : 'text-zinc-600'}`} /> : 
               taskType === 'Visites' ? 
                <Calendar className={`h-3 w-3 mr-1 ${nextFollowUpDate ? actionStyle.iconClassName : 'text-zinc-600'}`} /> : 
                null
              }
              <span className={`truncate text-xs ${nextFollowUpDate ? '' : 'text-zinc-900'}`}>
                {taskType}
              </span>
            </span>
          )}
          
          {desiredLocation && (
            <span className="flex items-center bg-zinc-100 text-zinc-700 rounded-full px-2 py-0.5">
              <MapPin className="h-3 w-3 mr-1 text-zinc-600" />
              <span className="truncate text-xs text-zinc-900">
                {desiredLocation}
              </span>
            </span>
          )}
          
          {budget && (
            <span className="truncate text-xs font-medium bg-zinc-100 text-zinc-900 rounded-full px-2 py-0.5">
              {formatBudget(budget, currency)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadListItem;
