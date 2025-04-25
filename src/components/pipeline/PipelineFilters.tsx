
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
import { FilterOptions } from '../filters/PipelineFilters';

export interface PipelineFiltersProps {
  filters: FilterOptions;
  onFilterChange: (newFilters: FilterOptions) => void;
  onClearFilters: () => void;
  isFilterActive: (filterName: string) => boolean;
  isMobile?: boolean;
  onApplyFilters?: () => void;
}

const PipelineFilters = ({
  filters,
  onFilterChange,
  onClearFilters,
  isFilterActive,
  isMobile = false,
  onApplyFilters
}: PipelineFiltersProps) => {
  const filterGroups = [
    {
      title: 'État et Tags',
      components: [
        <StatusFilter 
          key="status"
          status={filters.status} 
          onStatusChange={status => onFilterChange({ ...filters, status })} 
        />,
        <TagsFilter 
          key="tags"
          selectedTags={filters.tags} 
          onTagsChange={tags => onFilterChange({ ...filters, tags })} 
        />
      ]
    },
    {
      title: 'Budget',
      components: [
        <BudgetFilter 
          key="budget"
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
      ]
    },
    {
      title: 'Localisation et Planning',
      components: [
        <LocationFilter 
          key="location"
          location={filters.location} 
          onLocationChange={location => onFilterChange({ ...filters, location })} 
        />,
        <TimeframeFilter 
          key="timeframe"
          purchaseTimeframe={filters.purchaseTimeframe} 
          onTimeframeChange={timeframe => onFilterChange({ ...filters, purchaseTimeframe: timeframe })} 
        />
      ]
    },
    {
      title: 'Type de bien',
      components: [
        <PropertyTypeFilter 
          key="propertyType"
          propertyType={filters.propertyType} 
          onPropertyTypeChange={type => onFilterChange({ ...filters, propertyType: type })} 
        />
      ]
    }
  ];

  const filterContent = (
    <div className={`${isMobile ? 'space-y-6' : 'space-y-8'} px-6`}>
      {filterGroups.map((group, index) => (
        <div key={group.title} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">{group.title}</h3>
          </div>
          <div className="space-y-4">
            {group.components}
          </div>
          {index < filterGroups.length - 1 && <div className="h-px bg-border mt-6" />}
        </div>
      ))}
      
      <ActionButtons 
        onClearFilters={onClearFilters} 
        onApplyFilters={onApplyFilters}
      />
    </div>
  );

  if (!isMobile) {
    return (
      <div className="bg-background border rounded-lg shadow-sm">
        <div className="p-4">
          {filterContent}
        </div>
      </div>
    );
  }

  return (
    <SheetContent side="right" className="w-full sm:max-w-md p-0">
      <SheetHeader className="px-6 py-4 border-b">
        <SheetTitle className="text-lg font-medium">Filtres</SheetTitle>
      </SheetHeader>
      <ScrollArea className="h-[calc(100vh-5rem)] pb-8">
        <div className="pt-4">
          {filterContent}
        </div>
      </ScrollArea>
    </SheetContent>
  );
};

export default PipelineFilters;
