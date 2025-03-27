
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FilterOptions } from '@/components/pipeline/PipelineFilters';
import PipelineTabContent from '@/components/pipeline/PipelineTabContent';

interface DesktopPipelineViewProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  filters: FilterOptions;
  refreshTrigger: number;
  searchTerm: string;
  handleRefresh: () => void;
  isRefreshing: boolean;
}

const DesktopPipelineView = ({
  activeTab,
  setActiveTab,
  filters,
  refreshTrigger,
  searchTerm,
  handleRefresh,
  isRefreshing
}: DesktopPipelineViewProps) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="purchase" className="flex-1">Achat</TabsTrigger>
        <TabsTrigger value="rental" className="flex-1">Location</TabsTrigger>
      </TabsList>
      
      <TabsContent value="purchase" className="mt-0">
        <PipelineTabContent 
          contentType="purchase" 
          filters={filters} 
          refreshTrigger={refreshTrigger}
          searchTerm={searchTerm}
        />
      </TabsContent>
      
      <TabsContent value="rental" className="mt-0">
        <PipelineTabContent 
          contentType="rental" 
          filters={filters} 
          refreshTrigger={refreshTrigger}
          searchTerm={searchTerm}
        />
      </TabsContent>
    </Tabs>
  );
};

export default DesktopPipelineView;
