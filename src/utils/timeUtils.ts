
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

// Mapping des pays vers leurs fuseaux horaires principaux
const COUNTRY_TO_TIMEZONE: Record<string, string> = {
  'France': 'Europe/Paris',
  'Spain': 'Europe/Madrid',
  'United Kingdom': 'Europe/London',
  'Germany': 'Europe/Berlin',
  'Italy': 'Europe/Rome',
  'United States': 'America/New_York', // Fuseau est par défaut
  'Canada': 'America/Toronto',
  'Australia': 'Australia/Sydney',
  'Japan': 'Asia/Tokyo',
  'China': 'Asia/Shanghai',
  'Russia': 'Europe/Moscow',
  'India': 'Asia/Kolkata',
  'Brazil': 'America/Sao_Paulo',
  'South Africa': 'Africa/Johannesburg',
  'Mexico': 'America/Mexico_City',
  'Switzerland': 'Europe/Zurich',
  'Netherlands': 'Europe/Amsterdam',
  'Belgium': 'Europe/Brussels',
  'Portugal': 'Europe/Lisbon',
  'Greece': 'Europe/Athens',
  'Turkey': 'Europe/Istanbul',
  'Sweden': 'Europe/Stockholm',
  'Norway': 'Europe/Oslo',
  'Denmark': 'Europe/Copenhagen',
  'Finland': 'Europe/Helsinki',
  'Poland': 'Europe/Warsaw',
  'Austria': 'Europe/Vienna',
  'Ireland': 'Europe/Dublin',
  'New Zealand': 'Pacific/Auckland',
  'Singapore': 'Asia/Singapore',
  'Hong Kong': 'Asia/Hong_Kong',
  'United Arab Emirates': 'Asia/Dubai',
  'Saudi Arabia': 'Asia/Riyadh',
  'Israel': 'Asia/Jerusalem',
  'Egypt': 'Africa/Cairo',
  'Morocco': 'Africa/Casablanca',
  'Argentina': 'America/Argentina/Buenos_Aires',
  'Chile': 'America/Santiago',
  'Colombia': 'America/Bogota',
  'Peru': 'America/Lima',
  'Venezuela': 'America/Caracas',
  'Thailand': 'Asia/Bangkok',
  'Vietnam': 'Asia/Ho_Chi_Minh',
  'Indonesia': 'Asia/Jakarta',
  'Malaysia': 'Asia/Kuala_Lumpur',
  'Philippines': 'Asia/Manila',
  'South Korea': 'Asia/Seoul',
  'Taiwan': 'Asia/Taipei',
  // Ajoutez d'autres pays selon vos besoins
};

export function getCountryLocalTime(country: string | undefined): string {
  if (!country) return '';
  
  // Obtenir le fuseau horaire du pays ou utiliser UTC par défaut
  const timezone = COUNTRY_TO_TIMEZONE[country] || 'UTC';
  
  try {
    // Formater l'heure actuelle selon le fuseau horaire du pays
    return formatInTimeZone(new Date(), timezone, 'HH:mm');
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'heure pour ${country}:`, error);
    return '';
  }
}

export function getCountryLocalTimeWithDetails(country: string | undefined): { 
  time: string; 
  date: string;
  timezone: string;
} {
  if (!country) {
    return { time: '', date: '', timezone: '' };
  }
  
  const timezone = COUNTRY_TO_TIMEZONE[country] || 'UTC';
  const now = new Date();
  
  try {
    const time = formatInTimeZone(now, timezone, 'HH:mm');
    const date = formatInTimeZone(now, timezone, 'dd MMM yyyy');
    
    // Obtenir le décalage horaire par rapport à UTC
    const offset = formatInTimeZone(now, timezone, 'XXX');
    
    return {
      time,
      date,
      timezone: `UTC${offset}`
    };
  } catch (error) {
    console.error(`Erreur lors de la récupération des détails d'heure pour ${country}:`, error);
    return { time: '', date: '', timezone: '' };
  }
}
