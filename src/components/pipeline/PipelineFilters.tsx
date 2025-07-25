
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import StatusFilter from './filters/StatusFilter';
import TagsFilter from './filters/TagsFilter';
import AgentFilter from './filters/AgentFilter';
import BudgetFilter from './filters/BudgetFilter';
import LocationFilter from './filters/LocationFilter';
import TimeframeFilter from './filters/TimeframeFilter';
import PropertyTypeFilter from './filters/PropertyTypeFilter';
import ActionButtons from './filters/ActionButtons';
import ActiveFiltersList from './filters/ActiveFiltersList';
import { LeadStatus } from '@/components/common/StatusBadge';
import { LeadTag } from '@/components/common/TagBadge';
import { PurchaseTimeframe, PropertyType } from '@/types/lead';
import { useAuth } from '@/hooks/useAuth';

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
  isFilterActive: (filterName: string) => boolean;
  isMobile?: boolean;
  onApplyFilters?: () => void;
}

const PipelineFilters: React.FC<PipelineFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  assignedToOptions = [],
  isFilterActive,
  isMobile = false,
  onApplyFilters
}) => {
  const { isCommercial } = useAuth();

  // Helper to get team member name by ID
  const getTeamMemberName = (id: string): string => {
    const member = assignedToOptions.find(member => member.id === id);
    return member ? member.name : 'Unknown';
  };

  // Handle change for a specific filter
  const handleFilterChange = <K extends keyof FilterOptions,>(filterName: K, value: FilterOptions[K]) => {
    onFilterChange({
      ...filters,
      [filterName]: value
    });
  };

  const handleLocationChange = (location: string) => {
    handleFilterChange('location', location);
  };

  return (
    <div className="space-y-6">
      {/* Status filter */}
      <StatusFilter 
        status={filters.status} 
        onStatusChange={status => handleFilterChange('status', status)} 
      />

      {/* Tags filter */}
      <TagsFilter 
        selectedTags={filters.tags} 
        onTagsChange={tags => handleFilterChange('tags', tags)} 
      />

      {/* Agent filter - only show for admins */}
      {!isCommercial && (
        <AgentFilter 
          assignedTo={filters.assignedTo} 
          onAssignedToChange={agent => handleFilterChange('assignedTo', agent)} 
          assignedToOptions={assignedToOptions} 
        />
      )}

      {/* Budget filter */}
      <BudgetFilter 
        minBudget={filters.minBudget} 
        maxBudget={filters.maxBudget} 
        onBudgetChange={(type, value) => {
          if (type === 'min') {
            handleFilterChange('minBudget', value);
          } else {
            handleFilterChange('maxBudget', value);
          }
        }} 
      />

      {/* Location filter */}
      <LocationFilter 
        location={filters.location} 
        onLocationChange={handleLocationChange} 
      />

      {/* Timeframe filter */}
      <TimeframeFilter 
        purchaseTimeframe={filters.purchaseTimeframe} 
        onTimeframeChange={timeframe => handleFilterChange('purchaseTimeframe', timeframe)} 
      />

      {/* Property type filter */}
      <PropertyTypeFilter 
        propertyType={filters.propertyType} 
        onPropertyTypeChange={type => handleFilterChange('propertyType', type)} 
      />

      {/* Action buttons */}
      <ActionButtons 
        onClearFilters={onClearFilters} 
        onApply={onApplyFilters} 
      />

      {/* Display active filters */}
      <ActiveFiltersList 
        filters={filters} 
        onFilterChange={onFilterChange} 
        onClearFilters={onClearFilters} 
        getTeamMemberName={getTeamMemberName} 
        isFilterActive={isFilterActive} 
      />
    </div>
  );
};

export default PipelineFilters;
