
import React from 'react';
import { Banknote, MapPin, Building, Building2, Flag, HelpCircle } from 'lucide-react';
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
import FormField from './FormField';
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
      <FormField label={
        <span className="flex items-center">
          <Banknote className="h-4 w-4 mr-1" /> Budget
        </span>
      }>
        <input
          type="text"
          name="budget"
          value={formData.budget || ''}
          onChange={handleInputChange}
          className="luxury-input w-full"
          placeholder="ex: 1.500.000€ - 2.000.000€"
        />
      </FormField>

      <FormField label={
        <span className="flex items-center">
          <MapPin className="h-4 w-4 mr-1" /> Localisation souhaitée
        </span>
      }>
        <input
          type="text"
          name="desiredLocation"
          value={formData.desiredLocation || ''}
          onChange={handleInputChange}
          className="luxury-input w-full"
        />
      </FormField>

      <FormField label={
        <span className="flex items-center">
          <Building className="h-4 w-4 mr-1" /> Type de bien
        </span>
      }>
        <select
          name="propertyType"
          value={formData.propertyType || ''}
          onChange={handleInputChange}
          className="luxury-input w-full"
        >
          <option value="">Sélectionner un type</option>
          {propertyTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </FormField>

      <FormField label={
        <span className="flex items-center">
          <Building2 className="h-4 w-4 mr-1" /> Surface habitable
        </span>
      }>
        <input
          type="text"
          name="livingArea"
          value={formData.livingArea || ''}
          onChange={handleInputChange}
          className="luxury-input w-full"
          placeholder="ex: 200-300m²"
        />
      </FormField>

      <FormField label="Nombre de chambres">
        <input
          type="number"
          name="bedrooms"
          value={formData.bedrooms || ''}
          onChange={handleNumberChange}
          className="luxury-input w-full"
          min="0"
        />
      </FormField>

      <FormField label="Vue souhaitée">
        <MultiSelectButtons
          options={viewTypes}
          selectedValues={formData.views}
          onToggle={(value) => handleMultiSelectToggle('views', value)}
        />
      </FormField>

      <FormField label="Prestations souhaitées">
        <MultiSelectButtons
          options={amenities}
          selectedValues={formData.amenities}
          onToggle={(value) => handleMultiSelectToggle('amenities', value)}
        />
      </FormField>

      <FormField label="Date d'achat souhaitée">
        <RadioSelectButtons
          options={purchaseTimeframes}
          selectedValue={formData.purchaseTimeframe}
          onSelect={(value) => formData.purchaseTimeframe = value}
        />
      </FormField>

      <FormField label="Mode de financement">
        <RadioSelectButtons
          options={financingMethods}
          selectedValue={formData.financingMethod}
          onSelect={(value) => formData.financingMethod = value}
        />
      </FormField>

      <FormField label="Type d'investissement">
        <RadioSelectButtons
          options={propertyUses}
          selectedValue={formData.propertyUse}
          onSelect={(value) => formData.propertyUse = value}
        />
      </FormField>

      <FormField label={
        <span className="flex items-center">
          <Flag className="h-4 w-4 mr-1" /> Nationalité
        </span>
      }>
        <input
          type="text"
          name="nationality"
          value={formData.nationality || ''}
          onChange={handleInputChange}
          className="luxury-input w-full"
        />
      </FormField>

      <FormField label={
        <span className="flex items-center">
          <Flag className="h-4 w-4 mr-1" /> Résidence fiscale
        </span>
      }>
        <input
          type="text"
          name="taxResidence"
          value={formData.taxResidence || ''}
          onChange={handleInputChange}
          className="luxury-input w-full"
        />
      </FormField>

      <FormField label={
        <span className="flex items-center">
          <HelpCircle className="h-4 w-4 mr-1" /> Notes
        </span>
      }>
        <textarea
          name="notes"
          value={formData.notes || ''}
          onChange={handleInputChange}
          className="luxury-input w-full min-h-[100px]"
        />
      </FormField>
    </FormSection>
  );
};

export default SearchCriteriaSection;
