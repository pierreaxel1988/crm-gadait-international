
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
 * Maps common country names to their ISO codes
 */
const countryToISOMap: Record<string, string> = {
  'Afghanistan': 'AF',
  'Albania': 'AL',
  'Algeria': 'DZ',
  'Andorra': 'AD',
  'Angola': 'AO',
  'Antigua and Barbuda': 'AG',
  'Argentina': 'AR',
  'Armenia': 'AM',
  'Australia': 'AU',
  'Austria': 'AT',
  'Azerbaijan': 'AZ',
  'Bahamas': 'BS',
  'Bahrain': 'BH',
  'Bangladesh': 'BD',
  'Barbados': 'BB',
  'Belarus': 'BY',
  'Belgium': 'BE',
  'Belize': 'BZ',
  'Benin': 'BJ',
  'Bhutan': 'BT',
  'Bolivia': 'BO',
  'Bosnia and Herzegovina': 'BA',
  'Botswana': 'BW',
  'Brazil': 'BR',
  'Brunei': 'BN',
  'Bulgaria': 'BG',
  'Burkina Faso': 'BF',
  'Burundi': 'BI',
  'Cabo Verde': 'CV',
  'Cambodia': 'KH',
  'Cameroon': 'CM',
  'Canada': 'CA',
  'Central African Republic': 'CF',
  'Chad': 'TD',
  'Chile': 'CL',
  'China': 'CN',
  'Colombia': 'CO',
  'Comoros': 'KM',
  'Congo': 'CG',
  'Costa Rica': 'CR',
  'Croatia': 'HR',
  'Cuba': 'CU',
  'Cyprus': 'CY',
  'Czech Republic': 'CZ',
  'Denmark': 'DK',
  'Djibouti': 'DJ',
  'Dominica': 'DM',
  'Dominican Republic': 'DO',
  'East Timor': 'TL',
  'Ecuador': 'EC',
  'Egypt': 'EG',
  'El Salvador': 'SV',
  'Equatorial Guinea': 'GQ',
  'Eritrea': 'ER',
  'Estonia': 'EE',
  'Eswatini': 'SZ',
  'Ethiopia': 'ET',
  'Fiji': 'FJ',
  'Finland': 'FI',
  'France': 'FR',
  'Gabon': 'GA',
  'Gambia': 'GM',
  'Georgia': 'GE',
  'Germany': 'DE',
  'Ghana': 'GH',
  'Greece': 'GR',
  'Grenada': 'GD',
  'Guatemala': 'GT',
  'Guinea': 'GN',
  'Guinea-Bissau': 'GW',
  'Guyana': 'GY',
  'Haiti': 'HT',
  'Honduras': 'HN',
  'Hungary': 'HU',
  'Iceland': 'IS',
  'India': 'IN',
  'Indonesia': 'ID',
  'Iran': 'IR',
  'Iraq': 'IQ',
  'Ireland': 'IE',
  'Israel': 'IL',
  'Italy': 'IT',
  'Ivory Coast': 'CI',
  'Jamaica': 'JM',
  'Japan': 'JP',
  'Jordan': 'JO',
  'Kazakhstan': 'KZ',
  'Kenya': 'KE',
  'Kiribati': 'KI',
  'Korea, North': 'KP',
  'Korea, South': 'KR',
  'Kosovo': 'XK',
  'Kuwait': 'KW',
  'Kyrgyzstan': 'KG',
  'Laos': 'LA',
  'Latvia': 'LV',
  'Lebanon': 'LB',
  'Lesotho': 'LS',
  'Liberia': 'LR',
  'Libya': 'LY',
  'Liechtenstein': 'LI',
  'Lithuania': 'LT',
  'Luxembourg': 'LU',
  'Madagascar': 'MG',
  'Malawi': 'MW',
  'Malaysia': 'MY',
  'Maldives': 'MV',
  'Mali': 'ML',
  'Malta': 'MT',
  'Marshall Islands': 'MH',
  'Mauritania': 'MR',
  'Mauritius': 'MU',
  'Mexico': 'MX',
  'Micronesia': 'FM',
  'Moldova': 'MD',
  'Monaco': 'MC',
  'Mongolia': 'MN',
  'Montenegro': 'ME',
  'Morocco': 'MA',
  'Mozambique': 'MZ',
  'Myanmar': 'MM',
  'Namibia': 'NA',
  'Nauru': 'NR',
  'Nepal': 'NP',
  'Netherlands': 'NL',
  'New Zealand': 'NZ',
  'Nicaragua': 'NI',
  'Niger': 'NE',
  'Nigeria': 'NG',
  'North Macedonia': 'MK',
  'Norway': 'NO',
  'Oman': 'OM',
  'Pakistan': 'PK',
  'Palau': 'PW',
  'Panama': 'PA',
  'Papua New Guinea': 'PG',
  'Paraguay': 'PY',
  'Peru': 'PE',
  'Philippines': 'PH',
  'Poland': 'PL',
  'Portugal': 'PT',
  'Qatar': 'QA',
  'Romania': 'RO',
  'Russia': 'RU',
  'Rwanda': 'RW',
  'Saint Kitts and Nevis': 'KN',
  'Saint Lucia': 'LC',
  'Saint Vincent and the Grenadines': 'VC',
  'Samoa': 'WS',
  'San Marino': 'SM',
  'Sao Tome and Principe': 'ST',
  'Saudi Arabia': 'SA',
  'Senegal': 'SN',
  'Serbia': 'RS',
  'Seychelles': 'SC',
  'Sierra Leone': 'SL',
  'Singapore': 'SG',
  'Slovakia': 'SK',
  'Slovenia': 'SI',
  'Solomon Islands': 'SB',
  'Somalia': 'SO',
  'South Africa': 'ZA',
  'South Sudan': 'SS',
  'Spain': 'ES',
  'Sri Lanka': 'LK',
  'Sudan': 'SD',
  'Suriname': 'SR',
  'Sweden': 'SE',
  'Switzerland': 'CH',
  'Syria': 'SY',
  'Taiwan': 'TW',
  'Tajikistan': 'TJ',
  'Tanzania': 'TZ',
  'Thailand': 'TH',
  'Togo': 'TG',
  'Tonga': 'TO',
  'Trinidad and Tobago': 'TT',
  'Tunisia': 'TN',
  'Turkey': 'TR',
  'Turkmenistan': 'TM',
  'Tuvalu': 'TV',
  'Uganda': 'UG',
  'Ukraine': 'UA',
  'United Arab Emirates': 'AE',
  'United Kingdom': 'GB',
  'United States': 'US',
  'Uruguay': 'UY',
  'Uzbekistan': 'UZ',
  'Vanuatu': 'VU',
  'Vatican City': 'VA',
  'Venezuela': 'VE',
  'Vietnam': 'VN',
  'Yemen': 'YE',
  'Zambia': 'ZM',
  'Zimbabwe': 'ZW',
  // Common aliases
  'USA': 'US', // Added USA alias explicitly
  'États-Unis': 'US', // French version
  'Etats-Unis': 'US', // French version without accent
  'UK': 'GB',
  'Great Britain': 'GB',
  'Angleterre': 'GB',
  'England': 'GB',
  'Royaume-Uni': 'GB',
  'Espagne': 'ES',
  'Allemagne': 'DE',
  'Italie': 'IT',
  'Suisse': 'CH',
  'Belgique': 'BE',
  'Pays-Bas': 'NL',
  'Grèce': 'GR',
  'Turquie': 'TR',
  'Russie': 'RU',
  'Japon': 'JP',
  'Chine': 'CN',
  'Inde': 'IN',
  'Brésil': 'BR',
  'Australie': 'AU',
};

