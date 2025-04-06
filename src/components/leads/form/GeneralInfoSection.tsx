
import React from 'react';
import { LeadDetailed, LeadSource, Country } from '@/types/lead';
import FormInput from './FormInput';

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
          value={formData.phone || ''}
          onChange={handleInputChange}
          placeholder="Numéro de téléphone"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Nationalité"
          name="nationality"
          value={formData.nationality || ''}
          onChange={handleInputChange}
          placeholder="Nationalité"
        />
        
        <FormInput
          label="Langue préférée"
          name="preferredLanguage"
          type="select"
          value={formData.preferredLanguage || ''}
          onChange={handleInputChange}
          options={LANGUAGE_OPTIONS}
          placeholder="Sélectionner une langue"
        />
      </div>

      <FormInput
        label="Lien de l'annonce vu"
        name="url"
        value={formData.url || ''}
        onChange={handleInputChange}
        placeholder="URL de l'annonce immobilière"
      />
      
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
