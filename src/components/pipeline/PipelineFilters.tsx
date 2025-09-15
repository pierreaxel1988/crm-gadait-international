
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

  // Count active filters
  const activeFiltersCount = 
    (filters.status ? 1 : 0) +
    filters.tags.length +
    (filters.assignedTo ? 1 : 0) +
    (filters.minBudget || filters.maxBudget ? 1 : 0) +
    (filters.location ? 1 : 0) +
    (filters.purchaseTimeframe ? 1 : 0) +
    (filters.propertyType ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* Active filters and count - Always visible at top */}
      <div className="bg-background/50 rounded-lg p-3 border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium flex items-center gap-2">
            Filtres actifs
            {activeFiltersCount > 0 && (
              <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                {activeFiltersCount}
              </span>
            )}
          </h3>
          {activeFiltersCount > 0 && (
            <ActionButtons 
              onClearFilters={onClearFilters} 
              onApply={onApplyFilters}
              compact={true}
            />
          )}
        </div>
        <ActiveFiltersList 
          filters={filters} 
          onFilterChange={onFilterChange} 
          onClearFilters={onClearFilters} 
          getTeamMemberName={getTeamMemberName} 
          isFilterActive={isFilterActive} 
        />
      </div>

      {/* Primary filters - Most important */}
      <div className="bg-background/30 rounded-lg p-4 border">
        <h3 className="text-sm font-medium mb-3 text-muted-foreground uppercase tracking-wide">Filtres principaux</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          <StatusFilter 
            status={filters.status} 
            onStatusChange={status => handleFilterChange('status', status)} 
          />
          
          <TagsFilter 
            selectedTags={filters.tags} 
            onTagsChange={tags => handleFilterChange('tags', tags)} 
          />

          {!isCommercial && (
            <AgentFilter 
              assignedTo={filters.assignedTo} 
              onAssignedToChange={agent => handleFilterChange('assignedTo', agent)} 
              assignedToOptions={assignedToOptions} 
            />
          )}
        </div>
      </div>

      {/* Secondary filters - Search criteria */}
      <div className="bg-background/30 rounded-lg p-4 border">
        <h3 className="text-sm font-medium mb-3 text-muted-foreground uppercase tracking-wide">Critères de recherche</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          <LocationFilter 
            location={filters.location} 
            onLocationChange={handleLocationChange} 
          />

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

          <PropertyTypeFilter 
            propertyType={filters.propertyType} 
            onPropertyTypeChange={type => handleFilterChange('propertyType', type)} 
          />
        </div>
      </div>

      {/* Tertiary filters - Additional criteria */}
      <div className="bg-background/30 rounded-lg p-4 border">
        <h3 className="text-sm font-medium mb-3 text-muted-foreground uppercase tracking-wide">Critères additionnels</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TimeframeFilter 
            purchaseTimeframe={filters.purchaseTimeframe} 
            onTimeframeChange={timeframe => handleFilterChange('purchaseTimeframe', timeframe)} 
          />
          
          {/* Space for future filters */}
          <div></div>
        </div>
      </div>

      {/* Action buttons - Only show if no active filters */}
      {activeFiltersCount === 0 && (
        <div className="flex justify-center pt-2">
          <ActionButtons 
            onClearFilters={onClearFilters} 
            onApply={onApplyFilters} 
          />
        </div>
      )}
    </div>
  );
};

export default PipelineFilters;
