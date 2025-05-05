
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
import { MapPin, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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

const fadeInUp = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

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
    <FormSection 
      title="Critères de Recherche"
      action={
        <div className="flex items-center gap-1 text-xs text-loro-terracotta">
          <Sparkles className="h-3 w-3" />
          <span>Détails</span>
        </div>
      }
    >
      <ScrollArea className="h-[calc(100vh-350px)] pr-4">
        <motion.div 
          className="space-y-6"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <Tabs defaultValue="property" className="w-full">
            <TabsList className="w-full mb-4 grid grid-cols-3 bg-gradient-to-r from-loro-pearl/20 to-loro-pearl/10 rounded-xl p-1 shadow-inner">
              <TabsTrigger 
                value="property" 
                className="data-[state=active]:bg-white data-[state=active]:text-loro-terracotta data-[state=active]:shadow-sm rounded-lg transition-all duration-300 ease-out"
              >
                Propriété
              </TabsTrigger>
              <TabsTrigger 
                value="purchase" 
                className="data-[state=active]:bg-white data-[state=active]:text-loro-terracotta data-[state=active]:shadow-sm rounded-lg transition-all duration-300 ease-out"
              >
                Achat
              </TabsTrigger>
              <TabsTrigger 
                value="buyer" 
                className="data-[state=active]:bg-white data-[state=active]:text-loro-terracotta data-[state=active]:shadow-sm rounded-lg transition-all duration-300 ease-out"
              >
                Acheteur
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="property" className="space-y-6">
              <motion.div variants={fadeInUp}>
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
              </motion.div>

              {formData.country === 'Mauritius' && (
                <motion.div variants={fadeInUp} className="space-y-2">
                  <Collapsible className="border border-loro-pearl/40 rounded-lg p-3 transition-all">
                    <CollapsibleTrigger className="flex w-full items-center justify-between">
                      <Label className="text-sm font-medium">Régions souhaitées</Label>
                      <div className="h-6 w-6 rounded-full bg-loro-pearl/30 flex items-center justify-center text-loro-navy">
                        {formData.regions?.length || 0}
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-2">
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
                    </CollapsibleContent>
                  </Collapsible>
                </motion.div>
              )}

              <motion.div variants={fadeInUp} className="space-y-4">
                <div className="space-y-2 group">
                  <Label className="text-sm flex items-center gap-2 group-hover:text-loro-terracotta transition-colors duration-300">
                    <MapPin className="h-4 w-4" />
                    Pin Location
                  </Label>
                  <div className="relative overflow-hidden rounded-md">
                    <Input
                      name="mapCoordinates"
                      value={formData.mapCoordinates || ''}
                      onChange={handleInputChange}
                      placeholder="Collez le lien Google Maps ici"
                      className="font-futura pr-10 border-loro-pearl/50 focus:border-loro-terracotta focus:ring-loro-terracotta/20"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground italic">
                    Copiez-collez le lien Google Maps de la propriété
                  </p>
                </div>
              </motion.div>
            </TabsContent>
            
            <TabsContent value="purchase" className="space-y-6 py-2">
              <motion.div variants={fadeInUp} className="border border-loro-pearl/20 rounded-lg p-4 bg-gradient-to-b from-loro-50 to-white">
                <PurchaseDetailsSection
                  formData={formData}
                  handleInputChange={handleInputChange}
                  handleMultiSelectToggle={handleMultiSelectToggle}
                  purchaseTimeframes={purchaseTimeframes}
                  financingMethods={financingMethods}
                  propertyUses={propertyUses}
                />
              </motion.div>
            </TabsContent>
            
            <TabsContent value="buyer" className="space-y-6 py-2">
              <motion.div variants={fadeInUp} className="border border-loro-pearl/20 rounded-lg p-4 bg-gradient-to-b from-loro-50 to-white">
                <BuyerInfoSection
                  formData={formData}
                  handleInputChange={handleInputChange}
                />
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </ScrollArea>
    </FormSection>
  );
};

export default SearchCriteriaSection;
