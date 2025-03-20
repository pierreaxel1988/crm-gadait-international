
import React from 'react';
import { LeadDetailed, Country, LeadSource } from '@/types/lead';
import FormSection from './FormSection';
import FormInput from './FormInput';
import { User, Mail, Phone, MapPin, Globe, Users, BarChart } from 'lucide-react';
import { COUNTRIES } from '@/utils/countries';
import { LOCATIONS_BY_COUNTRY } from '@/utils/locationsByCountry';

interface GeneralInfoSectionProps {
  formData: LeadDetailed;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  countries: Country[];
  sources: LeadSource[];
}

const GeneralInfoSection = ({ 
  formData, 
  handleInputChange,
  countries,
  sources
}: GeneralInfoSectionProps) => {
  // Filter countries to only include those we have location data for
  const availableCountries = countries.filter(country => 
    Object.keys(LOCATIONS_BY_COUNTRY).includes(country)
  );

  return (
    <FormSection title="Informations Générales">
      <div className="space-y-4">
        <FormInput
          label="Nom"
          name="name"
          value={formData.name || ''}
          onChange={handleInputChange}
          required
          icon={User}
          placeholder="Nom complet"
        />

        <FormInput
          label="Email"
          name="email"
          type="email"
          value={formData.email || ''}
          onChange={handleInputChange}
          icon={Mail}
          placeholder="Adresse email"
        />

        <FormInput
          label="Téléphone"
          name="phone"
          type="tel-with-code"
          value={formData.phone || ''}
          onChange={handleInputChange}
          icon={Phone}
          placeholder="Numéro de téléphone"
          countryCode={"+33"}
        />

        <FormInput
          label="Ville"
          name="location"
          value={formData.location || ''}
          onChange={handleInputChange}
          icon={MapPin}
          placeholder="Ville actuelle"
        />

        <FormInput
          label="Pays recherché"
          name="country"
          type="select"
          value={formData.country || ''}
          onChange={handleInputChange}
          icon={Globe}
          options={availableCountries.map(country => ({ value: country, label: country }))}
          placeholder="Pays de recherche"
        />

        <FormInput
          label="Nationalité"
          name="nationality"
          value={formData.nationality || ''}
          onChange={handleInputChange}
          icon={Users}
          placeholder="Nationalité du client"
        />

        <FormInput
          label="Source"
          name="source"
          type="select"
          value={formData.source || ''}
          onChange={handleInputChange}
          icon={BarChart}
          options={sources.map(source => ({ value: source, label: source }))}
          placeholder="Source du lead"
        />
      </div>
    </FormSection>
  );
};

export default GeneralInfoSection;
