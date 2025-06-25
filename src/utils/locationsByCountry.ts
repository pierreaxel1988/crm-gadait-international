// Map of countries to their major locations
export const LOCATIONS_BY_COUNTRY: Record<string, string[]> = {
  'France': [
    'Paris', 'Nice', 'Cannes', 'Saint-Tropez', 'Courchevel', 'Méribel', 'Megève',
    'Marseille', 'Lyon', 'Bordeaux', 'Toulouse', 'Strasbourg', 'Lille', 'Nantes',
    'Antibes', 'Aix-en-Provence', 'Biarritz', 'Chamonix', 'Val d\'Isère',
    'Megeve', 'Saint-Gervais', 'Les Gets', 'Morzine', 'Avoriaz', 'Flaine',
    'La Clusaz', 'Le Grand-Bornand', 'Combloux', 'Saint-Martin-de-Belleville'
  ],
  'Spain': [
    'Madrid', 'Barcelona', 'Ibiza', 'Marbella', 'Mallorca', 'Valencia', 'Seville',
    'Malaga', 'Alicante', 'Granada', 'San Sebastian', 'Bilbao', 'Tenerife',
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
    'Naxos', 'Zakynthos', 'Thessaloniki', 'Kos', 'Milos', 'Hydra', 'Aegina'
  ],
  'Grèce': [
    'Athens', 'Santorini', 'Mykonos', 'Crete', 'Rhodes', 'Corfu', 'Paros',
    'Naxos', 'Zakynthos', 'Thessaloniki', 'Kos', 'Milos', 'Hydra', 'Aegina'
  ],
  'Maldives': [
    'Malé', 'Baa Atoll', 'North Malé Atoll', 'South Malé Atoll', 'Ari Atoll',
    'Noonu Atoll', 'Raa Atoll', 'Lhaviyani Atoll', 'Dhaalu Atoll', 'Thaa Atoll'
  ],
  'Mauritius': [
    'Grand Baie', 'Flic en Flac', 'Port Louis', 'Le Morne', 'Belle Mare',
    'Trou aux Biches', 'Tamarin', 'Bel Ombre', 'Black River', 'Grand Gaube'
  ],
  'Seychelles': [
    'Mahé', 'Praslin', 'La Digue', 'Eden Island', 'Silhouette Island',
    'Fregate Island', 'North Island', 'Desroches Island', 'Cerf Island', 'Ste Anne'
  ],
  'United Arab Emirates': [
    'Dubai', 'Abu Dhabi', 'Sharjah', 'Ras Al Khaimah', 'Ajman',
    'Palm Jumeirah', 'Downtown Dubai', 'Dubai Marina', 'Jumeirah Beach', 'Al Ain'
  ],
  // Add USA and Etats-Unis as aliases for United States
  'USA': [
    'New York', 'Los Angeles', 'Miami', 'Miami Beach', 'South Beach', 'Fort Lauderdale',
    'Palm Beach', 'Naples', 'San Francisco', 'Chicago', 'Boston', 'Washington D.C.',
    'Seattle', 'San Diego', 'Las Vegas', 'Austin', 'Denver', 'Aspen', 'Beverly Hills',
    'Malibu', 'Palm Springs', 'Hamptons', 'Telluride', 'Key West', 'Orlando',
    'Scottsdale', 'Santa Barbara', 'Napa Valley', 'Sonoma', 'Hawaii', 'Maui', 'Kauai'
  ],
  'Etats-Unis': [
    'New York', 'Los Angeles', 'Miami', 'Miami Beach', 'South Beach', 'Fort Lauderdale',
    'Palm Beach', 'Naples', 'San Francisco', 'Chicago', 'Boston', 'Washington D.C.',
    'Seattle', 'San Diego', 'Las Vegas', 'Austin', 'Denver', 'Aspen', 'Beverly Hills',
    'Malibu', 'Palm Springs', 'Hamptons', 'Telluride', 'Key West', 'Orlando',
    'Scottsdale', 'Santa Barbara', 'Napa Valley', 'Sonoma', 'Hawaii', 'Maui', 'Kauai'
  ]
};

// Get all available locations across all countries
export const getAllLocations = (): string[] => {
  const allLocations: string[] = [];
  Object.values(LOCATIONS_BY_COUNTRY).forEach(locations => {
    allLocations.push(...locations);
  });
  return [...new Set(allLocations)].sort();
};

// Get locations for a specific country
export const getLocationsByCountry = (country: string): string[] => {
  // Handle USA, United States, Etats-Unis, Greece, and Grèce as the same countries
  if ((country === 'USA' || country === 'Etats-Unis') && !LOCATIONS_BY_COUNTRY[country]) {
    return LOCATIONS_BY_COUNTRY['United States'] || [];
  }
  
  if (country === 'United States' && !LOCATIONS_BY_COUNTRY[country]) {
    return LOCATIONS_BY_COUNTRY['USA'] || LOCATIONS_BY_COUNTRY['Etats-Unis'] || [];
  }
  
  if (country === 'Greece' && !LOCATIONS_BY_COUNTRY[country]) {
    return LOCATIONS_BY_COUNTRY['Grèce'] || [];
  }
  
  if (country === 'Grèce' && !LOCATIONS_BY_COUNTRY[country]) {
    return LOCATIONS_BY_COUNTRY['Greece'] || [];
  }
  
  return LOCATIONS_BY_COUNTRY[country] || [];
};
