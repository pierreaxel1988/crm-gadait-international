import React from 'react';
import { LeadDetailed, PropertyType, ViewType, Amenity, PurchaseTimeframe, FinancingMethod, PropertyUse, Country, MauritiusRegion } from '@/types/lead';
import FormSection from './FormSection';
import PropertyDetailsSection from './sections/PropertyDetailsSection';
import PurchaseDetailsSection from './sections/PurchaseDetailsSection';
import BuyerInfoSection from './sections/BuyerInfoSection';
import { deriveNationalityFromCountry } from '@/components/chat/utils/nationalityUtils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import MultiSelectButtons from '../../leads/form/MultiSelectButtons';

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
  extractLoading?: boolean;
  countries: Country[];
  handleCountryChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

const MAURITIUS_REGIONS: MauritiusRegion[] = ['North', 'South', 'West', 'East'];

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
  extractLoading = false,
  countries,
  handleCountryChange
}: SearchCriteriaSectionProps) => {
  const handleCountryChangeWithNationality = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    handleCountryChange(e);
    
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
      <ScrollArea className="h-[calc(100vh-350px)] pr-4">
        <div className="space-y-6">
          <Tabs defaultValue="property" className="w-full">
            <TabsList className="w-full mb-4 grid grid-cols-3">
              <TabsTrigger value="property">Propriété</TabsTrigger>
              <TabsTrigger value="purchase">Achat</TabsTrigger>
              <TabsTrigger value="buyer">Acheteur</TabsTrigger>
            </TabsList>
            
            <TabsContent value="property" className="space-y-6">
              <PropertyDetailsSection
                formData={formData}
                handleInputChange={handleInputChange}
                handleNumberChange={handleNumberChange}
                handleMultiSelectToggle={handleMultiSelectToggle}
                propertyTypes={propertyTypes}
                viewTypes={viewTypes}
                amenities={amenities}
                onExtractUrl={onExtractUrl}
                extractLoading={extractLoading}
                countries={countries}
                handleCountryChange={handleCountryChangeWithNationality}
              />
              {formData.country === 'Mauritius' && (
                <div className="space-y-2">
                  <Label className="text-sm">Régions souhaitées</Label>
                  <MultiSelectButtons 
                    options={MAURITIUS_REGIONS} 
                    selectedValues={formData.regions || []} 
                    onChange={(region) => handleMultiSelectToggle('regions', region as MauritiusRegion)}
                    className="w-full"
                  />
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="purchase" className="space-y-6 py-2">
              <PurchaseDetailsSection
                formData={formData}
                handleInputChange={handleInputChange}
                handleMultiSelectToggle={handleMultiSelectToggle}
                purchaseTimeframes={purchaseTimeframes}
                financingMethods={financingMethods}
                propertyUses={propertyUses}
              />
            </TabsContent>
            
            <TabsContent value="buyer" className="space-y-6 py-2">
              <BuyerInfoSection
                formData={formData}
                handleInputChange={handleInputChange}
              />
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </FormSection>
  );
};

export default SearchCriteriaSection;
