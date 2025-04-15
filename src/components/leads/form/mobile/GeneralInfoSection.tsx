import React, { useState, useEffect, useRef } from 'react';
import { LeadDetailed, LeadSource } from '@/types/lead';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { COUNTRIES } from '@/utils/countries';
import { deriveNationalityFromCountry, countryMatchesSearch } from '@/components/chat/utils/nationalityUtils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { countryToFlag, phoneCodeToFlag } from '@/utils/countryUtils';
import { Search, ChevronDown, X, Clock } from 'lucide-react';
import { getCountryLocalTime } from '@/utils/timeUtils';

const LANGUAGE_OPTIONS = [
  { value: "Français", label: "Français" },
  { value: "English", label: "English" },
  { value: "Español", label: "Español" },
  { value: "Deutsch", label: "Deutsch" },
  { value: "Italiano", label: "Italiano" },
  { value: "Русский", label: "Русский" },
  { value: "العربية", label: "العربية" },
  { value: "Nederlands", label: "Nederlands" },
  { value: "Português", label: "Português" },
  { value: "中文", label: "中文" }
];

const LEAD_SOURCES: LeadSource[] = [
  'Site web', 'Réseaux sociaux', 'Portails immobiliers', 'Network', 
  'Repeaters', 'Recommandations', 'Apporteur d\'affaire', 'Idealista',
  'Le Figaro', 'Properstar', 'Property Cloud', 'L\'express Property',
  'James Edition', 'Annonce', 'Email', 'Téléphone', 'Autre', 'Recommendation'
];

