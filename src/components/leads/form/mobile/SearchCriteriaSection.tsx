
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
import { cn } from '@/lib/utils';

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
            <TabsList className="w-full mb-6 grid grid-cols-3 bg-loro-50/50 border border-loro-200/30 rounded-xl p-1">
              <TabsTrigger 
                value="property" 
                className="rounded-lg transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Propriété
              </TabsTrigger>
              <TabsTrigger 
                value="purchase" 
                className="rounded-lg transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Achat
              </TabsTrigger>
              <TabsTrigger 
                value="buyer" 
                className="rounded-lg transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Acheteur
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="property" className="space-y-8 animate-[fade-in_0.3s_ease-out]">
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
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Régions souhaitées</Label>
                  <div className="bg-loro-50/30 p-4 rounded-xl border border-loro-200/20">
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
                      className="gap-2"
                    />
                  </div>
                </div>
              )}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Pin Location
                </Label>
                <div className="bg-loro-50/30 p-4 rounded-xl border border-loro-200/20">
                  <Input
                    name="mapCoordinates"
                    value={formData.mapCoordinates || ''}
                    onChange={handleInputChange}
                    placeholder="Collez le lien Google Maps ici"
                    className="font-futura bg-white/80"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Copiez-collez le lien Google Maps de la propriété
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="purchase" className="space-y-8 animate-[fade-in_0.3s_ease-out]">
              <PurchaseDetailsSection
                formData={formData}
                handleInputChange={handleInputChange}
                handleMultiSelectToggle={handleMultiSelectToggle}
                purchaseTimeframes={purchaseTimeframes}
                financingMethods={financingMethods}
                propertyUses={propertyUses}
              />
            </TabsContent>
            
            <TabsContent value="buyer" className="space-y-8 animate-[fade-in_0.3s_ease-out]">
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
