
import React from 'react';
import { User, Mail, Phone, MapPin, Tag, Clipboard, Globe } from 'lucide-react';
import { LeadDetailed, LeadSource, Country } from '@/types/lead';
import FormSection from './FormSection';
import FormInput from './FormInput';

interface GeneralInfoSectionProps {
  formData: LeadDetailed;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  leadSources: LeadSource[];
  countries: Country[];
}

const GeneralInfoSection = ({ 
  formData, 
  handleInputChange, 
  leadSources,
  countries 
}: GeneralInfoSectionProps) => {
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
        type="tel"
        value={formData.phone || ''}
        onChange={handleInputChange}
        icon={Phone}
      />

      <FormInput
        label="Localisation"
        name="location"
        value={formData.location || ''}
        onChange={handleInputChange}
        icon={MapPin}
      />

      <FormInput
        label="Source du lead"
        name="source"
        type="select"
        value={formData.source || ''}
        onChange={handleInputChange}
        icon={Tag}
        options={leadSources.map(source => ({ value: source, label: source }))}
        placeholder="Sélectionner une source"
      />

      <FormInput
        label="Référence du bien"
        name="propertyReference"
        value={formData.propertyReference || ''}
        onChange={handleInputChange}
        icon={Clipboard}
      />

      <FormInput
        label="Pays"
        name="country"
        type="select"
        value={formData.country || ''}
        onChange={handleInputChange}
        icon={Globe}
        options={countries.map(country => ({ value: country, label: country }))}
        placeholder="Sélectionner un pays"
      />
    </FormSection>
  );
};

export default GeneralInfoSection;