const COUNTRY_TO_PHONE_CODE: Record<string, { code: string, flag: string }> = {
  'Afghanistan': { code: '+93', flag: '🇦🇫' },
  'Albania': { code: '+355', flag: '🇦🇱' },
  'Algeria': { code: '+213', flag: '🇩🇿' },
  'Andorra': { code: '+376', flag: '🇦🇩' },
  'Angola': { code: '+244', flag: '🇦🇴' },
  'Antigua and Barbuda': { code: '+1', flag: '🇦🇬' },
  'Argentina': { code: '+54', flag: '🇦🇷' },
  'Armenia': { code: '+374', flag: '🇦🇲' },
  'Australia': { code: '+61', flag: '🇦🇺' },
  'Austria': { code: '+43', flag: '🇦🇹' },
  'Azerbaijan': { code: '+994', flag: '🇦🇿' },
  'Bahamas': { code: '+1', flag: '🇧🇸' },
  'Bahrain': { code: '+973', flag: '🇧🇭' },
  'Bangladesh': { code: '+880', flag: '🇧🇩' },
  'Barbados': { code: '+1', flag: '🇧🇧' },
  'Belarus': { code: '+375', flag: '🇧🇾' },
  'Belgium': { code: '+32', flag: '🇧🇪' },
  'Belize': { code: '+501', flag: '🇧🇿' },
  'Benin': { code: '+229', flag: '🇧🇯' },
  'Bhutan': { code: '+975', flag: '🇧🇹' },
  'Bolivia': { code: '+591', flag: '🇧🇴' },
  'Bosnia and Herzegovina': { code: '+387', flag: '🇧🇦' },
  'Botswana': { code: '+267', flag: '🇧🇼' },
  'Brazil': { code: '+55', flag: '🇧🇷' },
  'Brunei': { code: '+673', flag: '🇧🇳' },
  'Bulgaria': { code: '+359', flag: '🇧🇬' },
  'Burkina Faso': { code: '+226', flag: '🇧🇫' },
  'Burundi': { code: '+257', flag: '🇧🇮' },
  'Cambodia': { code: '+855', flag: '🇰🇭' },
  'Cameroon': { code: '+237', flag: '🇨🇲' },
  'Canada': { code: '+1', flag: '🇨🇦' },
  'Cape Verde': { code: '+238', flag: '🇨🇻' },
  'Central African Republic': { code: '+236', flag: '🇨🇫' },
  'Chad': { code: '+235', flag: '🇹🇩' },
  'Chile': { code: '+56', flag: '🇨🇱' },
  'China': { code: '+86', flag: '🇨🇳' },
  'Colombia': { code: '+57', flag: '🇨🇴' },
  'Comoros': { code: '+269', flag: '🇰🇲' },
  'Congo': { code: '+242', flag: '🇨🇬' },
  'Costa Rica': { code: '+506', flag: '🇨🇷' },
  'Croatia': { code: '+385', flag: '🇭🇷' },
  'Cuba': { code: '+53', flag: '🇨🇺' },
  'Cyprus': { code: '+357', flag: '🇨🇾' },
  'Czech Republic': { code: '+420', flag: '🇨🇿' },
  'Denmark': { code: '+45', flag: '🇩🇰' },
  'Djibouti': { code: '+253', flag: '🇩🇯' },
  'Dominica': { code: '+1', flag: '🇩🇲' },
  'Dominican Republic': { code: '+1', flag: '🇩🇴' },
  'East Timor': { code: '+670', flag: '🇹🇱' },
  'Ecuador': { code: '+593', flag: '🇪🇨' },
  'Egypt': { code: '+20', flag: '🇪🇬' },
  'El Salvador': { code: '+503', flag: '🇸🇻' },
  'Equatorial Guinea': { code: '+240', flag: '🇬🇶' },
  'Eritrea': { code: '+291', flag: '🇪🇷' },
  'Estonia': { code: '+372', flag: '🇪🇪' },
  'Eswatini': { code: '+268', flag: '🇸🇿' },
  'Ethiopia': { code: '+251', flag: '🇪🇹' },
  'Fiji': { code: '+679', flag: '🇫🇯' },
  'Finland': { code: '+358', flag: '🇫🇮' },
  'France': { code: '+33', flag: '🇫🇷' },
  'Gabon': { code: '+241', flag: '🇬🇦' },
  'Gambia': { code: '+220', flag: '🇬🇲' },
  'Georgia': { code: '+995', flag: '🇬🇪' },
  'Germany': { code: '+49', flag: '🇩🇪' },
  'Ghana': { code: '+233', flag: '🇬🇭' },
  'Greece': { code: '+30', flag: '🇬🇷' },
  'Grenada': { code: '+1', flag: '🇬🇩' },
  'Guatemala': { code: '+502', flag: '🇬🇹' },
  'Guinea': { code: '+224', flag: '🇬🇳' },
  'Guinea-Bissau': { code: '+245', flag: '🇬🇼' },
  'Guyana': { code: '+592', flag: '🇬🇾' },
  'Haiti': { code: '+509', flag: '🇭🇹' },
  'Honduras': { code: '+504', flag: '🇭🇳' },
  'Hungary': { code: '+36', flag: '🇭🇺' },
  'Iceland': { code: '+354', flag: '🇮🇸' },
  'India': { code: '+91', flag: '🇮🇳' },
  'Indonesia': { code: '+62', flag: '🇮🇩' },
  'Iran': { code: '+98', flag: '🇮🇷' },
  'Iraq': { code: '+964', flag: '🇮🇶' },
  'Ireland': { code: '+353', flag: '🇮🇪' },
  'Israel': { code: '+972', flag: '🇮🇱' },
  'Italy': { code: '+39', flag: '🇮🇹' },
  'Ivory Coast': { code: '+225', flag: '🇨🇮' },
  'Jamaica': { code: '+1', flag: '🇯🇲' },
  'Japan': { code: '+81', flag: '🇯🇵' },
  'Jordan': { code: '+962', flag: '🇯🇴' },
  'Kazakhstan': { code: '+7', flag: '🇰🇿' },
  'Kenya': { code: '+254', flag: '🇰🇪' },
  'Kiribati': { code: '+686', flag: '🇰🇮' },
  'Korea, North': { code: '+850', flag: '🇰🇵' },
  'Korea, South': { code: '+82', flag: '🇰🇷' },
  'Kosovo': { code: '+383', flag: '🇽🇰' },
  'Kuwait': { code: '+965', flag: '🇰🇼' },
  'Kyrgyzstan': { code: '+996', flag: '🇰🇬' },
  'Laos': { code: '+856', flag: '🇱🇦' },
  'Latvia': { code: '+371', flag: '🇱🇻' },
  'Lebanon': { code: '+961', flag: '🇱🇧' },
  'Lesotho': { code: '+266', flag: '🇱🇸' },
  'Liberia': { code: '+231', flag: '🇱🇷' },
  'Libya': { code: '+218', flag: '🇱🇾' },
  'Liechtenstein': { code: '+423', flag: '🇱🇮' },
  'Lithuania': { code: '+370', flag: '🇱🇹' },
  'Luxembourg': { code: '+352', flag: '🇱🇺' },
  'Madagascar': { code: '+261', flag: '🇲🇬' },
  'Malawi': { code: '+265', flag: '🇲🇼' },
  'Malaysia': { code: '+60', flag: '🇲🇾' },
  'Maldives': { code: '+960', flag: '🇲🇻' },
  'Mali': { code: '+223', flag: '🇲🇱' },
  'Malta': { code: '+356', flag: '🇲🇹' },
  'Marshall Islands': { code: '+692', flag: '🇲🇭' },
  'Mauritania': { code: '+222', flag: '🇲🇷' },
  'Mauritius': { code: '+230', flag: '🇲🇺' },
  'Mexico': { code: '+52', flag: '🇲🇽' },
  'Micronesia': { code: '+691', flag: '🇫🇲' },
  'Moldova': { code: '+373', flag: '🇲🇩' },
  'Monaco': { code: '+377', flag: '🇲🇨' },
  'Mongolia': { code: '+976', flag: '🇲🇳' },
  'Montenegro': { code: '+382', flag: '🇲🇪' },
  'Morocco': { code: '+212', flag: '🇲🇦' },
  'Mozambique': { code: '+258', flag: '🇲🇿' },
  'Myanmar': { code: '+95', flag: '🇲🇲' },
  'Namibia': { code: '+264', flag: '🇳🇦' },
  'Nauru': { code: '+674', flag: '🇳🇷' },
  'Nepal': { code: '+977', flag: '🇳🇵' },
  'Netherlands': { code: '+31', flag: '🇳🇱' },
  'New Zealand': { code: '+64', flag: '🇳🇿' },
  'Nicaragua': { code: '+505', flag: '🇳🇮' },
  'Niger': { code: '+227', flag: '🇳🇪' },
  'Nigeria': { code: '+234', flag: '🇳🇬' },
  'North Macedonia': { code: '+389', flag: '🇲🇰' },
  'Norway': { code: '+47', flag: '🇳🇴' },
  'Oman': { code: '+968', flag: '🇴🇲' },
  'Pakistan': { code: '+92', flag: '🇵🇰' },
  'Palau': { code: '+680', flag: '🇵🇼' },
  'Panama': { code: '+507', flag: '🇵🇦' },
  'Papua New Guinea': { code: '+675', flag: '🇵🇬' },
  'Paraguay': { code: '+595', flag: '🇵🇾' },
  'Peru': { code: '+51', flag: '🇵🇪' },
  'Philippines': { code: '+63', flag: '🇵🇭' },
  'Poland': { code: '+48', flag: '🇵🇱' },
  'Portugal': { code: '+351', flag: '🇵🇹' },
  'Qatar': { code: '+974', flag: '🇶🇦' },
  'Romania': { code: '+40', flag: '🇷🇴' },
  'Russia': { code: '+7', flag: '🇷🇺' },
  'Rwanda': { code: '+250', flag: '🇷🇼' },
  'Saint Kitts and Nevis': { code: '+1', flag: '🇰🇳' },
  'Saint Lucia': { code: '+1', flag: '🇱🇨' },
  'Saint Vincent and the Grenadines': { code: '+1', flag: '🇻🇨' },
  'Samoa': { code: '+685', flag: '🇼🇸' },
  'San Marino': { code: '+378', flag: '🇸🇲' },
  'Sao Tome and Principe': { code: '+239', flag: '🇸🇹' },
  'Saudi Arabia': { code: '+966', flag: '🇸🇦' },
  'Senegal': { code: '+221', flag: '🇸🇳' },
  'Serbia': { code: '+381', flag: '🇷🇸' },
  'Seychelles': { code: '+248', flag: '🇸🇨' },
  'Sierra Leone': { code: '+232', flag: '🇸🇱' },
  'Singapore': { code: '+65', flag: '🇸🇬' },
  'Slovakia': { code: '+421', flag: '🇸🇰' },
  'Slovenia': { code: '+386', flag: '🇸🇮' },
  'Solomon Islands': { code: '+677', flag: '🇸🇧' },
  'Somalia': { code: '+252', flag: '🇸🇴' },
  'South Africa': { code: '+27', flag: '🇿🇦' },
  'South Sudan': { code: '+211', flag: '🇸🇸' },
  'Spain': { code: '+34', flag: '🇪🇸' },
  'Sri Lanka': { code: '+94', flag: '🇱🇰' },
  'Sudan': { code: '+249', flag: '🇸🇩' },
  'Suriname': { code: '+597', flag: '🇸🇷' },
  'Sweden': { code: '+46', flag: '🇸🇪' },
  'Switzerland': { code: '+41', flag: '🇨🇭' },
  'Syria': { code: '+963', flag: '🇸🇾' },
  'Taiwan': { code: '+886', flag: '🇹🇼' },
  'Tajikistan': { code: '+992', flag: '🇹🇯' },
  'Tanzania': { code: '+255', flag: '🇹🇿' },
  'Thailand': { code: '+66', flag: '🇹🇭' },
  'Togo': { code: '+228', flag: '🇹🇬' },
  'Tonga': { code: '+676', flag: '🇹🇴' },
  'Trinidad and Tobago': { code: '+1', flag: '🇹🇹' },
  'Tunisia': { code: '+216', flag: '🇹🇳' },
  'Turkey': { code: '+90', flag: '🇹🇷' },
  'Turkmenistan': { code: '+993', flag: '🇹🇲' },
  'Tuvalu': { code: '+688', flag: '🇹🇻' },
  'Uganda': { code: '+256', flag: '🇺🇬' },
  'Ukraine': { code: '+380', flag: '🇺🇦' },
  'United Arab Emirates': { code: '+971', flag: '🇦🇪' },
  'United Kingdom': { code: '+44', flag: '🇬🇧' },
  'United States': { code: '+1', flag: '🇺🇸' },
  'Uruguay': { code: '+598', flag: '🇺🇾' },
  'Uzbekistan': { code: '+998', flag: '🇺🇿' },
  'Vanuatu': { code: '+678', flag: '🇻🇺' },
  'Vatican City': { code: '+39', flag: '🇻🇦' },
  'Venezuela': { code: '+58', flag: '🇻🇪' },
  'Vietnam': { code: '+84', flag: '🇻🇳' },
  'Yemen': { code: '+967', flag: '🇾🇪' },
  'Zambia': { code: '+260', flag: '🇿🇲' },
  'Zimbabwe': { code: '+263', flag: '🇿🇼' },
  // Common aliases
  'USA': { code: '+1', flag: '🇺🇸' },
  'UK': { code: '+44', flag: '🇬🇧' },
  'Great Britain': { code: '+44', flag: '🇬🇧' },
  'Angleterre': { code: '+44', flag: '🇬🇧' },
  'England': { code: '+44', flag: '🇬🇧' },
  'Royaume-Uni': { code: '+44', flag: '🇬🇧' },
  'États-Unis': { code: '+1', flag: '🇺🇸' },
  'Etats-Unis': { code: '+1', flag: '🇺🇸' },
  'Espagne': { code: '+34', flag: '🇪🇸' },
  'Allemagne': { code: '+49', flag: '🇩🇪' },
  'Italie': { code: '+39', flag: '🇮🇹' },
  'Suisse': { code: '+41', flag: '🇨🇭' },
  'Belgique': { code: '+32', flag: '🇧🇪' },
  'Pays-Bas': { code: '+31', flag: '🇳🇱' },
  'Grèce': { code: '+30', flag: '🇬🇷' },
  'Turquie': { code: '+90', flag: '🇹🇷' },
  'Russie': { code: '+7', flag: '🇷🇺' },
  'Japon': { code: '+81', flag: '🇯🇵' },
  'Chine': { code: '+86', flag: '🇨🇳' },
  'Inde': { code: '+91', flag: '🇮🇳' },
  'Brésil': { code: '+55', flag: '🇧🇷' },
  'Australie': { code: '+61', flag: '🇦🇺' },
};

