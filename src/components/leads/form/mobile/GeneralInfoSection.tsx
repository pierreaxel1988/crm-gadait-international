
import React, { useState, useEffect } from 'react';
import { LeadDetailed, LeadSource, Country } from '@/types/lead';
import FormInput from '../FormInput';

interface MobileGeneralInfoSectionProps {
  lead: LeadDetailed;
  onDataChange: (data: Partial<LeadDetailed>) => void;
  countries?: Country[];
  sources?: LeadSource[];
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

// Default source options for when no sources are provided
const DEFAULT_SOURCES: LeadSource[] = [
  "Site web", 
  "Réseaux sociaux", 
  "Portails immobiliers", 
  "Network", 
  "Repeaters", 
  "Recommandations",
  "Apporteur d'affaire",
  "Idealista",
  "Le Figaro",
  "Properstar",
  "Property Cloud",
  "L'express Property",
  "James Edition",
  "Annonce",
  "Email",
  "Téléphone",
  "Autre",
  "Recommendation"
];

const MobileGeneralInfoSection: React.FC<MobileGeneralInfoSectionProps> = ({
  lead,
  onDataChange,
  countries = [],
  sources = DEFAULT_SOURCES
}) => {
  const [headerHeight, setHeaderHeight] = useState<number>(0);
  const [isHeaderMeasured, setIsHeaderMeasured] = useState(false);
  
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onDataChange({ [name]: value });
  };

  const dynamicTopMargin = isHeaderMeasured 
    ? `${Math.max(headerHeight + 8, 32)}px` 
    : 'calc(32px + 4rem)';

  return (
    <div 
      className="space-y-3 pt-4" 
      style={{ marginTop: dynamicTopMargin }}
    >
      <h2 className="text-sm font-futura uppercase tracking-wider text-gray-800 pb-2 border-b mb-4">Information Générale</h2>
      
      <FormInput
        label="Titre"
        name="salutation"
        type="select"
        value={lead.salutation || ''}
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
        value={lead.name}
        onChange={handleInputChange}
        placeholder="Nom complet"
      />

      <FormInput
        label="Email"
        name="email"
        type="email"
        value={lead.email || ''}
        onChange={handleInputChange}
        placeholder="Adresse email"
      />
      
      <FormInput
        label="Téléphone"
        name="phone"
        value={lead.phone || ''}
        onChange={handleInputChange}
        placeholder="Numéro de téléphone"
      />
      
      <FormInput
        label="Nationalité"
        name="nationality"
        value={lead.nationality || ''}
        onChange={handleInputChange}
        placeholder="Nationalité"
      />
      
      <FormInput
        label="Langue préférée"
        name="preferredLanguage"
        type="select"
        value={lead.preferredLanguage || ''}
        onChange={handleInputChange}
        options={LANGUAGE_OPTIONS}
        placeholder="Sélectionner une langue"
      />
      
      <FormInput
        label="Lien de l'annonce vu"
        name="url"
        value={lead.url || ''}
        onChange={handleInputChange}
        placeholder="URL de l'annonce immobilière"
      />
      
      <FormInput
        label="Source"
        name="source"
        type="select"
        value={lead.source || ''}
        onChange={handleInputChange}
        options={sources.map(source => ({ value: source, label: source }))}
        placeholder="Sélectionner une source"
      />
      
      <FormInput
        label="Référence de propriété"
        name="propertyReference"
        value={lead.propertyReference || ''}
        onChange={handleInputChange}
        placeholder="Référence de propriété"
      />
    </div>
  );
};

export default MobileGeneralInfoSection;
