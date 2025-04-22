import React from 'react';
import { LeadDetailed } from '@/types/lead';
import FormInput from '../FormInput';
import MultiSelectButtons from '../MultiSelectButtons';
import { Label } from '@/components/ui/label';
import BudgetFilter from '@/components/pipeline/filters/BudgetFilter';
import CustomTagInput from '../CustomTagInput';
import { Textarea } from '@/components/ui/textarea';

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

  // Handle array fields changes
  const handleArrayFieldChange = (fieldName: keyof LeadDetailed, newValues: string[]) => {
    const syntheticEvent = {
      target: {
        name: fieldName,
        value: newValues
      }
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    handleInputChange(syntheticEvent);
  };

  const handleBedroomChange = (value: string) => {
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
        value: newBedrooms
      }
    } as unknown as React.ChangeEvent<HTMLInputElement>;
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
        <h4 className="text-sm font-medium mb-3">Nombre de chambres</h4>
        <MultiSelectButtons
          options={["1", "2", "3", "4", "5", "6", "7", "8+"]}
          selectedValues={
            Array.isArray(formData.bedrooms)
              ? formData.bedrooms.map(num => num >= 8 ? "8+" : num.toString())
              : formData.bedrooms
              ? [formData.bedrooms >= 8 ? "8+" : formData.bedrooms.toString()]
              : []
          }
          onChange={handleBedroomChange}
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
        label="Nombre de places de parking"
        name="parkingSpaces"
        type="number"
        value={formData.parkingSpaces?.toString() || ''}
        onChange={handleInputChange}
        placeholder="Nombre de places"
      />

      <FormInput
        label="Nombre d'étages"
        name="floors"
        type="number"
        value={formData.floors?.toString() || ''}
        onChange={handleInputChange}
        placeholder="Nombre d'étages"
      />

      <div className="space-y-2">
        <Label className="text-sm font-medium">Orientation</Label>
        <MultiSelectButtons
          options={["Nord", "Sud", "Est", "Ouest"]}
          selectedValues={formData.orientation || []}
          onChange={(value) => handleMultiSelectToggle('orientation', value)}
        />
      </div>

      <FormInput
        label="Classe énergétique"
        name="energyClass"
        value={formData.energyClass || ''}
        onChange={handleInputChange}
        placeholder="Ex: A, B, C..."
      />

      <FormInput
        label="Taxes annuelles"
        name="yearlyTaxes"
        value={formData.yearlyTaxes || ''}
        onChange={handleInputChange}
        placeholder="Montant des taxes annuelles"
      />

      <div className="space-y-2">
        <Label className="text-sm font-medium">Description du bien</Label>
        <Textarea
          name="propertyDescription"
          value={formData.propertyDescription || ''}
          onChange={handleInputChange}
          placeholder="Description détaillée du bien"
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Points forts du bien</Label>
        <CustomTagInput
          tags={formData.keyFeatures || []}
          onChange={(newTags) => handleArrayFieldChange('keyFeatures', newTags)}
          placeholder="Ajouter un point fort..."
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Équipements</Label>
        <CustomTagInput
          tags={formData.amenities || []}
          onChange={(newTags) => handleArrayFieldChange('amenities', newTags)}
          placeholder="Ajouter un équipement..."
        />
      </div>

      <FormInput
        label="Frais de syndic"
        name="condoFees"
        value={formData.condoFees || ''}
        onChange={handleInputChange}
        placeholder="Montant des frais de syndic"
      />

      <div className="space-y-2">
        <Label className="text-sm font-medium">Facilités</Label>
        <CustomTagInput
          tags={formData.facilities || []}
          onChange={(newTags) => handleArrayFieldChange('facilities', newTags)}
          placeholder="Ajouter une facilité..."
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Travaux nécessaires</Label>
        <Textarea
          name="renovationNeeded"
          value={formData.renovationNeeded || ''}
          onChange={handleInputChange}
          placeholder="Description des travaux nécessaires"
          className="min-h-[100px]"
        />
      </div>
    </div>
  );
};

export default OwnerPropertyDetailsSection;
