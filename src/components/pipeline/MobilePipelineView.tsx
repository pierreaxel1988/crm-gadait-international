
import React from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MobilePipelineHeader from './mobile/MobilePipelineHeader';
import MobileColumnList from './mobile/MobileColumnList';
import PipelineFilters, { FilterOptions } from './PipelineFilters';
import { LeadStatus } from '@/components/common/StatusBadge';

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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
        <TabsList className="w-full">
          <TabsTrigger value="purchase" className="flex-1">Achat</TabsTrigger>
          <TabsTrigger value="rental" className="flex-1">Location</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex-1 overflow-y-auto mt-4 pb-20">
        <MobileColumnList
          columns={columns}
          activeTab={activeTab}
          searchTerm={searchTerm}
          filters={filters}
        />
      </div>

      {/* Filters sheet */}
      {filtersOpen && (
        <Sheet open={filtersOpen} onOpenChange={toggleFilters}>
          <SheetContent side="right" className="w-full sm:max-w-md p-0">
            <PipelineFilters 
              filters={filters}
              onFilterChange={onFilterChange}
              onClearFilters={onClearFilters}
              assignedToOptions={teamMembers}
              isFilterActive={isFilterActive}
              isMobile={true}
            />
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
};

export default MobilePipelineView;
