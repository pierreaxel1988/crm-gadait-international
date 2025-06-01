
import { PropertyType } from '@/types/lead';

/**
 * Normalizes various property type strings to match our enum values
 */
export const normalizePropertyType = (type: string | undefined): PropertyType | undefined => {
  if (!type) return undefined;
  
  const typeMap: Record<string, PropertyType> = {
    'terrain': 'Land',
    'terrains': 'Land',
    'villa': 'Villa',
    'villas': 'Villa',
    'apartment': 'Apartment',
    'appartement': 'Apartment',
    'apartement': 'Apartment',
    'appartements': 'Apartment',
    'penthouse': 'Other',
    'penthouses': 'Other',
    'maison': 'House',
    'maisons': 'House',
    'house': 'House',
    'houses': 'House',
    'duplex': 'Other',
    'chalet': 'Other',
    'chalets': 'Other',
    'manoir': 'Other',
    'manoirs': 'Other',
    'mansion': 'Other',
    'mansions': 'Other',
    'townhouse': 'House',
    'maison de ville': 'House',
    'château': 'Other',
    'chateau': 'Other',
    'châteaux': 'Other',
    'chateaux': 'Other',
    'local commercial': 'Other',
    'commercial': 'Other',
    'hotel': 'Other',
    'hôtel': 'Other',
    'hotels': 'Other',
    'hôtels': 'Other',
    'vignoble': 'Other',
    'vineyard': 'Other',
    'vineyards': 'Other',
    'vignobles': 'Other',
    'plot': 'Land',
    'land': 'Land',
    'property': 'Other',
    'propriété': 'Other',
    'proprietes': 'Other',
    'propriétés': 'Other'
  };
  
  // Clean up input type for matching
  const cleanType = type.toLowerCase().trim();
  
  // Try direct match
  if (typeMap[cleanType]) {
    return typeMap[cleanType];
  }
  
  // Try partial matches
  for (const [key, value] of Object.entries(typeMap)) {
    if (cleanType.includes(key)) {
      return value;
    }
  }
  
  // If direct match fails, check for substring matches
  for (const validType of Object.values(typeMap)) {
    if (cleanType.includes(validType.toLowerCase())) {
      return validType;
    }
  }
  
  return undefined;
};
