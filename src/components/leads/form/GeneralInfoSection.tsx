
import React from 'react';
import { User, Mail, Phone, MapPin, Tag, Clipboard, Globe } from 'lucide-react';
import { LeadDetailed, LeadSource, Country } from '@/types/lead';
import FormSection from './FormSection';
import FormField from './FormField';

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
      <FormField label={
        <span className="flex items-center">
          <User className="h-4 w-4 mr-1" /> Nom complet*
        </span>
      }>
        <input
          type="text"
          name="name"
          required
          value={formData.name}
          onChange={handleInputChange}
          className="luxury-input w-full"
        />
      </FormField>

      <FormField label={
        <span className="flex items-center">
          <Mail className="h-4 w-4 mr-1" /> Adresse email*
        </span>
      }>
        <input
          type="email"
          name="email"
          required
          value={formData.email}
          onChange={handleInputChange}
          className="luxury-input w-full"
        />
      </FormField>

      <FormField label={
        <span className="flex items-center">
          <Phone className="h-4 w-4 mr-1" /> Numéro de téléphone
        </span>
      }>
        <input
          type="tel"
          name="phone"
          value={formData.phone || ''}
          onChange={handleInputChange}
          className="luxury-input w-full"
        />
      </FormField>

      <FormField label={
        <span className="flex items-center">
          <MapPin className="h-4 w-4 mr-1" /> Localisation
        </span>
      }>
        <input
          type="text"
          name="location"
          value={formData.location || ''}
          onChange={handleInputChange}
          className="luxury-input w-full"
        />
      </FormField>

      <FormField label={
        <span className="flex items-center">
          <Tag className="h-4 w-4 mr-1" /> Source du lead
        </span>
      }>
        <select
          name="source"
          value={formData.source || ''}
          onChange={handleInputChange}
          className="luxury-input w-full"
        >
          <option value="">Sélectionner une source</option>
          {leadSources.map(source => (
            <option key={source} value={source}>{source}</option>
          ))}
        </select>
      </FormField>

      <FormField label={
        <span className="flex items-center">
          <Clipboard className="h-4 w-4 mr-1" /> Référence du bien
        </span>
      }>
        <input
          type="text"
          name="propertyReference"
          value={formData.propertyReference || ''}
          onChange={handleInputChange}
          className="luxury-input w-full"
        />
      </FormField>

      <FormField label={
        <span className="flex items-center">
          <Globe className="h-4 w-4 mr-1" /> Pays
        </span>
      }>
        <select
          name="country"
          value={formData.country || ''}
          onChange={handleInputChange}
          className="luxury-input w-full"
        >
          <option value="">Sélectionner un pays</option>
          {countries.map(country => (
            <option key={country} value={country}>{country}</option>
          ))}
        </select>
      </FormField>
    </FormSection>
  );
};

export default GeneralInfoSection;
