
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
    <div className="flex flex-col min-h-screen">
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
        <div className="bg-white rounded-lg overflow-hidden">
          <TabsList className="w-full grid grid-cols-2 h-12">
            <TabsTrigger 
              value="purchase" 
              className="rounded-none text-base font-normal data-[state=active]:border-b-2 data-[state=active]:border-black"
            >
              Achat
            </TabsTrigger>
            <TabsTrigger 
              value="rental" 
              className="rounded-none text-base font-normal data-[state=active]:border-b-2 data-[state=active]:border-black"
            >
              Location
            </TabsTrigger>
          </TabsList>
        </div>
      </Tabs>

      <div className="flex-1 overflow-y-auto mt-2 pb-20">
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
      
      {/* Floating action button */}
      <div className="fixed bottom-24 right-6 z-50">
        <button className="bg-black text-white rounded-full h-14 w-14 flex items-center justify-center shadow-lg">
          <PlusCircle className="h-7 w-7" />
        </button>
      </div>
    </div>
  );
};

export default MobilePipelineView;
