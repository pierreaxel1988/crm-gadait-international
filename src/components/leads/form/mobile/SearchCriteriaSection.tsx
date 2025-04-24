
import React from 'react';
import { LeadDetailed } from '@/types/lead';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import PropertyDetailsSection from '../sections/PropertyDetailsSection';
import PurchaseDetailsSection from '../sections/PurchaseDetailsSection';
import BuyerInfoSection from '../sections/BuyerInfoSection';

interface SearchCriteriaSectionProps {
  lead: LeadDetailed;
  onDataChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

const SearchCriteriaSection = ({ 
  lead, 
  onDataChange 
}: SearchCriteriaSectionProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-futura uppercase tracking-wider text-gray-800 pb-2 border-b">
        Critères de Recherche
      </h2>
      <ScrollArea className="h-[calc(100vh-350px)] pr-4">
        <Tabs defaultValue="property" className="w-full">
          <TabsContent value="property" className="space-y-6">
            <PropertyDetailsSection
              formData={lead}
              handleInputChange={onDataChange}
              handleMultiSelectToggle={() => {}}
            />
          </TabsContent>
          
          <TabsContent value="purchase" className="space-y-6 py-2">
            <PurchaseDetailsSection
              formData={lead}
              handleInputChange={onDataChange}
              handleMultiSelectToggle={() => {}}
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

