
import React, { useState } from 'react';
import { LeadDetailed } from '@/types/lead';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import OwnerPriceFields from './components/OwnerPriceFields';
import OwnerLocationSection from './components/OwnerLocationSection';
import OwnerPropertySection from './components/OwnerPropertySection';
import BuyerCriteriaSection from './components/BuyerCriteriaSection';

interface SearchCriteriaSectionProps {
  lead: LeadDetailed;
  onDataChange: (data: Partial<LeadDetailed>) => void;
}

const SearchCriteriaSection = ({
  lead,
  onDataChange
}: SearchCriteriaSectionProps) => {
  const [activeTab, setActiveTab] = useState('budget');
  
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-futura uppercase tracking-wider text-gray-800 pb-2 border-b mb-4">
        Critères de la Propriété
      </h2>
      
      {lead.pipelineType === 'owners' ? (
        <div className="space-y-4">
          <Tabs defaultValue="budget" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-3 mb-4">
              <TabsTrigger value="budget">Prix</TabsTrigger>
              <TabsTrigger value="location">Localisation</TabsTrigger>
              <TabsTrigger value="property">Bien</TabsTrigger>
            </TabsList>
            
            <TabsContent value="budget" className="space-y-4">
              <OwnerPriceFields lead={lead} onDataChange={onDataChange} />
            </TabsContent>
            
            <TabsContent value="location" className="space-y-4">
              <OwnerLocationSection lead={lead} onDataChange={onDataChange} />
            </TabsContent>
            
            <TabsContent value="property" className="space-y-4">
              <OwnerPropertySection lead={lead} onDataChange={onDataChange} />
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-270px)]">
          <BuyerCriteriaSection lead={lead} onDataChange={onDataChange} />
        </ScrollArea>
      )}
    </div>
  );
};

export default SearchCriteriaSection;
