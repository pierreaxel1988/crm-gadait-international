
import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Globe, Flag, Map } from 'lucide-react';
import { LeadDetailed, Country } from '@/types/lead';
import FormSection from './FormSection';
import FormInput from './FormInput';
import { COUNTRIES } from '@/utils/countries';
import { deriveNationalityFromCountry } from '@/components/chat/utils/nationalityUtils';

interface GeneralInfoSectionProps {
  formData: LeadDetailed;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  countries: Country[];
}

const GeneralInfoSection = ({ 
  formData, 
  handleInputChange,
  countries 
}: GeneralInfoSectionProps) => {
  const [countryCode, setCountryCode] = useState("+33");
  
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Strip any country code that might be in the input
    const phoneValue = e.target.value.replace(/^\+\d+\s*/, '');
    
    // Create a new event with the same properties but modified value
    const newEvent = {
      ...e,
      target: {
        ...e.target,
        name: 'phone',
        value: phoneValue
      }
    };
    
    handleInputChange(newEvent);
  };
  
  const handleCountryCodeChange = (value: string) => {
    setCountryCode(value);
  };
  
  const handleNationalityCountryChange = (value: string) => {
    const nationality = deriveNationalityFromCountry(value);
    
    // Create synthetic event for nationality field
    const syntheticEvent = {
      target: {
        name: 'nationality',
        value: nationality || value
      }
    } as React.ChangeEvent<HTMLSelectElement>;
    
    handleInputChange(syntheticEvent);
  };

  return (
    <FormSection title="Informations Générales">
      <FormInput
        label="Nom complet"
        name="name"
        value={formData.name}
        onChange={handleInputChange}
        required
        icon={User}
      />

      <FormInput
        label="Adresse email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleInputChange}
        required
        icon={Mail}
      />

      <FormInput
        label="Numéro de téléphone"
        name="phone"
        type="tel-with-code"
        value={formData.phone || ''}
        onChange={handlePhoneChange}
        icon={Phone}
        countryCode={countryCode}
        onCountryCodeChange={handleCountryCodeChange}
      />

      <FormInput
        label="Pays d'origine"
        name="country"
        type="select"
        value={formData.country || ''}
        onChange={handleInputChange}
        icon={Globe}
        options={COUNTRIES.map(country => ({ value: country, label: country }))}
        placeholder="Sélectionner un pays d'origine"
      />

      <FormInput
        label="Nationalité"
        name="nationality"
        type="select"
        value={formData.nationality || ''}
        onChange={handleInputChange}
        onCustomChange={handleNationalityCountryChange}
        icon={Flag}
        options={COUNTRIES.map(country => ({ 
          value: deriveNationalityFromCountry(country) || country,
          label: deriveNationalityFromCountry(country) || country 
        }))}
        placeholder="Sélectionner une nationalité"
      />

      <FormInput
        label="Résidence fiscale"
        name="taxResidence"
        type="select"
        value={formData.taxResidence || ''}
        onChange={handleInputChange}
        icon={Map}
        options={COUNTRIES.map(country => ({ value: country, label: country }))}
        placeholder="Sélectionner une résidence fiscale"
      />
    </FormSection>
  );
};

export default GeneralInfoSection;
