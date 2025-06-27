
import { countryToISOMap } from './countryMappings';
import { phoneCodeToFlagMap } from './phoneCodeMappings';
import { deriveCountryFromNationality } from '@/components/chat/utils/nationalityUtils';

/**
 * Converts a country code (two-letter ISO) to a flag emoji
 */
export const countryCodeToFlag = (code: string): string => {
  if (!code || code.length !== 2) return '🌍';
  
  const codePoints = code
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  
  return String.fromCodePoint(...codePoints);
};

/**
 * Converts a country name or nationality to its flag emoji
 */
export const countryToFlag = (countryOrNationality: string): string => {
  if (!countryOrNationality) return '🌍';
  
  const input = countryOrNationality.trim();
  
  // First try direct country match
  const isoCode = countryToISOMap[input];
  if (isoCode) {
    return countryCodeToFlag(isoCode);
  }
  
  // If no direct match, try to convert nationality to country
  const countryFromNationality = deriveCountryFromNationality(input);
  if (countryFromNationality) {
    const isoCodeFromNationality = countryToISOMap[countryFromNationality];
    if (isoCodeFromNationality) {
      return countryCodeToFlag(isoCodeFromNationality);
    }
  }
  
  // Try partial match if exact match fails
  for (const [key, code] of Object.entries(countryToISOMap)) {
    if (input.toLowerCase().includes(key.toLowerCase()) || 
        key.toLowerCase().includes(input.toLowerCase())) {
      return countryCodeToFlag(code);
    }
  }
  
  return '🌍';
};

/**
 * Maps common phone country codes to their flag emojis
 */
export const phoneCodeToFlag = (code: string): string => {
  if (!code) return '🌍';
  
  return phoneCodeToFlagMap[code] || '🌍';
};
