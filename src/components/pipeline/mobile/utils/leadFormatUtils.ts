
import { format, isToday, isYesterday, isThisWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { LeadStatus } from '@/components/common/StatusBadge';
import { Currency } from '@/types/lead';

export function formatDate(dateString?: string): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  if (isToday(date)) {
    return "Aujourd'hui";
  } else if (isYesterday(date)) {
    return 'Hier';
  } else if (isThisWeek(date)) {
    return format(date, 'EEEE', { locale: fr });
  } else {
    return format(date, 'dd/MM/yyyy', { locale: fr });
  }
}

export function formatName(name?: string): string {
  if (!name) return '';
  
  // Split name into words
  const words = name.trim().split(/\s+/);
  
  if (words.length === 0) return '';
  
  // Capitalize each word
  return words.map(word => {
    if (word.length === 0) return '';
    return word[0].toUpperCase() + word.slice(1).toLowerCase();
  }).join(' ');
}

export function getActionStatusStyle(nextFollowUpDate?: string): { 
  containerClassName: string; 
  badgeClassName?: string;
  iconClassName?: string;
} {
  if (!nextFollowUpDate) {
    return { containerClassName: '' };
  }

  const followUpDate = new Date(nextFollowUpDate);
  const today = new Date();
  
  // Reset hours, minutes, seconds for date comparison
  today.setHours(0, 0, 0, 0);
  
  // Set hours, minutes, seconds to end of day for followUpDate
  // to consider the entire day
  const followUpDateClone = new Date(followUpDate);
  followUpDateClone.setHours(0, 0, 0, 0);
  
  if (followUpDateClone.getTime() < today.getTime()) {
    // Overdue - Changed to soft pink background with no border
    return {
      containerClassName: 'bg-[#FFDEE2]/30',
      badgeClassName: 'bg-red-100 text-red-800',
      iconClassName: 'text-red-500'
    };
  } else if (isToday(followUpDate)) {
    // Due today
    return {
      containerClassName: 'border-l-4 border-amber-400',
      badgeClassName: 'bg-amber-100 text-amber-800',
      iconClassName: 'text-amber-500'
    };
  } else {
    // Future task - Update to a light WhatsApp green background
    return {
      containerClassName: 'bg-[#E2F7CB]/60',
      badgeClassName: 'bg-gray-100 text-gray-800',
      iconClassName: 'text-gray-500'
    };
  }
}

export function getStatusColors(status: LeadStatus): {
  bg: string;
  text: string;
} {
  switch (status) {
    case 'New':
      return { bg: 'bg-blue-100', text: 'text-blue-800' };
    case 'Contacted':
      return { bg: 'bg-indigo-100', text: 'text-indigo-800' };
    case 'Qualified':
      return { bg: 'bg-violet-100', text: 'text-violet-800' };
    case 'Proposal':
      return { bg: 'bg-pink-100', text: 'text-pink-800' };
    case 'Visit':
      return { bg: 'bg-cyan-100', text: 'text-cyan-800' };
    case 'Offer':
    case 'Offre':
      return { bg: 'bg-teal-100', text: 'text-teal-800' };
    case 'Deposit':
      return { bg: 'bg-emerald-100', text: 'text-emerald-800' };
    case 'Signed':
      return { bg: 'bg-green-100', text: 'text-green-800' };
    case 'Gagné':
      return { bg: 'bg-green-100', text: 'text-green-800' };
    case 'Perdu':
      return { bg: 'bg-red-100', text: 'text-red-800' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-800' };
  }
}

export function formatBudget(budget?: string, currency: Currency = 'EUR'): string {
  if (!budget) return '';

  const numericBudget = parseFloat(budget);
  if (isNaN(numericBudget)) return budget;

  // Always display the full number with thousand separators
  const formattedNumber = numericBudget.toLocaleString('fr-FR');
  
  // Add currency symbol
  switch (currency) {
    case 'EUR':
      return formattedNumber + ' €';
    case 'USD':
      return '$' + formattedNumber;
    case 'GBP':
      return '£' + formattedNumber;
    default:
      return formattedNumber + ' ' + currency;
  }
}
