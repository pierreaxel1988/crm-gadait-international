
/**
 * Derives nationality from country name
 */
export const deriveNationalityFromCountry = (country: string | undefined): string | undefined => {
  if (!country) return undefined;
  
  const countryToNationality: Record<string, string> = {
    'france': 'Français',
    'french': 'Français',
    'france métropolitaine': 'Français',
    'belgium': 'Belge',
    'belgique': 'Belge',
    'belge': 'Belge',
    'swiss': 'Suisse',
    'switzerland': 'Suisse',
    'suisse': 'Suisse',
    'united kingdom': 'Britannique',
    'uk': 'Britannique',
    'royaume-uni': 'Britannique',
    'angleterre': 'Britannique',
    'england': 'Britannique',
    'british': 'Britannique',
    'united states': 'Américain',
    'usa': 'Américain',
    'états-unis': 'Américain',
    'etats-unis': 'Américain',
    'american': 'Américain',
    'spain': 'Espagnol',
    'espagne': 'Espagnol',
    'italian': 'Italien',
    'italy': 'Italien',
    'italie': 'Italien',
    'german': 'Allemand',
    'germany': 'Allemand',
    'allemagne': 'Allemand',
    'russia': 'Russe',
    'russie': 'Russe',
    'russian': 'Russe',
    'netherlands': 'Néerlandais',
    'pays-bas': 'Néerlandais',
    'dutch': 'Néerlandais',
    'hollandais': 'Néerlandais',
    'holland': 'Néerlandais',
    'portugal': 'Portugais',
    'portuguese': 'Portugais',
    'greece': 'Grec',
    'grèce': 'Grec',
    'greek': 'Grec',
    'luxembourg': 'Luxembourgeois',
    'maldives': 'Maldivien',
    'mauritius': 'Mauricien',
    'seychelles': 'Seychellois',
    'croatia': 'Croate',
    'united arab emirates': 'Émirati',
    'uae': 'Émirati',
    'émirats arabes unis': 'Émirati',
    'emirats arabes unis': 'Émirati',
    'morocco': 'Marocain',
    'maroc': 'Marocain',
    'tunisie': 'Tunisien',
    'algeria': 'Algérien',
    'algérie': 'Algérien'
  };
  
  const cleanCountry = country.toLowerCase().trim();
  
  // Try direct match
  if (countryToNationality[cleanCountry]) {
    return countryToNationality[cleanCountry];
  }
  
  // Try partial matches
  for (const [key, value] of Object.entries(countryToNationality)) {
    if (cleanCountry.includes(key)) {
      return value;
    }
  }
  
  return undefined;
};

/**
 * Converts nationality back to country name for flag display
 */
export const deriveCountryFromNationality = (nationality: string | undefined): string | undefined => {
  if (!nationality) return undefined;
  
  const nationalityToCountry: Record<string, string> = {
    'français': 'France',
    'francais': 'France',
    'belge': 'Belgium',
    'suisse': 'Switzerland',
    'britannique': 'United Kingdom',
    'américain': 'United States',
    'americain': 'United States',
    'espagnol': 'Spain',
    'italien': 'Italy',
    'allemand': 'Germany',
    'russe': 'Russia',
    'néerlandais': 'Netherlands',
    'neerlandais': 'Netherlands',
    'hollandais': 'Netherlands',
    'portugais': 'Portugal',
    'grec': 'Greece',
    'luxembourgeois': 'Luxembourg',
    'maldivien': 'Maldives',
    'mauricien': 'Mauritius',
    'seychellois': 'Seychelles',
    'croate': 'Croatia',
    'émirati': 'United Arab Emirates',
    'emiratic': 'United Arab Emirates',
    'marocain': 'Morocco',
    'tunisien': 'Tunisia',
    'algérien': 'Algeria',
    'algerien': 'Algeria'
  };
  
  const cleanNationality = nationality.toLowerCase().trim();
  
  // Try direct match
  if (nationalityToCountry[cleanNationality]) {
    return nationalityToCountry[cleanNationality];
  }
  
  // Try partial matches
  for (const [key, value] of Object.entries(nationalityToCountry)) {
    if (cleanNationality.includes(key)) {
      return value;
    }
  }
  
  return undefined;
};

/**
 * Checks if a search term matches a country based on a flexible search approach
 * This function is used for the searchable dropdowns to find matches even when accents are different
 */
export const countryMatchesSearch = (country: string, searchTerm: string): boolean => {
  if (!searchTerm) return true;
  
  // Normalize strings by converting to lowercase and removing accents
  const normalizedCountry = country.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const normalizedSearch = searchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  return normalizedCountry.includes(normalizedSearch);
};
