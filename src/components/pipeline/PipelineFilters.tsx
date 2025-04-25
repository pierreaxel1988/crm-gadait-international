
import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import StatusFilter from './filters/StatusFilter';
import TagsFilter from './filters/TagsFilter';
import BudgetFilter from './filters/BudgetFilter';
import LocationFilter from './filters/LocationFilter';
import TimeframeFilter from './filters/TimeframeFilter';
import PropertyTypeFilter from './filters/PropertyTypeFilter';
import ActionButtons from './filters/ActionButtons';
import ActiveFiltersList from './filters/ActiveFiltersList';
import AgentFilterSelect from './filters/AgentFilterSelect';
import { FilterOptions } from './types/filterTypes';

export interface PipelineFiltersProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onClearFilters: () => void;
  isFilterActive: (filterName: string) => boolean;
  isMobile?: boolean;
  onApplyFilters?: () => void;
}

const PipelineFilters: React.FC<PipelineFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  isFilterActive,
  isMobile = false,
  onApplyFilters
}) => {
  const filtersContent = (
    <div className={`${isMobile ? 'pt-2' : 'p-4'} space-y-6`}>
      {/* Status filter */}
      <StatusFilter 
        status={filters.status} 
        onStatusChange={status => onFilterChange({ ...filters, status })} 
      />

      {/* Tags filter */}
      <TagsFilter 
        selectedTags={filters.tags} 
        onTagsChange={tags => onFilterChange({ ...filters, tags })} 
      />

      {/* Agent filter */}
      <AgentFilterSelect 
        value={filters.assignedTo}
        onChange={value => onFilterChange({ ...filters, assignedTo: value })}
      />

      {/* Budget filter */}
      <BudgetFilter 
        minBudget={filters.minBudget} 
        maxBudget={filters.maxBudget} 
        onBudgetChange={(type, value) => {
          if (type === 'min') {
            onFilterChange({ ...filters, minBudget: value });
          } else {
            onFilterChange({ ...filters, maxBudget: value });
          }
        }} 
      />

      {/* Location filter */}
      <LocationFilter 
        location={filters.location} 
        onLocationChange={location => onFilterChange({ ...filters, location })} 
      />

      {/* Timeframe filter */}
      <TimeframeFilter 
        purchaseTimeframe={filters.purchaseTimeframe} 
        onTimeframeChange={timeframe => onFilterChange({ ...filters, purchaseTimeframe: timeframe })} 
      />

      {/* Property type filter */}
      <PropertyTypeFilter 
        propertyType={filters.propertyType} 
        onPropertyTypeChange={type => onFilterChange({ ...filters, propertyType: type })} 
      />

      {/* Action buttons */}
      <ActionButtons 
        onClearFilters={onClearFilters} 
        onApply={onApplyFilters} 
      />

      {/* Active filters */}
      <ActiveFiltersList 
        filters={filters} 
        onFilterChange={onFilterChange} 
        onClearFilters={onClearFilters}
        isFilterActive={isFilterActive}
      />
    </div>
  );

  if (!isMobile) {
    return (
      <div className="bg-background border rounded-md shadow-sm">
        {filtersContent}
      </div>
    );
  }

  return (
    <SheetContent side="right" className="w-full sm:max-w-md p-0 pt-12">
      <SheetHeader className="px-4 py-2 border-b">
        <SheetTitle className="text-sm font-normal">Filtres</SheetTitle>
      </SheetHeader>
      <ScrollArea className="h-[calc(100vh-6rem)] px-4 pb-6">
        {filtersContent}
      </ScrollArea>
    </SheetContent>
  );
};

export default PipelineFilters;
