
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
    'emirats arabes unis': 'Émirati'
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
