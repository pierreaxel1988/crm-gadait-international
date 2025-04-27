
import { format, isToday, isYesterday, isThisWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { LeadStatus } from '@/components/common/StatusBadge';
import { Currency } from '@/types/lead';

// Mapping entre codes pays et noms de pays
export const countryCodeMapping: Record<string, string> = {
  '+33': 'France',
  '+44': 'United Kingdom',
  '+1': 'United States',
  '+34': 'Spain',
  '+39': 'Italy',
  '+41': 'Switzerland',
  '+32': 'Belgium',
  '+49': 'Germany',
  '+31': 'Netherlands',
  '+7': 'Russia',
  '+971': 'United Arab Emirates',
  '+966': 'Saudi Arabia',
  '+965': 'Kuwait',
  '+974': 'Qatar',
  '+973': 'Bahrain',
  '+230': 'Mauritius',
  '+212': 'Morocco',
  '+216': 'Tunisia',
  '+213': 'Algeria',
  '+20': 'Egypt'
};

// Fonction pour obtenir le pays à partir du code pays
export function getCountryFromCode(code: string): string | undefined {
  // Vérifier d'abord une correspondance exacte
  if (countryCodeMapping[code]) {
    return countryCodeMapping[code];
  }
  
  // Si pas de correspondance exacte et que le code commence par +, rechercher un préfixe correspondant
  if (code.startsWith('+')) {
    // Trier les codes par longueur décroissante pour trouver le préfixe le plus spécifique d'abord
    const sortedCodes = Object.keys(countryCodeMapping).sort((a, b) => b.length - a.length);
    
    for (const prefix of sortedCodes) {
      if (code.startsWith(prefix)) {
        return countryCodeMapping[prefix];
      }
    }
  }
  
  return undefined;
}

// Fonction pour obtenir le code pays à partir du pays
export function getCodeFromCountry(country: string): string | undefined {
  for (const [code, countryName] of Object.entries(countryCodeMapping)) {
    if (countryName === country) {
      return code;
    }
  }
  return undefined;
}

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
    // Due today - Removed yellow border, using slight background tint instead
    return {
      containerClassName: 'bg-amber-50',
      badgeClassName: 'bg-amber-100 text-amber-800',
      iconClassName: 'text-amber-500'
    };
  } else {
    // Future task - Updated to the requested color #e3f7ed with 80% opacity
    return {
      containerClassName: 'bg-[#e3f7ed]/80',
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

  // Remove any existing formatting or currency symbols first
  const cleanBudget = budget.toString().replace(/[^\d.,]/g, '');
  
  // Handle both comma and dot as decimal separators
  const numericBudget = parseFloat(cleanBudget.replace(',', '.'));
  
  if (isNaN(numericBudget)) return budget;

  // Format the number with thousand separators using fr-FR locale
  // This ensures numbers like 3000000 are displayed as 3 000 000
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
