/**
 * Utility functions for normalizing lead data to match DatoCMS property format
 */

/**
 * Normalize country names from lead format to DatoCMS format (lowercase, kebab-case)
 * @param country - Country name from lead (e.g., "France", "UAE", "United States")
 * @returns Normalized country name for DatoCMS (e.g., "france", "united-arab-emirates", "united-states")
 */
export const normalizeCountryForDatoCMS = (country: string | null | undefined): string | null => {
  if (!country) return null;
  
  const countryLower = country.toLowerCase().trim();
  
  // Mapping of lead country names to DatoCMS format
  const countryMapping: Record<string, string> = {
    // Major countries
    'france': 'france',
    'mauritius': 'mauritius',
    'maurice': 'mauritius',
    'île maurice': 'mauritius',
    
    // UAE variations
    'uae': 'united-arab-emirates',
    'united arab emirates': 'united-arab-emirates',
    'émirats arabes unis': 'united-arab-emirates',
    'emirats arabes unis': 'united-arab-emirates',
    
    // United States variations
    'united states': 'united-states',
    'usa': 'united-states',
    'états-unis': 'united-states',
    'etats-unis': 'united-states',
    'us': 'united-states',
    
    // United Kingdom variations
    'united kingdom': 'united-kingdom',
    'uk': 'united-kingdom',
    'royaume-uni': 'united-kingdom',
    'royaume uni': 'united-kingdom',
    'great britain': 'united-kingdom',
    'grande-bretagne': 'united-kingdom',
    
    // European countries
    'spain': 'spain',
    'espagne': 'spain',
    'italy': 'italy',
    'italie': 'italy',
    'portugal': 'portugal',
    'greece': 'greece',
    'grèce': 'greece',
    'grece': 'greece',
    'switzerland': 'switzerland',
    'suisse': 'switzerland',
    'germany': 'germany',
    'allemagne': 'germany',
    'belgium': 'belgium',
    'belgique': 'belgium',
    'netherlands': 'netherlands',
    'pays-bas': 'netherlands',
    'pays bas': 'netherlands',
    'austria': 'austria',
    'autriche': 'austria',
    
    // Other countries
    'canada': 'canada',
    'australia': 'australia',
    'australie': 'australia',
    'mexico': 'mexico',
    'mexique': 'mexico',
    'brazil': 'brazil',
    'brésil': 'brazil',
    'bresil': 'brazil',
    'thailand': 'thailand',
    'thaïlande': 'thailand',
    'thailande': 'thailand',
    'singapore': 'singapore',
    'singapour': 'singapore',
    'japan': 'japan',
    'japon': 'japan',
    'china': 'china',
    'chine': 'china',
    'india': 'india',
    'inde': 'india',
    'south africa': 'south-africa',
    'afrique du sud': 'south-africa',
    'morocco': 'morocco',
    'maroc': 'morocco',
    'tunisia': 'tunisia',
    'tunisie': 'tunisie',
    'egypt': 'egypt',
    'égypte': 'egypt',
    'egypte': 'egypt',
    'turkey': 'turkey',
    'turquie': 'turquie',
    'seychelles': 'seychelles',
    'maldives': 'maldives',
    'dubai': 'united-arab-emirates', // Dubai is often used instead of UAE
    'dubaï': 'united-arab-emirates',
  };
  
  // Check if we have a direct mapping
  if (countryMapping[countryLower]) {
    return countryMapping[countryLower];
  }
  
  // If no mapping found, return lowercase with spaces replaced by hyphens
  return countryLower.replace(/\s+/g, '-');
};

/**
 * Normalize property types from lead format (French) to DatoCMS format (English lowercase)
 * @param propertyTypes - Array of property types from lead (e.g., ["Appartement", "Villa"])
 * @returns Array of normalized property types for DatoCMS (e.g., ["apartment", "villa"])
 */
export const normalizePropertyTypesForDatoCMS = (propertyTypes: string[] | null | undefined): string[] | null => {
  if (!propertyTypes || propertyTypes.length === 0) return null;
  
  // Mapping of lead property types (French) to DatoCMS format (English lowercase)
  const propertyTypeMapping: Record<string, string> = {
    // Basic types
    'appartement': 'apartment',
    'apartment': 'apartment',
    'villa': 'villa',
    'maison': 'house',
    'house': 'house',
    'penthouse': 'penthouse',
    'terrain': 'land',
    'land': 'land',
    'chalet': 'chalet',
    'manoir': 'mansion',
    'mansion': 'mansion',
    'château': 'castle',
    'chateau': 'castle',
    'castle': 'castle',
    
    // Multi-word types
    'maison de ville': 'townhouse',
    'townhouse': 'townhouse',
    'duplex': 'duplex',
    'studio': 'studio',
    'loft': 'loft',
    'mas': 'farmhouse',
    'ferme': 'farmhouse',
    'farmhouse': 'farmhouse',
    'bastide': 'country-house',
    'propriété': 'property',
    'property': 'property',
    'immeuble': 'building',
    'building': 'building',
    'commerce': 'commercial',
    'commercial': 'commercial',
    'bureau': 'office',
    'office': 'office',
    
    // Luxury types
    'hôtel particulier': 'mansion',
    'hotel particulier': 'mansion',
    'domaine': 'estate',
    'estate': 'estate',
    'palais': 'palace',
    'palace': 'palace',
    
    // Specific types
    'riad': 'riad',
    'bungalow': 'bungalow',
    'cottage': 'cottage',
    'pavillon': 'pavilion',
    'pavilion': 'pavilion',
  };
  
  return propertyTypes
    .map(type => {
      const typeLower = type.toLowerCase().trim();
      return propertyTypeMapping[typeLower] || typeLower;
    })
    .filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates
};
