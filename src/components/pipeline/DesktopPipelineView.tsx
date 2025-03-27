
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, Key, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MobileColumnList from './mobile/MobileColumnList';
import { FilterOptions } from './PipelineFilters';

interface DesktopPipelineViewProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  filters: FilterOptions;
  refreshTrigger: number;
  searchTerm?: string;
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Tabs defaultValue="purchase" value={activeTab} onValueChange={setActiveTab} className="w-full md:w-[400px]">
          <TabsList className="w-full">
            <TabsTrigger value="purchase" className="flex items-center gap-2 w-1/2">
              <Home className="h-4 w-4" />
              <span className="truncate">Achat</span>
            </TabsTrigger>
            <TabsTrigger value="rental" className="flex items-center gap-2 w-1/2">
              <Key className="h-4 w-4" />
              <span className="truncate">Location</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="sr-only">Refresh</span>
          </Button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <MobileColumnList
          columns={[]}
          activeTab={activeTab as 'purchase' | 'rental'}
          searchTerm={searchTerm}
          filters={filters}
        />
      </div>
    </div>
  );
};

export default DesktopPipelineView;
