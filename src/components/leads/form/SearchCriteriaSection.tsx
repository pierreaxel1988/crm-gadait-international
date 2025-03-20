
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
  onExtractUrl?: (url: string) => void;
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
  propertyUses,
  onExtractUrl
}: SearchCriteriaSectionProps) => {
  return (
    <FormSection title="Critères de Recherche">
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-medium mb-4 text-loro-hazel">Détails du bien</h3>
          <PropertyDetailsSection
            formData={formData}
            handleInputChange={handleInputChange}
            handleNumberChange={handleNumberChange}
            handleMultiSelectToggle={handleMultiSelectToggle}
            propertyTypes={propertyTypes}
            viewTypes={viewTypes}
            amenities={amenities}
            onExtractUrl={onExtractUrl || (() => {})}
          />
        </div>

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