const ALL_COUNTRY_CODES = Object.entries(COUNTRY_TO_PHONE_CODE).map(([country, data]) => ({
  country,
  code: data.code,
  flag: data.flag
}));

const COMMON_COUNTRY_CODES = [
  { country: 'France', code: '+33', flag: '🇫🇷' },
  { country: 'United Kingdom', code: '+44', flag: '🇬🇧' },
  { code: '+1', flag: '🇺🇸' },
  { country: 'Spain', code: '+34', flag: '🇪🇸' },
  { country: 'Italy', code: '+39', flag: '🇮🇹' },
  { country: 'Switzerland', code: '+41', flag: '🇨🇭' },
  { country: 'Germany', code: '+49', flag: '🇩🇪' },
  { country: 'Belgium', code: '+32', flag: '🇧🇪' },
  { country: 'Netherlands', code: '+31', flag: '🇳🇱' },
  { country: 'Portugal', code: '+351', flag: '🇵🇹' },
  { country: 'United Arab Emirates', code: '+971', flag: '🇦🇪' }
];

interface GeneralInfoSectionProps {
  lead: LeadDetailed;
  onDataChange: (data: Partial<LeadDetailed>) => void;
}

const GeneralInfoSection: React.FC<GeneralInfoSectionProps> = ({
  lead,
  onDataChange
}) => {
  const [headerHeight, setHeaderHeight] = useState<number>(0);
  const [isHeaderMeasured, setIsHeaderMeasured] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [phoneSearchQuery, setPhoneSearchQuery] = useState("");
  const [isCountryCodeOpen, setIsCountryCodeOpen] = useState(false);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [isNationalitySearchOpen, setIsNationalitySearchOpen] = useState(false);
  const [showAllCountryCodes, setShowAllCountryCodes] = useState(false);
  
  const countryCodeRef = React.useRef<HTMLDivElement>(null);
  const countryDropdownRef = React.useRef<HTMLDivElement>(null);
  const nationalitySearchRef = React.useRef<HTMLDivElement>(null);
  
  const normalizeString = (text: string): string => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };
  
  useEffect(() => {
    const measureHeader = () => {
      const headerElement = document.querySelector('.bg-loro-sand');
      if (headerElement) {
        const height = headerElement.getBoundingClientRect().height;
        setHeaderHeight(height);
        setIsHeaderMeasured(true);
      }
    };
    
    measureHeader();
    
    window.addEventListener('resize', measureHeader);
    
    const timeoutId = setTimeout(measureHeader, 300);
    
    return () => {
      window.removeEventListener('resize', measureHeader);
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryCodeRef.current && !countryCodeRef.current.contains(event.target as Node)) {
        setIsCountryCodeOpen(false);
        setPhoneSearchQuery("");
        setShowAllCountryCodes(false);
      }
      
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
        setIsCountryDropdownOpen(false);
      }
      
      if (nationalitySearchRef.current && !nationalitySearchRef.current.contains(event.target as Node)) {
        setIsNationalitySearchOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const [localTime, setLocalTime] = useState<string>('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update local time immediately when country changes and setup interval
  useEffect(() => {
    // Clear previous interval if it exists
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Function to update time
    const updateTime = () => {
      const time = getCountryLocalTime(lead.taxResidence);
      setLocalTime(time);
    };
    
    // Initial update
    updateTime();
    
    // Setup interval to update every minute
    intervalRef.current = setInterval(updateTime, 60000);
    
    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [lead.taxResidence]);

  const handleInputChange = (field: keyof LeadDetailed, value: any) => {
    onDataChange({
      [field]: value
    });
  };

  const handleTaxResidenceChange = (value: string) => {
    handleInputChange('taxResidence', value);
    
    if (!lead.nationality) {
      const nationality = deriveNationalityFromCountry(value);
      if (nationality) {
        handleInputChange('nationality', nationality);
      }
    }
    
    // Update local time immediately when country changes
    const time = getCountryLocalTime(value);
    setLocalTime(time);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange('phone', e.target.value);
  };

  const handleCountryCodeChange = (code: string, flag: string) => {
    // Update both the code and display flag
    onDataChange({
      phoneCountryCode: code,
      phoneCountryCodeDisplay: flag
    });
    
    setIsCountryCodeOpen(false);
    setPhoneSearchQuery("");
    setShowAllCountryCodes(false);
  };

  const dynamicTopMargin = isHeaderMeasured 
    ? `${Math.max(headerHeight + 8, 32)}px` 
    : 'calc(32px + 4rem)';

  const filteredCountries = searchQuery
    ? COUNTRIES.filter(country => {
        const nationalityName = deriveNationalityFromCountry(country) || country;
        return countryMatchesSearch(country, searchQuery) || 
               countryMatchesSearch(nationalityName, searchQuery);
      })
    : COUNTRIES;

  const filteredCountryCodes = phoneSearchQuery
    ? ALL_COUNTRY_CODES.filter(({ country, code }) => {
        const normalizedSearch = normalizeString(phoneSearchQuery);
        const normalizedCountry = normalizeString(country);
        return normalizedCountry.includes(normalizedSearch) || 
               code.includes(normalizedSearch);
      })
    : showAllCountryCodes ? ALL_COUNTRY_CODES : COMMON_COUNTRY_CODES;

  const handleNationalitySelect = (nationality: string) => {
    handleInputChange('nationality', nationality);
    setIsNationalitySearchOpen(false);
    setSearchQuery('');
  };

  return (
    <div 
      className="space-y-5 pt-4" 
      style={{ 
        marginTop: dynamicTopMargin,
      }}
    >
      <h2 className="text-sm font-futura uppercase tracking-wider text-gray-800 pb-2 border-b mb-4">Information Générale</h2>
      
      <ScrollArea className="h-[calc(100vh-150px)]">
        <div className="space-y-4 pb-20">
          <div className="space-y-2">
            <Label htmlFor="salutation" className="text-sm">Titre</Label>
            <Select value={lead.salutation || ''} onValueChange={(value) => handleInputChange('salutation', value)}>
              <SelectTrigger id="salutation" className="w-full font-futura">
                <SelectValue placeholder="Sélectionner un titre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="M." className="font-futura">Monsieur</SelectItem>
                <SelectItem value="Mme" className="font-futura">Madame</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm">Nom</Label>
            <Input 
              id="name" 
              value={lead.name || ''} 
              onChange={(e) => handleInputChange('name', e.target.value)} 
              placeholder="Nom complet" 
              className="w-full font-futura"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm">Email</Label>
            <Input 
              id="email" 
              type="email" 
              value={lead.email || ''} 
              onChange={(e) => handleInputChange('email', e.target.value)} 
              placeholder="Adresse email" 
              className="w-full font-futura"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm">Téléphone</Label>
            <div className="flex items-center">
              <div className="relative" ref={countryCodeRef}>
                <button
                  type="button"
                  onClick={() => setIsCountryCodeOpen(!isCountryCodeOpen)}
                  className="flex items-center h-10 px-3 border border-input border-r-0 rounded-l-md bg-background focus:outline-none hover:bg-accent transition-colors"
                >
                  <span className="mr-1">{phoneCodeToFlag(lead.phoneCountryCode || '+33')}</span>
                  <span className="text-xs text-muted-foreground">{lead.phoneCountryCode || '+33'}</span>
                  <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${isCountryCodeOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isCountryCodeOpen && (
                  <div className="absolute z-50 mt-1 w-72 bg-background border rounded-md shadow-lg">
                    <div className="p-2 border-b">
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder="Rechercher un pays..."
                          className="pl-8 h-8"
                          value={phoneSearchQuery}
                          onChange={(e) => setPhoneSearchQuery(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          autoFocus
                        />
                        {phoneSearchQuery && (
                          <button
                            className="absolute right-2 top-1/2 -translate-y-1/2"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPhoneSearchQuery('');
                            }}
                          >
                            <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="max-h-60 overflow-auto p-1">
                      {filteredCountryCodes.map(({ country, code, flag }) => (
                        <button
                          key={`${country}-${code}`}
                          className="flex items-center justify-between w-full px-4 py-2 text-left hover:bg-accent rounded-sm text-sm"
                          onClick={() => handleCountryCodeChange(code, flag)}
                        >
                          <div className="flex items-center">
                            <span className="mr-2">{flag}</span>
                            <span>{country}</span>
                          </div>
                          <span className="text-muted-foreground">{code}</span>
                        </button>
                      ))}
                      
                      {filteredCountryCodes.length === 0 && (
                        <div className="px-4 py-2 text-sm text-muted-foreground">
                          Aucun résultat
                        </div>
                      )}
                      
                      {!showAllCountryCodes && phoneSearchQuery === "" && (
                        <button
                          className="w-full px-4 py-2 text-left hover:bg-accent rounded-sm text-sm text-primary font-medium border-t mt-1"
                          onClick={() => setShowAllCountryCodes(true)}
                        >
                          Voir tous les pays
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <Input 
                id="phone" 
                type="tel" 
                value={lead.phone || ''} 
                onChange={handlePhoneChange} 
                placeholder="Numéro de téléphone" 
                className="flex-1 border-l-0 rounded-l-none"
              />
            </div>
          </div>
          
          <div className="space-y-2" ref={countryDropdownRef}>
            <div className="flex justify-between items-center">
              <Label htmlFor="taxResidence" className="text-sm">Pays de résidence</Label>
              {localTime && lead.taxResidence && (
                <div className="flex items-center space-x-1 text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{localTime}</span>
                </div>
              )}
            </div>
            <div 
              className="flex items-center justify-between px-3 py-2 h-10 w-full border border-input rounded-md bg-background text-sm cursor-pointer"
              onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
            >
              {lead
