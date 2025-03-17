
import React from 'react';
import { HelpCircle } from 'lucide-react';
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
