
import React, { useState, useEffect } from 'react';
import { LeadDetailed, LeadSource } from '@/types/lead';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { COUNTRIES } from '@/utils/countries';
import { deriveNationalityFromCountry, countryMatchesSearch } from '@/components/chat/utils/nationalityUtils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { countryToFlag, phoneCodeToFlag } from '@/utils/countryUtils';
import { Search, ChevronDown, X } from 'lucide-react';

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

// Common country codes for phone numbers
const COMMON_COUNTRY_CODES = [
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
  { code: '+1', country: 'United States', flag: '🇺🇸' },
  { code: '+34', country: 'Spain', flag: '🇪🇸' },
  { code: '+39', country: 'Italy', flag: '🇮🇹' },
  { code: '+41', country: 'Switzerland', flag: '🇨🇭' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+32', country: 'Belgium', flag: '🇧🇪' },
  { code: '+31', country: 'Netherlands', flag: '🇳🇱' },
  { code: '+351', country: 'Portugal', flag: '🇵🇹' },
  { code: '+971', country: 'United Arab Emirates', flag: '🇦🇪' }
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
  const [isCountryCodeOpen, setIsCountryCodeOpen] = useState(false);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [isNationalitySearchOpen, setIsNationalitySearchOpen] = useState(false);
  
  // Refs for handling outside clicks
  const countryCodeRef = React.useRef<HTMLDivElement>(null);
  const countryDropdownRef = React.useRef<HTMLDivElement>(null);
  const nationalitySearchRef = React.useRef<HTMLDivElement>(null);
  
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
      // Close country code dropdown if clicked outside
      if (countryCodeRef.current && !countryCodeRef.current.contains(event.target as Node)) {
        setIsCountryCodeOpen(false);
      }
      
      // Close country dropdown if clicked outside
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
        setIsCountryDropdownOpen(false);
      }
      
      // Close nationality search if clicked outside
      if (nationalitySearchRef.current && !nationalitySearchRef.current.contains(event.target as Node)) {
        setIsNationalitySearchOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange('phone', e.target.value);
  };

  const handleCountryCodeChange = (code: string, flag: string) => {
    handleInputChange('phoneCountryCode', code);
    handleInputChange('phoneCountryCodeDisplay', flag);
    setIsCountryCodeOpen(false);
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
                  <span className="text-lg mr-1">{lead.phoneCountryCodeDisplay || '🇫🇷'}</span>
                  <span className="text-xs text-muted-foreground">{lead.phoneCountryCode || '+33'}</span>
                  <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${isCountryCodeOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isCountryCodeOpen && (
                  <div className="absolute z-50 mt-1 w-64 max-h-60 overflow-auto bg-background border rounded-md shadow-lg">
                    <div className="p-1">
                      {COMMON_COUNTRY_CODES.map(({ code, country, flag }) => (
                        <button
                          key={code}
                          className="flex items-center justify-between w-full px-4 py-2 text-left hover:bg-accent rounded-sm text-sm"
                          onClick={() => handleCountryCodeChange(code, flag)}
                        >
                          <div className="flex items-center">
                            <span className="text-lg mr-2">{flag}</span>
                            <span>{country}</span>
                          </div>
                          <span className="text-muted-foreground">{code}</span>
                        </button>
                      ))}
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
            <Label htmlFor="taxResidence" className="text-sm">Pays de résidence</Label>
            <div 
              className="flex items-center justify-between px-3 py-2 h-10 w-full border border-input rounded-md bg-background text-sm cursor-pointer"
              onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
            >
              {lead.taxResidence ? (
                <div className="flex items-center gap-2">
                  <span className="text-lg">{countryToFlag(lead.taxResidence)}</span>
                  <span className="font-futura">{lead.taxResidence}</span>
                </div>
              ) : (
                <span className="text-muted-foreground font-futura">Sélectionner un pays</span>
              )}
              <ChevronDown className={`h-4 w-4 transition-transform ${isCountryDropdownOpen ? 'rotate-180' : ''}`} />
            </div>
            
            {isCountryDropdownOpen && (
              <div className="absolute z-50 mt-1 w-full max-h-64 overflow-auto bg-background border rounded-md shadow-lg">
                <div className="sticky top-0 p-2 bg-background border-b">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Rechercher un pays..."
                      className="pl-8 h-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    {searchQuery && (
                      <button
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSearchQuery('');
                        }}
                      >
                        <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="p-1">
                  {filteredCountries.map(country => (
                    <div
                      key={country}
                      className={`flex items-center px-4 py-2 hover:bg-accent rounded-sm cursor-pointer ${lead.taxResidence === country ? 'bg-accent/50' : ''}`}
                      onClick={() => {
                        handleTaxResidenceChange(country);
                        setIsCountryDropdownOpen(false);
                        setSearchQuery('');
                      }}
                    >
                      <span className="text-lg mr-2">{countryToFlag(country)}</span>
                      <span className="font-futura">{country}</span>
                    </div>
                  ))}
                  
                  {filteredCountries.length === 0 && (
                    <div className="px-4 py-2 text-sm text-muted-foreground">
                      Aucun résultat
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-2" ref={nationalitySearchRef}>
            <Label htmlFor="nationality" className="text-sm">Nationalité</Label>
            <div 
              className="flex items-center justify-between px-3 py-2 h-10 w-full border border-input rounded-md bg-background text-sm cursor-pointer"
              onClick={() => setIsNationalitySearchOpen(!isNationalitySearchOpen)}
            >
              {lead.nationality ? (
                <div className="flex items-center gap-2">
                  <span className="text-lg">{countryToFlag(lead.nationality)}</span>
                  <span className="font-futura">{lead.nationality}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground font-futura">Rechercher une nationalité...</span>
                </div>
              )}
              <ChevronDown className={`h-4 w-4 transition-transform ${isNationalitySearchOpen ? 'rotate-180' : ''}`} />
            </div>
            
            {isNationalitySearchOpen && (
              <div className="absolute z-50 mt-1 w-full max-h-64 overflow-auto bg-background border rounded-md shadow-lg">
                <div className="sticky top-0 p-2 bg-background border-b">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Rechercher une nationalité..."
                      className="pl-8 h-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                    />
                    {searchQuery && (
                      <button
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSearchQuery('');
                        }}
                      >
                        <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="p-1">
                  {filteredCountries.map(country => {
                    const nationality = deriveNationalityFromCountry(country) || country;
                    // Use a unique key combining country and nationality
                    return (
                      <div
                        key={`${country}-${nationality}`}
                        className={`flex items-center px-4 py-2 hover:bg-accent rounded-sm cursor-pointer ${lead.nationality === nationality ? 'bg-accent/50' : ''}`}
                        onClick={() => handleNationalitySelect(nationality)}
                      >
                        <span className="text-lg mr-2">{countryToFlag(country)}</span>
                        <span className="font-futura">{nationality}</span>
                      </div>
                    );
                  })}
                  
                  {filteredCountries.length === 0 && (
                    <div className="px-4 py-2 text-sm text-muted-foreground">
                      Aucun résultat
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="preferredLanguage" className="text-sm">Langue préférée</Label>
            <Select 
              value={lead.preferredLanguage || ''} 
              onValueChange={(value) => handleInputChange('preferredLanguage', value)}
            >
              <SelectTrigger id="preferredLanguage" className="w-full font-futura">
                <SelectValue placeholder="Sélectionner une langue" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGE_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value} className="font-futura">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="url" className="text-sm">Lien de l'annonce vu</Label>
            <Input 
              id="url" 
              value={lead.url || ''} 
              onChange={(e) => handleInputChange('url', e.target.value)} 
              placeholder="URL de l'annonce immobilière" 
              className="w-full font-futura"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="source" className="text-sm">Source</Label>
            <Select 
              value={lead.source || ''} 
              onValueChange={(value) => handleInputChange('source', value as LeadSource)}
            >
              <SelectTrigger id="source" className="w-full font-futura">
                <SelectValue placeholder="Sélectionner une source" />
              </SelectTrigger>
              <SelectContent>
                {LEAD_SOURCES.map(source => (
                  <SelectItem key={source} value={source} className="font-futura">
                    {source}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="propertyReference" className="text-sm">Référence de propriété</Label>
            <Input 
              id="propertyReference" 
              value={lead.propertyReference || ''} 
              onChange={(e) => handleInputChange('propertyReference', e.target.value)} 
              placeholder="Référence de propriété" 
              className="w-full font-futura"
            />
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default GeneralInfoSection;
