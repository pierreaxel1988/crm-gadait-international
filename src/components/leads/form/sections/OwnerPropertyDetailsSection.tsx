
import React from 'react';
import { LeadDetailed } from '@/types/lead';
import FormInput from '../FormInput';
import MultiSelectButtons from '../MultiSelectButtons';
import { Label } from '@/components/ui/label';
import BudgetFilter from '@/components/pipeline/filters/BudgetFilter';

interface OwnerPropertyDetailsSectionProps {
  formData: LeadDetailed;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleMultiSelectToggle: <T extends string>(name: keyof LeadDetailed, value: T) => void;
}

const OwnerPropertyDetailsSection = ({
  formData,
  handleInputChange,
  handleMultiSelectToggle
}: OwnerPropertyDetailsSectionProps) => {
  // Handle budget changes
  const handleBudgetChange = (type: 'min' | 'max', value: string) => {
    const fieldName = type === 'min' ? 'budgetMin' : 'budget';
    const syntheticEvent = {
      target: {
        name: fieldName,
        value: value
      }
    } as React.ChangeEvent<HTMLInputElement>;
    handleInputChange(syntheticEvent);
  };

  // Handle currency changes
  const handleCurrencyChange = (value: string) => {
    const syntheticEvent = {
      target: {
        name: 'currency',
        value
      }
    } as React.ChangeEvent<HTMLInputElement>;
    handleInputChange(syntheticEvent);
  };

  return (
    <div className="space-y-4">
      <FormInput
        label="Surface habitable (m²)"
        name="livingArea"
        value={formData.livingArea || ''}
        onChange={handleInputChange}
        placeholder="Surface habitable approximative"
      />

      <FormInput
        label="Surface du terrain (m²)"
        name="landArea"
        value={formData.landArea || ''}
        onChange={handleInputChange}
        placeholder="Surface du terrain"
      />

      <div className="space-y-2">
        <Label className="text-sm font-medium">Nombre de chambres</Label>
        <MultiSelectButtons
          options={["1", "2", "3", "4", "5", "6", "7", "8+"]}
          selectedValues={
            Array.isArray(formData.bedrooms)
              ? formData.bedrooms.map(num => num >= 8 ? "8+" : num.toString())
              : formData.bedrooms
              ? [formData.bedrooms >= 8 ? "8+" : formData.bedrooms.toString()]
              : []
          }
          onChange={(value) => {
            const numValue = value === "8+" ? 8 : parseInt(value);
            const currentBedrooms = Array.isArray(formData.bedrooms)
              ? [...formData.bedrooms]
              : formData.bedrooms
              ? [formData.bedrooms]
              : [];
            
            const newBedrooms = currentBedrooms.includes(numValue)
              ? currentBedrooms.filter(b => b !== numValue)
              : [...currentBedrooms, numValue];
            
            const syntheticEvent = {
              target: {
                name: 'bedrooms',
                value: newBedrooms.length ? newBedrooms : undefined
              }
            } as React.ChangeEvent<HTMLInputElement>;
            
            handleInputChange(syntheticEvent);
          }}
          specialOption="8+"
        />
      </div>

      <div className="pt-2">
        <Label className="text-sm font-medium mb-3">Prix souhaité</Label>
        <BudgetFilter
          minBudget={formData.budgetMin || ''}
          maxBudget={formData.budget || ''}
          onBudgetChange={handleBudgetChange}
          currency={formData.currency || 'EUR'}
          onCurrencyChange={handleCurrencyChange}
        />
      </div>

      <FormInput
        label="Année de construction"
        name="constructionYear"
        type="number"
        value={formData.constructionYear || ''}
        onChange={handleInputChange}
        placeholder="Année de construction"
      />

      <FormInput
        label="Travaux nécessaires"
        name="renovationNeeded"
        type="textarea"
        value={formData.renovationNeeded || ''}
        onChange={handleInputChange}
        placeholder="Description des travaux nécessaires"
      />
    </div>
  );
};

export default OwnerPropertyDetailsSection;
