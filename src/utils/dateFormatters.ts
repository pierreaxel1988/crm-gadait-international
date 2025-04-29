
import { format, isToday, isYesterday, isThisWeek } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Formats a date string into a human-readable format
 * @param dateString The ISO date string to format
 * @returns Formatted date string
 */
export function formatDateTime(dateString?: string): string {
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
