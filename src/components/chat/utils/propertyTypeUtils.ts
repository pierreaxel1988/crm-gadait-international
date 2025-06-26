
import { PropertyType } from '@/types/lead';

/**
 * Normalizes various property type strings to match our enum values
 */
export const normalizePropertyType = (type: string | undefined): PropertyType | undefined => {
  if (!type) return undefined;
  
  const typeMap: Record<string, PropertyType> = {
    'terrain': 'Terrain',
    'terrains': 'Terrain',
    'land': 'Terrain',
    'plot': 'Terrain',
    'villa': 'Villa',
    'villas': 'Villa',
    'apartment': 'Appartement',
    'appartement': 'Appartement',
    'apartement': 'Appartement',
    'appartements': 'Appartement',
    'penthouse': 'Penthouse',
    'penthouses': 'Penthouse',
    'maison': 'Maison',
    'maisons': 'Maison',
    'house': 'Maison',
    'houses': 'Maison',
    'duplex': 'Duplex',
    'chalet': 'Chalet',
    'chalets': 'Chalet',
    'manoir': 'Manoir',
    'manoirs': 'Manoir',
    'mansion': 'Manoir',
    'mansions': 'Manoir',
    'townhouse': 'Maison de ville',
    'maison de ville': 'Maison de ville',
    'château': 'Château',
    'chateau': 'Château',
    'châteaux': 'Château',
    'chateaux': 'Château',
    'castle': 'Château',
    'local commercial': 'Local commercial',
    'commercial': 'Local commercial',
    'commercial space': 'Local commercial'
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
