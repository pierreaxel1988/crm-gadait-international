import React, { useState, useEffect, useRef } from 'react';
import FormInput from './FormInput';
import { LeadDetailed, LeadSource, Country } from '@/types/lead';
import { countryToFlag } from '@/utils/countryUtils';
import { deriveNationalityFromCountry } from '@/components/chat/utils/nationalityUtils';
import { ChevronDown } from 'lucide-react';
import CountrySelector from './selectors/CountrySelector';
import NationalitySelector from './selectors/NationalitySelector';

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
  const [isCountrySelectorOpen, setIsCountrySelectorOpen] = useState(false);
  const [isNationalitySelectorOpen, setIsNationalitySelectorOpen] = useState(false);

  const handleTaxResidenceSelect = (country: string) => {
    const event = {
      target: {
        name: 'taxResidence',
        value: country
      }
    } as React.ChangeEvent<HTMLInputElement>;
    handleInputChange(event);

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
  };

  return (
    <>
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
          <div className="space-y-2">
            <label htmlFor="taxResidence" className="block text-sm font-medium">
              Pays de résidence
            </label>
            <div 
              className="flex items-center justify-between px-3 py-2 h-10 w-full border border-input rounded-md bg-background text-sm cursor-pointer hover:bg-accent transition-colors"
              onClick={() => setIsCountrySelectorOpen(true)}
            >
              {formData.taxResidence ? (
                <div className="flex items-center gap-2">
                  <span className="text-lg">{countryToFlag(formData.taxResidence)}</span>
                  <span className="font-futura">{formData.taxResidence}</span>
                </div>
              ) : (
                <span className="text-muted-foreground font-futura">Sélectionner un pays</span>
              )}
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="nationality" className="block text-sm font-medium">
              Nationalité
            </label>
            <div 
              className="flex items-center justify-between px-3 py-2 h-10 w-full border border-input rounded-md bg-background text-sm cursor-pointer hover:bg-accent transition-colors"
              onClick={() => setIsNationalitySelectorOpen(true)}
            >
              {formData.nationality ? (
                <div className="flex items-center gap-2">
                  <span className="text-lg">{countryToFlag(formData.nationality)}</span>
                  <span className="font-futura">{formData.nationality}</span>
                </div>
              ) : (
                <span className="text-muted-foreground font-futura">Sélectionner une nationalité</span>
              )}
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
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

      {/* Full-screen selectors */}
      <CountrySelector
        isOpen={isCountrySelectorOpen}
        onClose={() => setIsCountrySelectorOpen(false)}
        onSelect={handleTaxResidenceSelect}
        selectedCountry={formData.taxResidence}
        title="Sélectionner un pays de résidence"
        searchPlaceholder="Rechercher un pays..."
      />

      <NationalitySelector
        isOpen={isNationalitySelectorOpen}
        onClose={() => setIsNationalitySelectorOpen(false)}
        onSelect={handleNationalitySelect}
        selectedNationality={formData.nationality}
        title="Sélectionner une nationalité"
        searchPlaceholder="Rechercher une nationalité..."
      />
    </>
  );
};

export default GeneralInfoSection;
