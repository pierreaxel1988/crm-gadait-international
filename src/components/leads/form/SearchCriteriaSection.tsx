import React from 'react';
import { LeadDetailed, PropertyType, ViewType, Amenity, PurchaseTimeframe, FinancingMethod, PropertyUse, Country, MauritiusRegion } from '@/types/lead';
import FormSection from './FormSection';
import PropertyDetailsSection from './sections/PropertyDetailsSection';
import PurchaseDetailsSection from './sections/PurchaseDetailsSection';
import BuyerInfoSection from './sections/BuyerInfoSection';
import { deriveNationalityFromCountry } from '@/components/chat/utils/nationalityUtils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import MultiSelectButtons from '../../leads/form/MultiSelectButtons';
import { MapPin } from 'lucide-react';

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
                formData={{
                  propertyTypes: formData.propertyTypes as PropertyType[],
                  views: formData.views as ViewType[],
                  amenities: formData.amenities as Amenity[],
                  country: formData.country,
                  desiredLocation: formData.desiredLocation,
                  url: formData.url,
                  livingArea: formData.livingArea,
                  landArea: formData.landArea
                }}
                handleInputChange={handleInputChange}
                handleMultiSelectToggle={(name, value) => {
                  handleMultiSelectToggle(name as keyof LeadDetailed, value as any);
                }}
                propertyTypes={propertyTypes}
                viewTypes={viewTypes}
                amenities={amenities}
                onExtractUrl={onExtractUrl}
                extractLoading={extractLoading}
                handleCountryChange={(value) => {
                  const syntheticEvent = {
                    target: {
                      name: 'country',
                      value
                    }
                  } as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;
                  handleCountryChangeWithNationality(syntheticEvent);
                }}
              />
              {formData.country === 'Mauritius' && (
                <div className="space-y-2">
                  <Label className="text-sm">Régions souhaitées</Label>
                  <MultiSelectButtons 
                    options={MAURITIUS_REGIONS} 
                    selectedValues={formData.regions || []} 
                    onToggle={region => {
                      const updatedRegions = formData.regions ? [...formData.regions] : [];
                      if (updatedRegions.includes(region as MauritiusRegion)) {
                        handleMultiSelectToggle('regions', region as MauritiusRegion);
                      } else {
                        handleMultiSelectToggle('regions', region as MauritiusRegion);
                      }
                    }} 
                  />
                </div>
              )}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Coordonnées Google Maps
                  </Label>
                  <Input
                    name="mapCoordinates"
                    value={formData.mapCoordinates || ''}
                    onChange={handleInputChange}
                    placeholder="Ex: 48.8566,2.3522"
                    className="font-futura"
                  />
                  <p className="text-xs text-muted-foreground">
                    Format: latitude,longitude (ex: 48.8566,2.3522)
                  </p>
                </div>
              </div>
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
