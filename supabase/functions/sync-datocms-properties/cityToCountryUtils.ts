
// Utility functions for intelligent country determination from city names

// Import the locations mapping from the main utils
const LOCATIONS_BY_COUNTRY: Record<string, string[]> = {
  'France': [
    'Paris', 'Nice', 'Cannes', 'Saint-Tropez', 'Courchevel', 'Méribel', 'Megève',
    'Marseille', 'Lyon', 'Bordeaux', 'Toulouse', 'Strasbourg', 'Lille', 'Nantes',
    'Antibes', 'Aix-en-Provence', 'Biarritz', 'Chamonix', 'Val d\'Isère',
    'Val-d\'Isère', 'Combloux'
  ],
  'Spain': [
    'Madrid', 'Barcelona', 'Ibiza', 'Marbella', 'Mallorca', 'Valencia', 'Seville',
    'Malaga', 'Málaga', 'Alicante', 'Granada', 'San Sebastian', 'Bilbao', 'Tenerife',
    'Gran Canaria', 'Lanzarote', 'Formentera', 'Menorca', 'Costa Brava'
  ],
  'Portugal': [
    'Lisbon', 'Porto', 'Algarve', 'Cascais', 'Sintra', 'Madeira', 'Estoril',
    'Comporta', 'Azores', 'Faro', 'Lagos', 'Albufeira', 'Vilamoura', 'Tavira'
  ],
  'Switzerland': [
    'Zurich', 'Geneva', 'Zermatt', 'St. Moritz', 'Verbier', 'Gstaad', 'Lucerne',
    'Lausanne', 'Lugano', 'Montreux', 'Basel', 'Bern', 'Interlaken', 'Davos'
  ],
  'United Kingdom': [
    'London', 'Edinburgh', 'Oxford', 'Cambridge', 'Manchester', 'Bath', 'Brighton',
    'Bristol', 'York', 'Liverpool', 'Glasgow', 'Birmingham', 'Windsor', 'Cheltenham'
  ],
  'United States': [
    'New York', 'Los Angeles', 'Miami', 'Miami Beach', 'South Beach', 'Fort Lauderdale',
    'Palm Beach', 'Naples', 'San Francisco', 'Chicago', 'Boston', 'Washington D.C.',
    'Seattle', 'San Diego', 'Las Vegas', 'Austin', 'Denver', 'Aspen', 'Beverly Hills',
    'Malibu', 'Palm Springs', 'Hamptons', 'Telluride', 'Key West', 'Orlando',
    'Scottsdale', 'Santa Barbara', 'Napa Valley', 'Sonoma', 'Hawaii', 'Maui', 'Kauai'
  ],
  'Croatia': [
    'Dubrovnik', 'Split', 'Hvar', 'Zagreb', 'Rovinj', 'Zadar', 'Korčula',
    'Brač', 'Opatija', 'Makarska', 'Pula', 'Vis', 'Trogir', 'Šibenik'
  ],
  'Greece': [
    'Athens', 'Santorini', 'Mykonos', 'Crete', 'Rhodes', 'Corfu', 'Paros',
    'Naxos', 'Zakynthos', 'Thessaloniki', 'Kos', 'Milos', 'Hydra', 'Aegina',
    'Skiathos', 'Skopelos', 'Alonissos', 'Chania', 'Heraklion', 'Rethymno',
    'Oia', 'Fira', 'Imerovigli', 'Kamari', 'Perissa', 'Akrotiri'
  ],
  'Maldives': [
    'Malé', 'Baa Atoll', 'North Malé Atoll', 'South Malé Atoll', 'Ari Atoll',
    'Noonu Atoll', 'Raa Atoll', 'Lhaviyani Atoll', 'Dhaalu Atoll', 'Thaa Atoll'
  ],
  'Mauritius': [
    'Grand Baie', 'Flic en Flac', 'Port Louis', 'Le Morne', 'Belle Mare',
    'Trou aux Biches', 'Tamarin', 'Bel Ombre', 'Black River', 'Grand Gaube',
    'Rivière Noire', 'Wolmar'
  ],
  'Seychelles': [
    'Mahé', 'Praslin', 'La Digue', 'Eden Island', 'Silhouette Island',
    'Fregate Island', 'North Island', 'Desroches Island', 'Cerf Island', 'Ste Anne'
  ],
  'United Arab Emirates': [
    'Dubai', 'Abu Dhabi', 'Sharjah', 'Ras Al Khaimah', 'Ajman',
    'Palm Jumeirah', 'Downtown Dubai', 'Dubai Marina', 'Jumeirah Beach', 'Al Ain'
  ]
};

// Normalize text for comparison (remove accents, lowercase, trim)
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/['']/g, "'") // Normalize apostrophes
    .replace(/[""]/g, '"') // Normalize quotes
    .replace(/\s+/g, ' '); // Normalize spaces
}

