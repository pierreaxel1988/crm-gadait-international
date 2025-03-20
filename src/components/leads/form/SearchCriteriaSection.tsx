
import React from 'react';
import { LeadDetailed, PropertyType, ViewType, Amenity, PurchaseTimeframe, FinancingMethod, PropertyUse, Country } from '@/types/lead';
import FormSection from './FormSection';
import PropertyDetailsSection from './sections/PropertyDetailsSection';
import PurchaseDetailsSection from './sections/PurchaseDetailsSection';
import BuyerInfoSection from './sections/BuyerInfoSection';
import { deriveNationalityFromCountry } from '@/components/chat/utils/nationalityUtils';

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
  countries: Country[];
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
  onExtractUrl,
  countries
}: SearchCriteriaSectionProps) => {
  // Handle nationality auto-completion when country changes
  const handleCountryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    handleInputChange(e);
    
    // If nationality is empty, try to derive it from country
    if (!formData.nationality) {
      const selectedCountry = e.target.value;
      const nationality = deriveNationalityFromCountry(selectedCountry);
      
      if (nationality) {
        const nationalityEvent = {
          target: {
            name: 'nationality',
            value: nationality
          }
        } as React.ChangeEvent<HTMLInputElement>;
        
        handleInputChange(nationalityEvent);
      }
    }
  };
  
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
          onExtractUrl={onExtractUrl || (() => {})}
          countries={countries}
          handleCountryChange={handleCountryChange}
        />

        <div>
          <h3 className="text-lg font-medium mb-4 text-loro-hazel">Conditions d'achat</h3>
          <PurchaseDetailsSection
            formData={formData}
            handleInputChange={handleInputChange}
            handleMultiSelectToggle={handleMultiSelectToggle}
            purchaseTimeframes={purchaseTimeframes}
            financingMethods={financingMethods}
            propertyUses={propertyUses}
          />
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4 text-loro-hazel">Informations sur l'acheteur</h3>
          <BuyerInfoSection
            formData={formData}
            handleInputChange={handleInputChange}
          />
        </div>
      </div>
    </FormSection>
  );
};

export default SearchCriteriaSection;
