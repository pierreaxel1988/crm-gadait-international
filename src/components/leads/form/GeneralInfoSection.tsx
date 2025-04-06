
import React from 'react';
import { LeadDetailed, LeadSource, Country } from '@/types/lead';
import FormInput from './FormInput';
import { deriveNationalityFromCountry } from '@/components/chat/utils/nationalityUtils';

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
        
        <FormInput
          label="Téléphone"
          name="phone"
          type="tel-with-code"
          value={formData.phone || ''}
          onChange={handleInputChange}
          placeholder="Numéro de téléphone"
          countryCode={formData.phoneCountryCode || '+33'}
          countryCodeDisplay={formData.phoneCountryCodeDisplay || '🇫🇷'}
          onCountryCodeChange={(code) => {
            const e = {
              target: {
                name: 'phoneCountryCode',
                value: code
              }
            } as React.ChangeEvent<HTMLInputElement>;
            handleInputChange(e);
            
            // Get flag emoji for the country code
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
            
            const flagEmoji = codeToCountry[code] || '🌍';
            
            const eFlag = {
              target: {
                name: 'phoneCountryCodeDisplay',
                value: flagEmoji
              }
            } as React.ChangeEvent<HTMLInputElement>;
            handleInputChange(eFlag);
          }}
          searchable
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Pays de résidence"
          name="taxResidence"
          type="select"
          value={formData.taxResidence || ''}
          onChange={handleTaxResidenceChange}
          options={countries.map(country => ({ value: country, label: country }))}
          placeholder="Sélectionner un pays"
          searchable
        />
        
        <FormInput
          label="Nationalité"
          name="nationality"
          type="select"
          value={formData.nationality || ''}
          onChange={handleInputChange}
          options={countries.map(country => {
            const nationality = deriveNationalityFromCountry(country);
            return { 
              value: nationality || country, 
              label: nationality || country 
            };
          })}
          placeholder="Sélectionner une nationalité"
          searchable
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
