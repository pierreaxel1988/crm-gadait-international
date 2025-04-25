
import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { LeadStatus } from '@/components/common/StatusBadge';
import { LeadTag } from '@/components/common/TagBadge';
import { PurchaseTimeframe, PropertyType } from '@/types/lead';

import FilterGroup from './FilterGroup';
import StatusFilterChips from './StatusFilterChips';
import TagsFilterChips from './TagsFilterChips';
import AgentFilterSelect from './AgentFilterSelect';
import BudgetRangeFilter from './BudgetRangeFilter';
import LocationSearchFilter from './LocationSearchFilter';
import TimeframeFilter from './TimeframeFilter';
import PropertyTypeFilter from './PropertyTypeFilter';
import FilterActions from './FilterActions';
import ActiveFilterTags from './ActiveFilterTags';

export interface FilterOptions {
  status: LeadStatus | null;
  tags: LeadTag[];
  assignedTo: string | null;
  minBudget: string;
  maxBudget: string;
  location: string;
  purchaseTimeframe: PurchaseTimeframe | null;
  propertyType: PropertyType | null;
}

export interface PipelineFiltersProps {
  filters: FilterOptions;
  onFilterChange: (newFilters: FilterOptions) => void;
  onClearFilters: () => void;
  assignedToOptions?: {
    id: string;
    name: string;
  }[];
  isMobile?: boolean;
  onApplyFilters?: () => void;
  isFilterActive?: (filterName: string) => boolean;
}

const PipelineFilters: React.FC<PipelineFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  assignedToOptions = [],
  isMobile = false,
  onApplyFilters,
  isFilterActive
}) => {
  const { isCommercial } = useAuth();

  // Helper to get team member name by ID
  const getTeamMemberName = (id: string): string => {
    const member = assignedToOptions.find(member => member.id === id);
    return member ? member.name : 'Inconnu';
  };

  // Handle change for a specific filter
  const handleFilterChange = <K extends keyof FilterOptions,>(filterName: K, value: FilterOptions[K]) => {
    onFilterChange({
      ...filters,
      [filterName]: value
    });
  };

  const filterContent = (
    <div className="space-y-6">
      {/* Status Filter */}
      <FilterGroup title="Status">
        <StatusFilterChips 
          status={filters.status} 
          onStatusChange={(status) => handleFilterChange('status', status)} 
        />
      </FilterGroup>
      
      {/* Tags Filter */}
      <TagsFilterChips 
        selectedTags={filters.tags} 
        onTagsChange={(tags) => handleFilterChange('tags', tags)} 
      />
      
      {/* Agent filter - only show for admins */}
      {!isCommercial && (
        <AgentFilterSelect 
          assignedTo={filters.assignedTo} 
          onAssignedToChange={(agent) => handleFilterChange('assignedTo', agent)} 
          assignedToOptions={assignedToOptions} 
        />
      )}
      
      {/* Budget and Location Filters */}
      <div>
        <Separator className="my-4" />
        
        <BudgetRangeFilter 
          minBudget={filters.minBudget} 
          maxBudget={filters.maxBudget} 
          onMinBudgetChange={(value) => handleFilterChange('minBudget', value)}
          onMaxBudgetChange={(value) => handleFilterChange('maxBudget', value)}
        />
        
        <div className="h-4"></div>
        
        <LocationSearchFilter 
          location={filters.location} 
          onLocationChange={(location) => handleFilterChange('location', location)} 
        />
      </div>
      
      {/* Timeframe and Property Type Filters */}
      <div>
        <Separator className="my-4" />
        
        <TimeframeFilter 
          purchaseTimeframe={filters.purchaseTimeframe} 
          onTimeframeChange={(timeframe) => handleFilterChange('purchaseTimeframe', timeframe)} 
        />
        
        <div className="h-4"></div>
        
        <PropertyTypeFilter 
          propertyType={filters.propertyType} 
          onPropertyTypeChange={(type) => handleFilterChange('propertyType', type)} 
        />
      </div>
      
      {/* Action buttons */}
      <FilterActions 
        onClear={onClearFilters} 
        onApply={onApplyFilters || (() => {})} 
      />
      
      {/* Show active filters on desktop only */}
      {!isMobile && (
        <ActiveFilterTags 
          filters={filters} 
          onFilterChange={onFilterChange} 
          onClearFilters={onClearFilters} 
          getTeamMemberName={getTeamMemberName} 
          className="mt-4" 
        />
      )}
    </div>
  );

  if (isMobile) {
    return (
      <SheetContent side="right" className="w-full sm:max-w-md p-0">
        <SheetHeader className="px-6 py-4 border-b sticky top-0 bg-background z-10">
          <SheetTitle className="text-lg font-medium">Filtres</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-5rem)] px-6 py-4">
          {filterContent}
        </ScrollArea>
      </SheetContent>
    );
  }

  return (
    <div className="bg-background border rounded-lg shadow-sm p-6">
      {filterContent}
    </div>
  );
};

export default PipelineFilters;
