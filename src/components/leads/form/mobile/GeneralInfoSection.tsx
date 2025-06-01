import React, { useState, useRef, useEffect } from 'react';
import { LeadDetailed, Currency } from '@/types/lead';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ChevronDown, Search, X, MapPin, Palette } from 'lucide-react';
import { countryToFlag } from '@/utils/countryUtils';
import { useCountriesFromDatabase } from '@/hooks/useCountriesFromDatabase';
import { deriveNationalityFromCountry } from '@/components/chat/utils/nationalityUtils';

interface GeneralInfoSectionProps {
  lead: LeadDetailed;
  onDataChange: (data: Partial<LeadDetailed>) => void;
}

const GeneralInfoSection = ({ lead, onDataChange }: GeneralInfoSectionProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [isNationalityDropdownOpen, setIsNationalityDropdownOpen] = useState(false);
  const [isTaxResidenceDropdownOpen, setIsTaxResidenceDropdownOpen] = useState(false);
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const nationalityDropdownRef = useRef<HTMLDivElement>(null);
  const taxResidenceDropdownRef = useRef<HTMLDivElement>(null);

  const { countries, loading: countriesLoading } = useCountriesFromDatabase();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
        setIsCountryDropdownOpen(false);
      }
      if (nationalityDropdownRef.current && !nationalityDropdownRef.current.contains(event.target as Node)) {
        setIsNationalityDropdownOpen(false);
      }
      if (taxResidenceDropdownRef.current && !taxResidenceDropdownRef.current.contains(event.target as Node)) {
        setIsTaxResidenceDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onDataChange({ [name]: value });
  };

  const filteredCountries = searchTerm
    ? countries.filter(country => 
        country.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : countries;

  const handleCountrySelect = (country: string) => {
    onDataChange({ country: country });
    setIsCountryDropdownOpen(false);
    setSearchTerm('');
  };

  const handleNationalitySelect = (nationality: string) => {
    onDataChange({ nationality: nationality });
    setIsNationalityDropdownOpen(false);
    setSearchTerm('');
  };

  const handleTaxResidenceSelect = (country: string) => {
    onDataChange({ taxResidence: country });
    setIsTaxResidenceDropdownOpen(false);
    setSearchTerm('');

    // Auto-suggest nationality if not already set
    if (!lead.nationality) {
      const nationality = deriveNationalityFromCountry(country);
      if (nationality) {
        onDataChange({ nationality: nationality });
      }
    }
  };

  const currencies: Currency[] = ["EUR", "USD", "GBP", "CHF", "AED", "MUR"];
  const salutationOptions = ['Mr', 'Mrs', 'Ms', 'Dr'];
  const languageOptions = [
    'Français', 'English', 'Deutsch', 'Italiano', 'Español', 
    'العربية', '中文', 'Русский'
  ];

  if (countriesLoading) {
    return <div className="text-center p-4">Chargement des pays...</div>;
  }

  return (
    <ScrollArea className="h-[calc(100vh-240px)] px-1">
      <div className="space-y-4">
        {/* Salutation */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Salutation</Label>
          <select
            name="salutation"
            value={lead.salutation || ''}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-loro-terracotta focus:border-transparent"
          >
            <option value="">Sélectionner</option>
            {salutationOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        {/* Nom */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Nom complet</Label>
          <Input
            name="name"
            value={lead.name || ''}
            onChange={handleInputChange}
            placeholder="Nom complet"
            className="w-full p-3 text-sm"
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Email</Label>
          <Input
            name="email"
            type="email"
            value={lead.email || ''}
            onChange={handleInputChange}
            placeholder="Email"
            className="w-full p-3 text-sm"
          />
        </div>

        {/* Téléphone */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Téléphone</Label>
          <Input
            name="phone"
            value={lead.phone || ''}
            onChange={handleInputChange}
            placeholder="Téléphone"
            className="w-full p-3 text-sm"
          />
        </div>

        {/* Pays */}
        <div className="space-y-2" ref={countryDropdownRef}>
          <Label className="text-sm font-medium flex items-center gap-2">
            <MapPin className="h-4 w-4 text-loro-terracotta" />
            Pays
          </Label>
          <div 
            className="flex items-center justify-between px-3 py-3 h-12 w-full border border-gray-300 rounded-lg bg-background text-sm cursor-pointer focus:ring-2 focus:ring-loro-terracotta focus:border-transparent"
            onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
          >
            {lead.country ? (
              <div className="flex items-center gap-2">
                <span className="text-lg">{countryToFlag(lead.country)}</span>
                <span>{lead.country}</span>
              </div>
            ) : (
              <span className="text-muted-foreground">Sélectionner un pays</span>
            )}
            <ChevronDown className={`h-4 w-4 transition-transform ${isCountryDropdownOpen ? 'rotate-180' : ''}`} />
          </div>
          
          {isCountryDropdownOpen && (
            <div className="absolute z-50 mt-1 w-full bg-background border rounded-md shadow-lg max-w-sm">
              <div className="sticky top-0 p-2 bg-background border-b">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Rechercher un pays..."
                    className="pl-8 h-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                  />
                  {searchTerm && (
                    <button
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSearchTerm('');
                      }}
                    >
                      <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="max-h-60 overflow-auto p-1">
                {filteredCountries.map(country => (
                  <div
                    key={country}
                    className={`flex items-center px-4 py-2 hover:bg-accent rounded-sm cursor-pointer ${lead.country === country ? 'bg-accent/50' : ''}`}
                    onClick={() => handleCountrySelect(country)}
                  >
                    <span className="text-lg mr-2">{countryToFlag(country)}</span>
                    <span>{country}</span>
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

        {/* Résidence fiscale */}
        <div className="space-y-2" ref={taxResidenceDropdownRef}>
          <Label className="text-sm font-medium">Résidence fiscale</Label>
          <div 
            className="flex items-center justify-between px-3 py-3 h-12 w-full border border-gray-300 rounded-lg bg-background text-sm cursor-pointer focus:ring-2 focus:ring-loro-terracotta focus:border-transparent"
            onClick={() => setIsTaxResidenceDropdownOpen(!isTaxResidenceDropdownOpen)}
          >
            {lead.taxResidence ? (
              <div className="flex items-center gap-2">
                <span className="text-lg">{countryToFlag(lead.taxResidence)}</span>
                <span>{lead.taxResidence}</span>
              </div>
            ) : (
              <span className="text-muted-foreground">Sélectionner un pays</span>
            )}
            <ChevronDown className={`h-4 w-4 transition-transform ${isTaxResidenceDropdownOpen ? 'rotate-180' : ''}`} />
          </div>
          
          {isTaxResidenceDropdownOpen && (
            <div className="absolute z-50 mt-1 w-full bg-background border rounded-md shadow-lg max-w-sm">
              <div className="sticky top-0 p-2 bg-background border-b">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Rechercher un pays..."
                    className="pl-8 h-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                  />
                  {searchTerm && (
                    <button
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSearchTerm('');
                      }}
                    >
                      <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="max-h-60 overflow-auto p-1">
                {filteredCountries.map(country => (
                  <div
                    key={country}
                    className={`flex items-center px-4 py-2 hover:bg-accent rounded-sm cursor-pointer ${lead.taxResidence === country ? 'bg-accent/50' : ''}`}
                    onClick={() => handleTaxResidenceSelect(country)}
                  >
                    <span className="text-lg mr-2">{countryToFlag(country)}</span>
                    <span>{country}</span>
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

        {/* Nationalité */}
        <div className="space-y-2" ref={nationalityDropdownRef}>
          <Label className="text-sm font-medium">Nationalité</Label>
          <div 
            className="flex items-center justify-between px-3 py-3 h-12 w-full border border-gray-300 rounded-lg bg-background text-sm cursor-pointer focus:ring-2 focus:ring-loro-terracotta focus:border-transparent"
            onClick={() => setIsNationalityDropdownOpen(!isNationalityDropdownOpen)}
          >
            {lead.nationality ? (
              <div className="flex items-center gap-2">
                <span className="text-lg">{countryToFlag(lead.nationality)}</span>
                <span>{lead.nationality}</span>
              </div>
            ) : (
              <span className="text-muted-foreground">Sélectionner une nationalité</span>
            )}
            <ChevronDown className={`h-4 w-4 transition-transform ${isNationalityDropdownOpen ? 'rotate-180' : ''}`} />
          </div>
          
          {isNationalityDropdownOpen && (
            <div className="absolute z-50 mt-1 w-full bg-background border rounded-md shadow-lg max-w-sm">
              <div className="sticky top-0 p-2 bg-background border-b">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Rechercher une nationalité..."
                    className="pl-8 h-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                  />
                  {searchTerm && (
                    <button
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSearchTerm('');
                      }}
                    >
                      <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="max-h-60 overflow-auto p-1">
                {filteredCountries.map(country => {
                  const nationality = deriveNationalityFromCountry(country) || country;
                  return (
                    <div
                      key={country}
                      className={`flex items-center px-4 py-2 hover:bg-accent rounded-sm cursor-pointer ${lead.nationality === nationality ? 'bg-accent/50' : ''}`}
                      onClick={() => handleNationalitySelect(nationality)}
                    >
                      <span className="text-lg mr-2">{countryToFlag(country)}</span>
                      <span>{nationality}</span>
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

        {/* Langue préférée */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Langue préférée</Label>
          <select
            name="preferredLanguage"
            value={lead.preferredLanguage || ''}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-loro-terracotta focus:border-transparent"
          >
            <option value="">Sélectionner une langue</option>
            {languageOptions.map(language => (
              <option key={language} value={language}>
                {language}
              </option>
            ))}
          </select>
        </div>

        {/* Localisation */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Localisation</Label>
          <Input
            name="location"
            value={lead.location || ''}
            onChange={handleInputChange}
            placeholder="Ville, région..."
            className="w-full p-3 text-sm"
          />
        </div>

        {/* Currency */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Devise</Label>
          <select
            name="currency"
            value={lead.currency || 'EUR'}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-loro-terracotta focus:border-transparent"
          >
            {currencies.map(currency => (
              <option key={currency} value={currency}>
                {currency === 'EUR' && 'Euro (€)'}
                {currency === 'USD' && 'USD ($)'}
                {currency === 'GBP' && 'GBP (£)'}
                {currency === 'CHF' && 'CHF'}
                {currency === 'AED' && 'AED'}
                {currency === 'MUR' && 'MUR'}
              </option>
            ))}
          </select>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Tags
          </Label>
          <Input
            name="tags"
            value={Array.isArray(lead.tags) ? lead.tags.join(', ') : ''}
            onChange={(e) => {
              const tagsArray = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
              onDataChange({ tags: tagsArray });
            }}
            placeholder="Tag1, Tag2, Tag3..."
            className="w-full p-3 text-sm"
          />
        </div>

        {/* Source */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Source</Label>
          <Input
            name="source"
            value={lead.source || ''}
            onChange={handleInputChange}
            placeholder="Source du lead"
            className="w-full p-3 text-sm"
          />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Notes</Label>
          <Textarea
            name="notes"
            value={lead.notes || ''}
            onChange={handleInputChange}
            placeholder="Notes additionnelles..."
            className="w-full p-3 text-sm min-h-[100px]"
          />
        </div>
      </div>
    </ScrollArea>
  );
};

export default GeneralInfoSection;
