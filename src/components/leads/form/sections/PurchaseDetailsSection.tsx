
import React from 'react';
import { Banknote, MapPin, Timer, CreditCard, Home } from 'lucide-react';
import { LeadDetailed, PurchaseTimeframe, FinancingMethod, PropertyUse } from '@/types/lead';
import FormInput from '../FormInput';
import RadioSelectButtons from '../RadioSelectButtons';

interface PurchaseDetailsSectionProps {
  formData: LeadDetailed;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleMultiSelectToggle: <T extends string>(name: keyof LeadDetailed, value: T) => void;
  purchaseTimeframes: PurchaseTimeframe[];
  financingMethods: FinancingMethod[];
  propertyUses: PropertyUse[];
}

const PurchaseDetailsSection = ({
  formData,
  handleInputChange,
  handleMultiSelectToggle,
  purchaseTimeframes,
  financingMethods,
  propertyUses,
}: PurchaseDetailsSectionProps) => {
  return (
    <div className="space-y-4">
      <FormInput
        label="Budget"
        name="budget"
        value={formData.budget || ''}
        onChange={handleInputChange}
        placeholder="ex: 1.500.000€ - 2.000.000€"
        icon={Banknote}
      />

      <FormInput
        label="Localisation souhaitée"
        name="desiredLocation"
        value={formData.desiredLocation || ''}
        onChange={handleInputChange}
        icon={MapPin}
      />

      <FormInput
        label="Date d'achat souhaitée"
        name="purchaseTimeframe"
        value=""
        onChange={() => {}}
        icon={Timer}
        renderCustomField={() => (
          <RadioSelectButtons
            options={purchaseTimeframes}
            selectedValue={formData.purchaseTimeframe}
            onSelect={(value) => handleMultiSelectToggle('purchaseTimeframe', value)}
          />
        )}
      />

      <FormInput
        label="Mode de financement"
        name="financingMethod"
        value=""
        onChange={() => {}}
        icon={CreditCard}
        renderCustomField={() => (
          <RadioSelectButtons
            options={financingMethods}
            selectedValue={formData.financingMethod}
            onSelect={(value) => handleMultiSelectToggle('financingMethod', value)}
          />
        )}
      />

      <FormInput
        label="Type d'investissement"
        name="propertyUse"
        value=""
        onChange={() => {}}
        icon={Home}
        renderCustomField={() => (
          <RadioSelectButtons
            options={propertyUses}
            selectedValue={formData.propertyUse}
            onSelect={(value) => handleMultiSelectToggle('propertyUse', value)}
          />
        )}
      />
    </div>
  );
};

export default PurchaseDetailsSection;
