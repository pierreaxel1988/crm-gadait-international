
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Filter } from 'lucide-react';
import { LeadStatus } from '@/components/common/StatusBadge';
import { LeadTag } from '@/components/common/TagBadge';
import { PropertyType, PurchaseTimeframe } from '@/types/lead';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

// Import des sous-composants de filtres
import StatusFilter from './filters/StatusFilter';
import TagsFilter from './filters/TagsFilter';
import AgentFilter from './filters/AgentFilter';
import BudgetFilter from './filters/BudgetFilter';
import LocationFilter from './filters/LocationFilter';
import TimeframeFilter from './filters/TimeframeFilter';
import PropertyTypeFilter from './filters/PropertyTypeFilter';
import ActionButtons from './filters/ActionButtons';
import ActiveFiltersList from './filters/ActiveFiltersList';

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

interface TeamMember {
  id: string;
  name: string;
}

export interface PipelineFiltersProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onClearFilters: () => void;
  assignedToOptions?: TeamMember[];
  isMobile?: boolean;
}

const PipelineFilters = ({
  filters,
  onFilterChange,
  onClearFilters,
  assignedToOptions = [],
  isMobile: forceMobile,
}: PipelineFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const detectedMobile = useIsMobile();
  const isMobile = forceMobile !== undefined ? forceMobile : detectedMobile;

  // Handler functions
  const handleStatusChange = (status: LeadStatus | null) => {
    onFilterChange({ ...filters, status });
  };

  const toggleTag = (tag: LeadTag) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    
    onFilterChange({ ...filters, tags: newTags });
  };

  const handleAssignedToChange = (assignedTo: string | null) => {
    onFilterChange({ ...filters, assignedTo });
  };

  const handleBudgetChange = (type: 'min' | 'max', value: string) => {
    if (type === 'min') {
      onFilterChange({ ...filters, minBudget: value });
    } else {
      onFilterChange({ ...filters, maxBudget: value });
    }
  };

  const handleLocationChange = (location: string) => {
    onFilterChange({ ...filters, location });
  };

  const handleTimeframeChange = (timeframe: PurchaseTimeframe | null) => {
    onFilterChange({ ...filters, purchaseTimeframe: timeframe });
  };

  const handlePropertyTypeChange = (propertyType: PropertyType | null) => {
    onFilterChange({ ...filters, propertyType });
  };

  // Check if any filters are active
  const isFilterActive = (filterName: string): boolean => {
    switch (filterName) {
      case 'status':
        return filters.status !== null;
      case 'tags':
        return filters.tags.length > 0;
      case 'assignedTo':
        return filters.assignedTo !== null;
      case 'budget':
        return filters.minBudget !== '' || filters.maxBudget !== '';
      case 'location':
        return filters.location !== '';
      case 'purchaseTimeframe':
        return filters.purchaseTimeframe !== null;
      case 'propertyType':
        return filters.propertyType !== null;
      default:
        return false;
    }
  };

  // Récupère le nom du membre de l'équipe à partir de son ID
  const getTeamMemberName = (id: string) => {
    const member = assignedToOptions.find(tm => tm.id === id);
    return member ? member.name : id;
  };

  return (
    <div className="relative w-full">
      {!isMobile && (
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Filter className="h-4 w-4" />
          <span className="hidden md:inline">Filtres</span>
        </Button>
      )}

      {!isMobile && (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <div />
          </PopoverTrigger>
          <PopoverContent className={cn(
            "w-[340px] sm:w-[420px] p-4 shadow-md", 
            isMobile && "max-h-[70vh] overflow-y-auto"
          )} align="start">
            <h3 className="text-lg font-medium mb-4">Filtres</h3>
            
            <div className="space-y-4">
              {/* Status Filter */}
              <StatusFilter 
                status={filters.status} 
                onStatusChange={handleStatusChange} 
              />
              
              {/* Tags Filter */}
              <TagsFilter 
                selectedTags={filters.tags} 
                onTagToggle={toggleTag} 
              />
              
              {/* Assigned To Filter */}
              <AgentFilter 
                assignedTo={filters.assignedTo} 
                onAssignedToChange={handleAssignedToChange} 
                assignedToOptions={assignedToOptions} 
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
              
              {/* Action Buttons */}
              <ActionButtons 
                onClear={onClearFilters} 
                onApply={() => setIsOpen(false)} 
              />
            </div>
          </PopoverContent>
        </Popover>
      )}

      {/* For mobile or direct embedding, just show the filters directly */}
      {isMobile && (
        <div className="space-y-4">
          {/* Status Filter */}
          <StatusFilter 
            status={filters.status} 
            onStatusChange={handleStatusChange} 
          />
          
          {/* Tags Filter */}
          <TagsFilter 
            selectedTags={filters.tags} 
            onTagToggle={toggleTag} 
          />
          
          {/* Assigned To Filter */}
          <AgentFilter 
            assignedTo={filters.assignedTo} 
            onAssignedToChange={handleAssignedToChange} 
            assignedToOptions={assignedToOptions} 
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
          
          {/* Action Buttons */}
          <ActionButtons 
            onClear={onClearFilters} 
            onApply={() => {}} 
          />
        </div>
      )}

      {/* Liste des filtres actifs */}
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
