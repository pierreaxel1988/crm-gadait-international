
import React from 'react';
import { LeadDetailed } from '@/types/lead';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import PropertyDetailsSection from '../sections/PropertyDetailsSection';
import PurchaseDetailsSection from '../sections/PurchaseDetailsSection';
import BuyerInfoSection from '../sections/BuyerInfoSection';

// Define constants for the options required by PurchaseDetailsSection
const PURCHASE_TIMEFRAMES = ["Moins de trois mois", "Plus de trois mois"];
const FINANCING_METHODS = ["Cash", "Prêt bancaire"];
const PROPERTY_USES = ["Investissement locatif", "Résidence principale"];

interface SearchCriteriaSectionProps {
  lead: LeadDetailed;
  onDataChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

const SearchCriteriaSection = ({ 
  lead, 
  onDataChange 
}: SearchCriteriaSectionProps) => {
  // Define dummy function for multi-select toggle
  const handleMultiSelectToggle = (name: string, value: string) => {
    console.log("MultiSelect toggle requested but not implemented in mobile view", { name, value });
    // In a production context, this would need proper implementation
  };

  return (
    <div className="space-y-4 mt-6">
      <h2 className="text-sm font-futura uppercase tracking-wider text-gray-800 pb-2 border-b">
        Critères de Recherche
      </h2>
      <ScrollArea className="h-[calc(100vh-350px)] pr-4">
        <Tabs defaultValue="property" className="w-full">
          <TabsContent value="property" className="space-y-6">
            <PropertyDetailsSection
              formData={{
                propertyTypes: lead.propertyTypes || [],
                views: lead.views || [],
                amenities: lead.amenities || [],
                country: lead.country,
                desiredLocation: lead.desiredLocation,
                url: lead.url,
                livingArea: lead.livingArea,
                landArea: lead.landArea
              }}
              handleInputChange={onDataChange}
              handleMultiSelectToggle={handleMultiSelectToggle}
              propertyTypes={[
                "Villa", "Appartement", "Penthouse", "Maison", "Duplex", 
                "Chalet", "Terrain", "Manoir", "Maison de ville", "Château", 
                "Local commercial", "Commercial", "Hotel", "Vignoble", "Autres"
              ]}
              viewTypes={["Mer", "Montagne", "Golf", "Autres"]}
              amenities={["Piscine", "Jardin", "Terrasse", "Garage", "Vue mer"]}
              handleCountryChange={(value) => {
                const syntheticEvent = {
                  target: {
                    name: 'country',
                    value
                  }
                } as React.ChangeEvent<HTMLInputElement>;
                onDataChange(syntheticEvent);
              }}
            />
          </TabsContent>
          
          <TabsContent value="purchase" className="space-y-6 py-2">
            <PurchaseDetailsSection
              formData={lead}
              handleInputChange={onDataChange}
              handleMultiSelectToggle={handleMultiSelectToggle}
              purchaseTimeframes={PURCHASE_TIMEFRAMES}
              financingMethods={FINANCING_METHODS}
              propertyUses={PROPERTY_USES}
            />
          </TabsContent>
          
          <TabsContent value="buyer" className="space-y-6 py-2">
            <BuyerInfoSection
              formData={lead}
              handleInputChange={onDataChange}
            />
          </TabsContent>
        </Tabs>
      </ScrollArea>
    </div>
  );
};

export default SearchCriteriaSection;
