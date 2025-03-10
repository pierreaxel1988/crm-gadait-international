
import React from 'react';
import { LeadDetailed, PropertyType, ViewType, Amenity, PurchaseTimeframe, FinancingMethod, PropertyUse } from '@/types/lead';
import FormSection from './FormSection';
import PropertyDetailsSection from './sections/PropertyDetailsSection';
import PurchaseDetailsSection from './sections/PurchaseDetailsSection';
import BuyerInfoSection from './sections/BuyerInfoSection';

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
      <div className="space-y-8">
        <PropertyDetailsSection
          formData={formData}
          handleInputChange={handleInputChange}
          handleNumberChange={handleNumberChange}
          handleMultiSelectToggle={handleMultiSelectToggle}
          propertyTypes={propertyTypes}
          viewTypes={viewTypes}
          amenities={amenities}
        />

        <PurchaseDetailsSection
          formData={formData}
          handleInputChange={handleInputChange}
          handleMultiSelectToggle={handleMultiSelectToggle}
          purchaseTimeframes={purchaseTimeframes}
          financingMethods={financingMethods}
          propertyUses={propertyUses}
        />

        <BuyerInfoSection
          formData={formData}
          handleInputChange={handleInputChange}
        />
      </div>
    </FormSection>
  );
};

export default SearchCriteriaSection;
