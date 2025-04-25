
import React from 'react';
import { Sheet } from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MobilePipelineHeader from './mobile/MobilePipelineHeader';
import MobileColumnList from './mobile/MobileColumnList';
import PipelineFilters from '../filters/PipelineFilters';
import { PipelineType } from '@/types/lead';
import { SlidersHorizontal, ArrowDownAZ, Clock, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FilterOptions } from '../filters/PipelineFilters';

interface MobilePipelineViewProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filtersOpen: boolean;
  toggleFilters: () => void;
  activeFiltersCount: number;
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onClearFilters: () => void;
  columns: any[];
  handleRefresh: () => void;
  isRefreshing: boolean;
  isFilterActive: (filterName: string) => boolean;
  teamMembers: { id: string; name: string }[];
}

const pipelines = [
  { label: "Achat", value: "purchase" },
  { label: "Location", value: "rental" },
  { label: "Propriétaires", value: "owners" },
];

const MobilePipelineView: React.FC<MobilePipelineViewProps> = ({
  activeTab,
  setActiveTab,
  searchTerm,
  setSearchTerm,
  filtersOpen,
  toggleFilters,
  activeFiltersCount,
  filters,
  onFilterChange,
  onClearFilters,
  columns,
  handleRefresh,
  isRefreshing,
  isFilterActive,
  teamMembers
}) => {
  console.log(`MobilePipelineView - activeTab: ${activeTab}`);
  
  const handleApplyFilters = () => {
    handleRefresh();
    toggleFilters();
  };
  
  const handleSortChange = (value: string) => {
    console.log("Sorting changed to:", value);
  };
  
  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      <div className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="space-y-3 px-3 pb-4">
          <MobilePipelineHeader 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            activeFiltersCount={activeFiltersCount}
            toggleFilters={toggleFilters}
            handleRefresh={handleRefresh}
            isRefreshing={isRefreshing}
            filters={filters}
            onFilterChange={onFilterChange}
            onClearFilters={onClearFilters}
            teamMembers={teamMembers}
          />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-3">
            <TabsList className="w-full bg-gray-100 p-0.5 rounded-xl h-11">
              {pipelines.map(pipeline => (
                <TabsTrigger
                  key={pipeline.value}
                  value={pipeline.value}
                  className="flex-1 rounded-lg text-sm font-medium text-zinc-700 data-[state=active]:text-zinc-900 data-[state=active]:bg-white"
                >
                  {pipeline.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="px-3">
          <MobileColumnList
            columns={columns}
            activeTab={activeTab as PipelineType}
            searchTerm={searchTerm}
            filters={filters}
          />
        </div>
      </div>

      {filtersOpen && (
        <Sheet open={filtersOpen} onOpenChange={toggleFilters}>
          <PipelineFilters 
            filters={filters}
            onFilterChange={onFilterChange}
            onClearFilters={onClearFilters}
            isMobile={true}
            onApplyFilters={handleApplyFilters}
            isFilterActive={isFilterActive}
          />
        </Sheet>
      )}
    </div>
  );
};

export default MobilePipelineView;
