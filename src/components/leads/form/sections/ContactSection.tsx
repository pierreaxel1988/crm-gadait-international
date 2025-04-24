
import React from 'react';
import { LeadDetailed } from '@/types/lead';
import FormSection from '../FormSection';
import FormInput from '../FormInput';
import { AtSign, Phone, MapPin, Globe } from 'lucide-react';
import { COUNTRIES } from '@/utils/countries';

interface ContactSectionProps {
  formData: LeadDetailed;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

const ContactSection: React.FC<ContactSectionProps> = ({
  formData,
  handleInputChange
}) => {
  return (
    <FormSection title="Informations de contact">
      <FormInput
        label="Email"
        name="email"
        type="email"
        value={formData.email || ''}
        onChange={handleInputChange}
        icon={AtSign}
        placeholder="email@exemple.com"
      />

      <FormInput
        label="Téléphone"
        name="phone"
        type="tel"
        value={formData.phone || ''}
        onChange={handleInputChange}
        icon={Phone}
        placeholder="+33 6 12 34 56 78"
      />

      <FormInput
        label="Pays"
        name="country"
        type="select"
        value={formData.country || ''}
        onChange={handleInputChange}
        icon={Globe}
        options={COUNTRIES.map(country => ({ value: country, label: country }))}
        placeholder="Sélectionner un pays"
      />

      <FormInput
        label="Localisation"
        name="location"
        type="text"
        value={formData.location || ''}
        onChange={handleInputChange}
        icon={MapPin}
        placeholder="Ville, région, etc."
      />
    </FormSection>
  );
};

export default ContactSection;
