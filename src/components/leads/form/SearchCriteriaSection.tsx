
import React from 'react';
import { 
  Banknote, MapPin, Building, Building2, Flag, HelpCircle, 
  Home, BedDouble, Eye, Package, Timer, CreditCard, Map 
} from 'lucide-react';
import { 
  LeadDetailed, 
  PropertyType, 
  ViewType, 
  Amenity, 
  PurchaseTimeframe, 
  FinancingMethod, 
  PropertyUse 
} from '@/types/lead';
import FormSection from './FormSection';
import FormInput from './FormInput';
import MultiSelectButtons from './MultiSelectButtons';
import RadioSelectButtons from './RadioSelectButtons';

interface SearchCriteriaSectionProps {
  formData: LeadDetailed;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleNumberChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleMultiSelectToggle: <T extends string>(name: keyof LeadDetailed, value: T) => void;
  propertyTypes: PropertyType[];
  viewTypes: ViewType[];
  amenities: Amenity[];
  purchaseTimeframes: PurchaseTimeframe[];
  financingMethods: FinancingMethod[];
  propertyUses: PropertyUse[];
}

const SearchCriteriaSection = ({
  formData,
  handleInputChange,
  handleNumberChange,
  handleMultiSelectToggle,
  propertyTypes,
  viewTypes,
  amenities,
  purchaseTimeframes,
  financingMethods,
  propertyUses
}: SearchCriteriaSectionProps) => {
  return (
    <FormSection title="Critères de Recherche">
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
        label="Type de bien"
        name="propertyType"
        type="select"
        value={formData.propertyType || ''}
        onChange={handleInputChange}
        icon={Building}
        options={propertyTypes.map(type => ({ value: type, label: type }))}
        placeholder="Sélectionner un type"
      />

      <FormInput
        label="Surface habitable"
        name="livingArea"
        value={formData.livingArea || ''}
        onChange={handleInputChange}
        placeholder="ex: 200-300m²"
        icon={Building2}
      />

      <FormInput
        label="Nombre de chambres"
        name="bedrooms"
        type="number"
        value={formData.bedrooms || ''}
        onChange={handleNumberChange}
        min={0}
        icon={BedDouble}
      />

      <FormInput
        label="Vue souhaitée"
        name="views"
        value=""
        onChange={() => {}}
        icon={Eye}
        renderCustomField={() => (
          <MultiSelectButtons
            options={viewTypes}
            selectedValues={formData.views}
            onToggle={(value) => handleMultiSelectToggle('views', value)}
          />
        )}
      />

      <FormInput
        label="Prestations souhaitées"
        name="amenities"
        value=""
        onChange={() => {}}
        icon={Package}
        renderCustomField={() => (
          <MultiSelectButtons
            options={amenities}
            selectedValues={formData.amenities}
            onToggle={(value) => handleMultiSelectToggle('amenities', value)}
          />
        )}
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
    </FormSection>
  );
};

export default SearchCriteriaSection;
