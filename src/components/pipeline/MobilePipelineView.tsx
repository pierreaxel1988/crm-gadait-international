
import React from 'react';
import { Sheet } from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MobilePipelineHeader from './mobile/MobilePipelineHeader';
import MobileColumnList from './mobile/MobileColumnList';
import PipelineFilters, { FilterOptions } from './PipelineFilters';
import { LeadStatus } from '@/components/common/StatusBadge';
import { PipelineType } from '@/types/lead';

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
  // Force a console log to track the active tab for debugging
  console.log(`MobilePipelineView - activeTab: ${activeTab}`);
  
  // Function to apply filters and close the drawer
  const handleApplyFilters = () => {
    handleRefresh();
    toggleFilters();
  };
  
  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
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
        isFilterActive={isFilterActive}
        teamMembers={teamMembers}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-3">
        <TabsList className="w-full bg-gray-100 p-0.5 rounded-xl h-11">
          <TabsTrigger 
            value="purchase" 
            className="flex-1 rounded-lg text-sm font-medium text-zinc-700 data-[state=active]:text-zinc-900 data-[state=active]:bg-white"
          >
            Achat
          </TabsTrigger>
          <TabsTrigger 
            value="rental" 
            className="flex-1 rounded-lg text-sm font-medium text-zinc-700 data-[state=active]:text-zinc-900 data-[state=active]:bg-white"
          >
            Location
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex-1 overflow-y-auto mt-3 pb-20 -mx-3 px-3 bg-gray-50">
        <MobileColumnList
          columns={columns}
          activeTab={activeTab as PipelineType}
          searchTerm={searchTerm}
          filters={filters}
        />
      </div>

      {/* Filters sheet */}
      {filtersOpen && (
        <Sheet open={filtersOpen} onOpenChange={toggleFilters}>
          <PipelineFilters 
            filters={filters}
            onFilterChange={onFilterChange}
            onClearFilters={onClearFilters}
            assignedToOptions={teamMembers}
            isFilterActive={isFilterActive}
            isMobile={true}
            onApplyFilters={handleApplyFilters}
          />
        </Sheet>
      )}
    </div>
  );
};

export default MobilePipelineView;