/**
 * Converts a country name to its flag emoji
 */
export const countryToFlag = (country: string): string => {
  if (!country) return '🌍';
  
  const countryKey = country.trim();
  const isoCode = countryToISOMap[countryKey];
  
  if (isoCode) {
    return countryCodeToFlag(isoCode);
  }
  
  // Try partial match if exact match fails
  for (const [key, code] of Object.entries(countryToISOMap)) {
    if (countryKey.toLowerCase().includes(key.toLowerCase()) || 
        key.toLowerCase().includes(countryKey.toLowerCase())) {
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
  
  const codeToCountry: Record<string, string> = {
    '+1': '🇺🇸', '+33': '🇫🇷', '+44': '🇬🇧', '+34': '🇪🇸', '+39': '🇮🇹',
    '+41': '🇨🇭', '+49': '🇩🇪', '+32': '🇧🇪', '+31': '🇳🇱', '+351': '🇵🇹',
    '+30': '🇬🇷', '+46': '🇸🇪', '+47': '🇳🇴', '+45': '🇩🇰', '+358': '🇫🇮',
    '+420': '🇨🇿', '+48': '🇵🇱', '+36': '🇭🇺', '+43': '🇦🇹', '+353': '🇮🇪',
    '+352': '🇱🇺', '+377': '🇲🇨', '+7': '🇷🇺', '+380': '🇺🇦', '+40': '🇷🇴',
    '+359': '🇧🇬', '+385': '🇭🇷', '+386': '🇸🇮', '+381': '🇷🇸', '+212': '🇲🇦',
    '+213': '🇩🇿', '+216': '🇹🇳', '+20': '🇪🇬', '+27': '🇿🇦', '+234': '🇳🇬',
    '+81': '🇯🇵', '+86': '🇨🇳', '+91': '🇮🇳', '+65': '🇸🇬', '+82': '🇰🇷',
    '+971': '🇦🇪', '+966': '🇸🇦', '+974': '🇶🇦', '+961': '🇱🇧', '+972': '🇮🇱',
    '+90': '🇹🇷', '+852': '🇭🇰', '+55': '🇧🇷', '+52': '🇲🇽', '+54': '🇦🇷',
    '+56': '🇨🇱', '+57': '🇨🇴', '+58': '🇻🇪', '+51': '🇵🇪', '+61': '🇦🇺',
    '+64': '🇳🇿', '+66': '🇹🇭', '+84': '🇻🇳', '+60': '🇲🇾', '+62': '🇮🇩',
    '+63': '🇵🇭'
  };
  
  return codeToCountry[code] || '🌍';
};
