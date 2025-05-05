
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
    <FormSection title="Critères de Recherche" action={
      <span className="text-xs text-loro-hazel/70 font-futuraLight">
        Informations importantes pour optimiser la recherche
      </span>
    }>
      <ScrollArea className="h-[calc(100vh-350px)] pr-4">
        <div className="space-y-6">
          <Tabs defaultValue="property" className="w-full">
            <TabsList className="w-full mb-4 grid grid-cols-3 bg-loro-pearl/10 rounded-lg p-0.5">
              <TabsTrigger 
                value="property" 
                className="data-[state=active]:bg-white data-[state=active]:text-loro-hazel data-[state=active]:shadow-sm rounded-md text-sm font-futura"
              >
                Propriété
              </TabsTrigger>
              <TabsTrigger 
                value="purchase" 
                className="data-[state=active]:bg-white data-[state=active]:text-loro-hazel data-[state=active]:shadow-sm rounded-md text-sm font-futura"
              >
                Achat
              </TabsTrigger>
              <TabsTrigger 
                value="buyer" 
                className="data-[state=active]:bg-white data-[state=active]:text-loro-hazel data-[state=active]:shadow-sm rounded-md text-sm font-futura"
              >
                Acheteur
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="property" className="space-y-6 animate-fade-in">
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
                <div className="space-y-2 p-3 bg-gradient-to-br from-loro-pearl/5 to-loro-pearl/20 rounded-xl border border-loro-pearl/10 transition-all duration-300 hover:shadow-sm">
                  <Label className="text-sm flex items-center gap-1.5 text-loro-hazel font-medium">
                    <span className="text-loro-hazel/80">Régions souhaitées</span>
                  </Label>
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
              )}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3 p-3 bg-gradient-to-br from-loro-pearl/5 to-loro-pearl/20 rounded-xl border border-loro-pearl/10 transition-all duration-300 hover:shadow-sm">
                  <Label className="text-sm flex items-center gap-2 text-loro-hazel font-medium">
                    <MapPin className="h-3.5 w-3.5 text-loro-hazel/80" />
                    <span>Pin Location</span>
                  </Label>
                  <Input
                    name="mapCoordinates"
                    value={formData.mapCoordinates || ''}
                    onChange={handleInputChange}
                    placeholder="Collez le lien Google Maps ici"
                    className="font-futura h-9 shadow-sm transition-all duration-200 focus:ring-1 focus:ring-loro-hazel/30"
                  />
                  <p className="text-xs text-muted-foreground">
                    Copiez-collez le lien Google Maps de la propriété
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="purchase" className="space-y-6 py-2 animate-fade-in">
              <PurchaseDetailsSection
                formData={formData}
                handleInputChange={handleInputChange}
                handleMultiSelectToggle={handleMultiSelectToggle}
                purchaseTimeframes={purchaseTimeframes}
                financingMethods={financingMethods}
                propertyUses={propertyUses}
              />
            </TabsContent>
            
            <TabsContent value="buyer" className="space-y-6 py-2 animate-fade-in">
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
