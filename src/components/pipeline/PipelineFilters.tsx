
import React from 'react';
import { Button } from '@/components/ui/button';
import AgentFilter from './filters/AgentFilter';
import StatusFilter from './filters/StatusFilter';
import TagsFilter from './filters/TagsFilter';
import BudgetFilter from './filters/BudgetFilter';
import LocationFilter from './filters/LocationFilter';
import PropertyTypeFilter from './filters/PropertyTypeFilter';
import TimeframeFilter from './filters/TimeframeFilter';
import ActiveFiltersList from './filters/ActiveFiltersList';
import ActionButtons from './filters/ActionButtons';
import { LeadStatus } from '@/components/common/StatusBadge';
import { LeadTag } from '@/components/common/TagBadge';
import { PropertyType, PurchaseTimeframe } from '@/types/lead';

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

interface PipelineFiltersProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onClearFilters: () => void;
  assignedToOptions: { id: string; name: string }[];
  isFilterActive: (filterName: string) => boolean;
  onApplyFilters?: () => void;
  getTeamMemberName?: (id: string) => string;
}

const PipelineFilters = ({
  filters,
  onFilterChange,
  onClearFilters,
  assignedToOptions,
  isFilterActive,
  onApplyFilters,
  getTeamMemberName
}: PipelineFiltersProps) => {
  
  // Handler for status filter changes
  const handleStatusChange = (status: LeadStatus | null) => {
    onFilterChange({ ...filters, status });
  };

  // Handler for tag filter changes
  const handleTagsChange = (tags: LeadTag[]) => {
    onFilterChange({ ...filters, tags });
  };

  // Handler for assigned agent filter changes
  const handleAssignedToChange = (assignedTo: string | null) => {
    onFilterChange({ ...filters, assignedTo });
  };

  // Handler for budget filter changes
  const handleBudgetChange = (type: 'min' | 'max', value: string) => {
    if (type === 'min') {
      onFilterChange({ ...filters, minBudget: value });
    } else {
      onFilterChange({ ...filters, maxBudget: value });
    }
  };

  // Handler for location filter changes
  const handleLocationChange = (location: string) => {
    onFilterChange({ ...filters, location });
  };

  // Handler for purchase timeframe filter changes
  const handleTimeframeChange = (purchaseTimeframe: PurchaseTimeframe | null) => {
    onFilterChange({ ...filters, purchaseTimeframe });
  };

  // Handler for property type filter changes
  const handlePropertyTypeChange = (propertyType: PropertyType | null) => {
    onFilterChange({ ...filters, propertyType });
  };

  // Display active filters at the top, if any
  const hasActiveFilters = Object.values(filters).some(val => 
    val !== null && (Array.isArray(val) ? val.length > 0 : val !== '')
  );

  return (
    <div className="space-y-4">
      {hasActiveFilters && (
        <ActiveFiltersList 
          filters={filters} 
          onClearFilters={onClearFilters}
          isFilterActive={isFilterActive}
          onFilterChange={onFilterChange}
          getTeamMemberName={getTeamMemberName || ((id) => id)}
        />
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Status Filter */}
        <StatusFilter 
          status={filters.status} 
          onStatusChange={handleStatusChange} 
        />
        
        {/* Tags Filter */}
        <TagsFilter 
          selectedTags={filters.tags} 
          onTagsChange={handleTagsChange} 
        />
        
        {/* Agent Assignment Filter */}
        <AgentFilter 
          assignedTo={filters.assignedTo} 
          onAssignedToChange={handleAssignedToChange}
          agents={assignedToOptions}
        />
        
        {/* Budget Filter */}
        <BudgetFilter 
          minBudget={filters.minBudget}
          maxBudget={filters.maxBudget}
          onBudgetChange={handleBudgetChange}
        />
        
        {/* Location Filter */}
        <LocationFilter 
          location={filters.location} 
          onLocationChange={handleLocationChange} 
        />
        
        {/* Purchase Timeframe Filter */}
        <TimeframeFilter 
          purchaseTimeframe={filters.purchaseTimeframe} 
          onTimeframeChange={handleTimeframeChange} 
        />
        
        {/* Property Type Filter */}
        <PropertyTypeFilter 
          propertyType={filters.propertyType} 
          onPropertyTypeChange={handlePropertyTypeChange} 
        />
      </div>
      
      {/* Action Buttons */}
      <ActionButtons 
        onClearFilters={onClearFilters} 
        onApplyFilters={onApplyFilters}
      />
    </div>
  );
};

export default PipelineFilters;
