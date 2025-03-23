
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, Key } from 'lucide-react';
import PipelineTabContent from './PipelineTabContent';

interface DesktopPipelineViewProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  filters: any;
  refreshTrigger: number;
}

const DesktopPipelineView = ({ 
  activeTab, 
  setActiveTab, 
  filters, 
  refreshTrigger 
}: DesktopPipelineViewProps) => {
  return (
    <Tabs defaultValue="purchase" value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="mb-4 md:mb-6 w-full md:w-[400px] mx-auto">
        <TabsTrigger value="purchase" className="flex items-center gap-2 w-1/2">
          <Home className="h-4 w-4" />
          <span className="truncate">Achat (Purchase)</span>
        </TabsTrigger>
        <TabsTrigger value="rental" className="flex items-center gap-2 w-1/2">
          <Key className="h-4 w-4" />
          <span className="truncate">Location (Rental)</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="purchase" className="mt-0">
        <PipelineTabContent 
          contentType="purchase" 
          filters={filters} 
          refreshTrigger={refreshTrigger} 
        />
      </TabsContent>
      
      <TabsContent value="rental" className="mt-0">
        <PipelineTabContent 
          contentType="rental" 
          filters={filters} 
          refreshTrigger={refreshTrigger} 
        />
      </TabsContent>
    </Tabs>
  );
};

export default DesktopPipelineView;