// Find country by exact city match
function findCountryByExactMatch(cityName: string): string | null {
  const normalizedCity = normalizeText(cityName);
  
  for (const [country, cities] of Object.entries(LOCATIONS_BY_COUNTRY)) {
    for (const city of cities) {
      if (normalizeText(city) === normalizedCity) {
        console.log(`🎯 Exact match found: ${cityName} → ${country}`);
        return country;
      }
    }
  }
  
  return null;
}

// Find country by partial city match
function findCountryByPartialMatch(cityName: string): string | null {
  const normalizedCity = normalizeText(cityName);
  
  for (const [country, cities] of Object.entries(LOCATIONS_BY_COUNTRY)) {
    for (const city of cities) {
      const normalizedMappedCity = normalizeText(city);
      
      // Check if either city contains the other
      if (normalizedCity.includes(normalizedMappedCity) || normalizedMappedCity.includes(normalizedCity)) {
        console.log(`🔍 Partial match found: ${cityName} ↔ ${city} → ${country}`);
        return country;
      }
    }
  }
  
  return null;
}

// Find country using intelligent patterns
function findCountryByPattern(cityName: string): string | null {
  const normalizedCity = normalizeText(cityName);
  
  // French patterns
  if (normalizedCity.includes('saint-') || normalizedCity.includes('saint ') ||
      normalizedCity.includes('sur-') || normalizedCity.includes('-en-') ||
      normalizedCity.includes('les ') || normalizedCity.includes('le ')) {
    console.log(`🇫🇷 French pattern detected: ${cityName} → France`);
    return 'France';
  }
  
  // Spanish patterns
  if (normalizedCity.includes('costa ') || normalizedCity.includes('puerto ') ||
      normalizedCity.includes('san ') || normalizedCity.includes('santa ')) {
    console.log(`🇪🇸 Spanish pattern detected: ${cityName} → Spain`);
    return 'Spain';
  }
  
  // Greek patterns
  if (normalizedCity.includes('santorini') || normalizedCity.includes('mykonos') || 
      normalizedCity.includes('athens') || normalizedCity.includes('thessaloniki') ||
      normalizedCity.includes('oia') || normalizedCity.includes('fira')) {
    console.log(`🇬🇷 Greek pattern detected: ${cityName} → Greece`);
    return 'Greece';
  }
  
  // Mauritian patterns (French names in tropical context)
  if ((normalizedCity.includes('baie') || normalizedCity.includes('riviere') || 
       normalizedCity.includes('port')) && 
      (normalizedCity.includes('grand') || normalizedCity.includes('belle') || 
       normalizedCity.includes('noir'))) {
    console.log(`🇲🇺 Mauritian pattern detected: ${cityName} → Mauritius`);
    return 'Mauritius';
  }
  
  return null;
}

// Main function to determine country from city name
export function determineCountryFromCity(cityName: string): string | null {
  if (!cityName || cityName.trim() === '') {
    return null;
  }
  
  console.log(`🌍 Analyzing city: "${cityName}"`);
  
  // Try exact match first
  let country = findCountryByExactMatch(cityName);
  if (country) return country;
  
  // Try partial match
  country = findCountryByPartialMatch(cityName);
  if (country) return country;
  
  // Try pattern matching
  country = findCountryByPattern(cityName);
  if (country) return country;
  
  console.log(`❌ No country found for city: ${cityName}`);
  return null;
}

// Enhanced country determination with fallback logic
export function determineCountryIntelligently(
  countryFromDatoCms: string | null,
  cityName: string | null,
  propertyTitle: string = ''
): string {
  
  // Priority 1: Use country from DatoCMS if available
  if (countryFromDatoCms && countryFromDatoCms.trim() !== '') {
    console.log(`✅ Using country from DatoCMS: ${countryFromDatoCms}`);
    return countryFromDatoCms;
  }
  
  // Priority 2: Determine from city if available
  if (cityName && cityName.trim() !== '') {
    const inferredCountry = determineCountryFromCity(cityName);
    if (inferredCountry) {
      console.log(`🔍 Inferred country from city "${cityName}": ${inferredCountry}`);
      return inferredCountry;
    }
  }
  
  // Priority 3: Try to infer from property title as last resort
  if (propertyTitle) {
    const inferredFromTitle = determineCountryFromCity(propertyTitle);
    if (inferredFromTitle) {
      console.log(`📝 Inferred country from title "${propertyTitle}": ${inferredFromTitle}`);
      return inferredFromTitle;
    }
  }
  
  // Fallback: Mark as unspecified for manual review
  console.warn(`⚠️ Could not determine country for city: "${cityName}", title: "${propertyTitle}"`);
  return 'Non spécifié';
}
