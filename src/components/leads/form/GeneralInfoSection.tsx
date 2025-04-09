
import React from 'react';
import { LeadDetailed, LeadSource, Country } from '@/types/lead';
import FormInput from './FormInput';
import { deriveNationalityFromCountry } from '@/components/chat/utils/nationalityUtils';
import { countryToFlag } from '@/utils/countryUtils';

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

// Codes pays les plus courants
const COMMON_COUNTRY_CODES = [
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+1', country: 'United States/Canada', flag: '🇺🇸' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
  { code: '+34', country: 'Spain', flag: '🇪🇸' },
  { code: '+39', country: 'Italy', flag: '🇮🇹' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+41', country: 'Switzerland', flag: '🇨🇭' },
  { code: '+32', country: 'Belgium', flag: '🇧🇪' },
  { code: '+31', country: 'Netherlands', flag: '🇳🇱' },
  { code: '+351', country: 'Portugal', flag: '🇵🇹' },
  { code: '+212', country: 'Morocco', flag: '🇲🇦' },
  { code: '+971', country: 'United Arab Emirates', flag: '🇦🇪' },
  { code: '+230', country: 'Mauritius', flag: '🇲🇺' },
  { code: '+248', country: 'Seychelles', flag: '🇸🇨' },
];

const GeneralInfoSection: React.FC<GeneralInfoSectionProps> = ({
  formData,
  handleInputChange,
  countries,
  sources
}) => {
  // Handle tax residence country change
  const handleTaxResidenceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    handleInputChange(e);
    
    // If nationality is empty, try to derive it from tax residence
    if (!formData.nationality) {
      const selectedCountry = e.target.value;
      const nationality = deriveNationalityFromCountry(selectedCountry);
      
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

  // Prepare country options with flags
  const countryOptions = countries.map(country => ({
    value: country,
    label: (
      <div className="flex items-center gap-2">
        <span className="text-lg">{countryToFlag(country)}</span>
        <span>{country}</span>
      </div>
    ),
    textLabel: country // For search functionality
  }));

  // Prepare nationality options with flags
  const nationalityOptions = countries.map(country => {
    const nationality = deriveNationalityFromCountry(country) || country;
    return {
      value: nationality,
      label: (
        <div className="flex items-center gap-2">
          <span className="text-lg">{countryToFlag(country)}</span>
          <span>{nationality}</span>
        </div>
      ),
      textLabel: nationality // For search functionality
    };
  });

  // Préparer les options de code pays avec drapeaux
  const countryCodeOptions = COMMON_COUNTRY_CODES.map(({ code, country, flag }) => ({
    value: code,
    label: (
      <div className="flex items-center gap-2">
        <span className="text-lg">{flag}</span>
        <span>{country}</span>
        <span className="text-gray-500 ml-auto">{code}</span>
      </div>
    ),
    textLabel: `${country} ${code}`
  }));

  // Définir l'affichage du code pays sélectionné
  const getCountryCodeDisplay = (code: string) => {
    const countryCode = COMMON_COUNTRY_CODES.find(cc => cc.code === code);
    return countryCode ? countryCode.flag : '🌍';
  };

  // Gérer le changement de code pays
  const handleCountryCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    
    // Mettre à jour le code pays
    const codeEvent = {
      target: {
        name: 'phoneCountryCode',
        value: code
      }
    } as React.ChangeEvent<HTMLInputElement>;
    handleInputChange(codeEvent);
    
    // Mettre à jour l'affichage du code pays (drapeau)
    const displayEvent = {
      target: {
        name: 'phoneCountryCodeDisplay',
        value: getCountryCodeDisplay(code)
      }
    } as React.ChangeEvent<HTMLInputElement>;
    handleInputChange(displayEvent);
  };

  return (
    <div className="space-y-4 overflow-y-auto pb-6">
      <h2 className="text-sm font-futura uppercase tracking-wider text-gray-800 pb-2 border-b mb-4">Information Générale</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Titre"
          name="salutation"
          type="select"
          value={formData.salutation || ''}
          onChange={handleInputChange}
          options={[
            { value: 'M.', label: 'Monsieur' },
            { value: 'Mme', label: 'Madame' },
          ]}
          placeholder="Sélectionner un titre"
        />
        
        <FormInput
          label="Nom"
          name="name"
          required
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Nom complet"
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
        
        <div className="space-y-2">
          <FormInput
            label="Code pays"
            name="phoneCountryCode"
            type="select"
            value={formData.phoneCountryCode || '+33'}
            onChange={handleCountryCodeChange}
            options={countryCodeOptions}
            placeholder="Sélectionner un code pays"
            searchable
            searchByLabel
          />
          
          <FormInput
            label="Téléphone"
            name="phone"
            type="tel"
            value={formData.phone || ''}
            onChange={handleInputChange}
            placeholder="Numéro de téléphone"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Pays de résidence"
          name="taxResidence"
          type="select"
          value={formData.taxResidence || ''}
          onChange={handleTaxResidenceChange}
          options={countryOptions}
          placeholder="Sélectionner un pays"
          searchable
          searchByLabel
        />
        
        <FormInput
          label="Nationalité"
          name="nationality"
          type="select"
          value={formData.nationality || ''}
          onChange={handleInputChange}
          options={nationalityOptions}
          placeholder="Sélectionner une nationalité"
          searchable
          searchByLabel
        />
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
          label="Lien de l'annonce vu"
          name="url"
          value={formData.url || ''}
          onChange={handleInputChange}
          placeholder="URL de l'annonce immobilière"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Source"
          name="source"
          type="select"
          value={formData.source || ''}
          onChange={handleInputChange}
          options={sources.map(source => ({ value: source, label: source }))}
          placeholder="Sélectionner une source"
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
