
import { format, isPast, isFuture, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { LeadStatus } from '@/components/common/StatusBadge';
import { Currency } from '@/types/lead';

/**
 * Format a date string for display in the lead list
 */
export const formatDate = (dateString?: string): string => {
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

/**
 * Format budget with appropriate currency symbol
 */
export const formatBudget = (budgetStr?: string, currency?: string): string => {
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

/**
 * Get currency symbol from currency code
 */
export const getCurrencySymbol = (currency?: string): string => {
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

/**
 * Format name with proper capitalization
 */
export const formatName = (name: string): string => {
  if (!name) return '';
  return name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
};

/**
 * Get styling for action status based on follow-up date
 */
export const getActionStatusStyle = (followUpDate?: string) => {
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

/**
 * Get background and text colors based on lead status
 */
export const getStatusColors = (status: LeadStatus) => {
  switch (status) {
    case 'New':
      return {
        bg: 'bg-[#F5F3EE]',
        text: 'text-[#7A6C5D]'
      };
    case 'Contacted':
      return {
        bg: 'bg-[#DCE4E3]',
        text: 'text-[#4C5C59]'
      };
    case 'Qualified':
      return {
        bg: 'bg-[#EBD5CE]',
        text: 'text-[#96493D]'
      };
    case 'Proposal':
      return {
        bg: 'bg-[#F3E9D6]',
        text: 'text-[#B58C59]'
      };
    case 'Offer':
    case 'Offre':
      return {
        bg: 'bg-[#F3E9D6]',
        text: 'text-[#B58C59]'
      };
    case 'Negotiation':
      return {
        bg: 'bg-[#F3E9D6]',
        text: 'text-[#B58C59]'
      };
    case 'Won':
    case 'Gagné':
    case 'Signed':
      return {
        bg: 'bg-[#DCE4E3]',
        text: 'text-[#4C5C59]'
      };
    case 'Lost':
    case 'Perdu':
      return {
        bg: 'bg-[#EFEAE4]',
        text: 'text-[#3F3C3B]'
      };
    default:
      return {
        bg: 'bg-[#F5F3EE]',
        text: 'text-[#7A6C5D]'
      };
  }
};
