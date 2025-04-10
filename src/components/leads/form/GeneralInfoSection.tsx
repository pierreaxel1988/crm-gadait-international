
import React, { useState, useEffect, useRef } from 'react';
import FormInput from './FormInput';
import { LeadDetailed, LeadSource, Country } from '@/types/lead';
import { countryToFlag } from '@/utils/countryUtils';
import { deriveNationalityFromCountry } from '@/components/chat/utils/nationalityUtils';
import { Search, ChevronDown, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface GeneralInfoSectionProps {
  formData: LeadDetailed;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  countries: Country[];
  sources: LeadSource[];
}

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

// Complete list of countries from around the world
const ALL_COUNTRIES: Country[] = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", 
  "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", 
  "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", 
  "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", 
  "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", 
  "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", 
  "East Timor", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", 
  "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", 
  "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", 
  "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Ivory Coast", "Jamaica", "Japan", 
  "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kosovo", "Kuwait", 
  "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", 
  "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", 
  "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", 
  "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", 
  "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Panama", 
  "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", 
  "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", 
  "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", 
  "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", 
  "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", 
  "Tajikistan", "Tanzania", "Thailand", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", 
  "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", 
  "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

const GeneralInfoSection: React.FC<GeneralInfoSectionProps> = ({
  formData,
  handleInputChange,
  countries,
  sources
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [isNationalityDropdownOpen, setIsNationalityDropdownOpen] = useState(false);
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const nationalityDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
        setIsCountryDropdownOpen(false);
      }
      if (nationalityDropdownRef.current && !nationalityDropdownRef.current.contains(event.target as Node)) {
        setIsNationalityDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Always use the full list of countries for filtering regardless of the passed prop
  const filteredCountries = searchTerm
    ? ALL_COUNTRIES.filter(country => 
        country.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (deriveNationalityFromCountry(country) || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    : ALL_COUNTRIES;

  const handleTaxResidenceSelect = (country: string) => {
    const event = {
      target: {
        name: 'taxResidence',
        value: country
      }
    } as React.ChangeEvent<HTMLInputElement>;
    handleInputChange(event);
    setIsCountryDropdownOpen(false);
    setSearchTerm('');

    // Auto-suggest nationality if not already set
    if (!formData.nationality) {
      const nationality = deriveNationalityFromCountry(country);
      if (nationality) {
        const nationalityEvent = {
          target: {
            name: 'nationality',
            value: nationality
          }
        } as React.ChangeEvent<HTMLInputElement>;
        handleInputChange(nationalityEvent);
      }
    }
  };

  const handleNationalitySelect = (nationality: string) => {
    const event = {
      target: {
        name: 'nationality',
        value: nationality
      }
    } as React.ChangeEvent<HTMLInputElement>;
    handleInputChange(event);
    setIsNationalityDropdownOpen(false);
    setSearchTerm('');
  };

  const renderCountrySelector = () => (
    <div className="space-y-2" ref={countryDropdownRef}>
      <label htmlFor="taxResidence" className="block text-sm font-medium">
        Pays de résidence
      </label>
      <div 
        className="flex items-center justify-between px-3 py-2 h-10 w-full border border-input rounded-md bg-background text-sm cursor-pointer"
        onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
      >
        {formData.taxResidence ? (
          <div className="flex items-center gap-2">
            <span className="text-lg">{countryToFlag(formData.taxResidence)}</span>
            <span>{formData.taxResidence}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">Sélectionner un pays</span>
        )}
        <ChevronDown className={`h-4 w-4 transition-transform ${isCountryDropdownOpen ? 'rotate-180' : ''}`} />
      </div>
      
      {isCountryDropdownOpen && (
        <div className="absolute z-50 mt-1 w-full bg-background border rounded-md shadow-lg">
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
                className={`flex items-center px-4 py-2 hover:bg-accent rounded-sm cursor-pointer ${formData.taxResidence === country ? 'bg-accent/50' : ''}`}
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
  );

  const renderNationalitySelector = () => (
    <div className="space-y-2" ref={nationalityDropdownRef}>
      <label htmlFor="nationality" className="block text-sm font-medium">
        Nationalité
      </label>
      <div 
        className="flex items-center justify-between px-3 py-2 h-10 w-full border border-input rounded-md bg-background text-sm cursor-pointer"
        onClick={() => setIsNationalityDropdownOpen(!isNationalityDropdownOpen)}
      >
        {formData.nationality ? (
          <div className="flex items-center gap-2">
            <span className="text-lg">{countryToFlag(formData.nationality)}</span>
            <span>{formData.nationality}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">Sélectionner une nationalité</span>
        )}
        <ChevronDown className={`h-4 w-4 transition-transform ${isNationalityDropdownOpen ? 'rotate-180' : ''}`} />
      </div>
      
      {isNationalityDropdownOpen && (
        <div className="absolute z-50 mt-1 w-full bg-background border rounded-md shadow-lg">
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
                  key={`${country}-${nationality}`}
                  className={`flex items-center px-4 py-2 hover:bg-accent rounded-sm cursor-pointer ${formData.nationality === nationality ? 'bg-accent/50' : ''}`}
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
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Titre"
          name="salutation"
          type="select"
          value={formData.salutation || ''}
          onChange={handleInputChange}
          options={[
            { value: "M.", label: "Monsieur" },
            { value: "Mme", label: "Madame" }
          ]}
          placeholder="Sélectionner un titre"
        />
        
        <FormInput
          label="Nom"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Nom complet"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Email"
          name="email"
          type="email"
          value={formData.email || ''}
          onChange={handleInputChange}
          placeholder="Adresse email"
        />
        
        <FormInput
          label="Téléphone"
          name="phone"
          type="tel-with-code"
          value={formData.phone || ''}
          onChange={handleInputChange}
          countryCode={formData.phoneCountryCode || '+33'}
          countryCodeDisplay={formData.phoneCountryCodeDisplay || '🇫🇷'}
          onCountryCodeChange={(code) => {
            const event = {
              target: {
                name: 'phoneCountryCode',
                value: code
              }
            } as React.ChangeEvent<HTMLInputElement>;
            handleInputChange(event);
            
            const flag = code === '+33' ? '🇫🇷' : '';
            if (flag) {
              const displayEvent = {
                target: {
                  name: 'phoneCountryCodeDisplay',
                  value: flag
                }
              } as React.ChangeEvent<HTMLInputElement>;
              handleInputChange(displayEvent);
            }
          }}
          placeholder="Numéro de téléphone"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2" ref={countryDropdownRef}>
          <label htmlFor="taxResidence" className="block text-sm font-medium">
            Pays de résidence
          </label>
          <div 
            className="flex items-center justify-between px-3 py-2 h-10 w-full border border-input rounded-md bg-background text-sm cursor-pointer"
            onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
          >
            {formData.taxResidence ? (
              <div className="flex items-center gap-2">
                <span className="text-lg">{countryToFlag(formData.taxResidence)}</span>
                <span>{formData.taxResidence}</span>
              </div>
            ) : (
              <span className="text-muted-foreground">Sélectionner un pays</span>
            )}
            <ChevronDown className={`h-4 w-4 transition-transform ${isCountryDropdownOpen ? 'rotate-180' : ''}`} />
          </div>
          
          {isCountryDropdownOpen && (
            <div className="absolute z-50 mt-1 w-full bg-background border rounded-md shadow-lg">
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
                    className={`flex items-center px-4 py-2 hover:bg-accent rounded-sm cursor-pointer ${formData.taxResidence === country ? 'bg-accent/50' : ''}`}
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
        
        <div className="space-y-2" ref={nationalityDropdownRef}>
          <label htmlFor="nationality" className="block text-sm font-medium">
            Nationalité
          </label>
          <div 
            className="flex items-center justify-between px-3 py-2 h-10 w-full border border-input rounded-md bg-background text-sm cursor-pointer"
            onClick={() => setIsNationalityDropdownOpen(!isNationalityDropdownOpen)}
          >
            {formData.nationality ? (
              <div className="flex items-center gap-2">
                <span className="text-lg">{countryToFlag(formData.nationality)}</span>
                <span>{formData.nationality}</span>
              </div>
            ) : (
              <span className="text-muted-foreground">Sélectionner une nationalité</span>
            )}
            <ChevronDown className={`h-4 w-4 transition-transform ${isNationalityDropdownOpen ? 'rotate-180' : ''}`} />
          </div>
          
          {isNationalityDropdownOpen && (
            <div className="absolute z-50 mt-1 w-full bg-background border rounded-md shadow-lg">
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
                      key={`${country}-${nationality}`}
                      className={`flex items-center px-4 py-2 hover:bg-accent rounded-sm cursor-pointer ${formData.nationality === nationality ? 'bg-accent/50' : ''}`}
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Langue préférée"
          name="preferredLanguage"
          type="select"
          value={formData.preferredLanguage || ''}
          onChange={handleInputChange}
          options={LANGUAGE_OPTIONS}
          placeholder="Sélectionner une langue"
        />
        
        <FormInput
          label="Source"
          name="source"
          type="select"
          value={formData.source || ''}
          onChange={handleInputChange}
          options={sources.map(source => ({ value: source, label: source }))}
          placeholder="Sélectionner une source"
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <FormInput
          label="Lien de l'annonce"
          name="url"
          value={formData.url || ''}
          onChange={handleInputChange}
          placeholder="URL de l'annonce immobilière"
        />
        
        <FormInput
          label="Référence de propriété"
          name="propertyReference"
          value={formData.propertyReference || ''}
          onChange={handleInputChange}
          placeholder="Référence de propriété"
        />
      </div>
    </div>
  );
};

export default GeneralInfoSection;
