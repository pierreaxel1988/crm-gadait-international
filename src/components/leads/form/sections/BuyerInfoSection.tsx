
import React from 'react';
import { Flag, Map, HelpCircle } from 'lucide-react';
import { LeadDetailed } from '@/types/lead';
import FormInput from '../FormInput';

interface BuyerInfoSectionProps {
  formData: LeadDetailed;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

const BuyerInfoSection = ({
  formData,
  handleInputChange,
}: BuyerInfoSectionProps) => {
  return (
    <div className="space-y-4">
      <FormInput
        label="Nationalité"
        name="nationality"
        value={formData.nationality || ''}
        onChange={handleInputChange}
        icon={Flag}
      />

      <FormInput
        label="Résidence fiscale"
        name="taxResidence"
        value={formData.taxResidence || ''}
        onChange={handleInputChange}
        icon={Map}
      />

      <FormInput
        label="Notes"
        name="notes"
        type="textarea"
        value={formData.notes || ''}
        onChange={handleInputChange}
        icon={HelpCircle}
      />
    </div>
  );
};

export default BuyerInfoSection;
