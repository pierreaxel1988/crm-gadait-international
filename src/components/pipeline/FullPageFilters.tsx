import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { FilterOptions } from './PipelineFilters';
import EnhancedStatusFilter from './filters/EnhancedStatusFilter';
import EnhancedTagsFilter from './filters/EnhancedTagsFilter';
import EnhancedAgentFilter from './filters/EnhancedAgentFilter';
import EnhancedBudgetFilter from './filters/EnhancedBudgetFilter';
import EnhancedLocationFilter from './filters/EnhancedLocationFilter';
import EnhancedTimeframeFilter from './filters/EnhancedTimeframeFilter';
import EnhancedPropertyTypeFilter from './filters/EnhancedPropertyTypeFilter';

interface FullPageFiltersProps {
  filters: FilterOptions;
  onFilterChange: (newFilters: FilterOptions) => void;
  onClearFilters: () => void;
  assignedToOptions?: {
    id: string;
    name: string;
  }[];
  isFilterActive: (filterName: string) => boolean;
  onApplyFilters?: () => void;
}

const FullPageFilters: React.FC<FullPageFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  assignedToOptions = [],
  isFilterActive,
  onApplyFilters
}) => {
  const { isCommercial } = useAuth();

  const handleFilterChange = <K extends keyof FilterOptions,>(filterName: K, value: FilterOptions[K]) => {
    onFilterChange({
      ...filters,
      [filterName]: value
    });
  };

  const filterSections = [
    {
      title: "Statut et étiquettes",
      description: "Filtrer par statut du lead et étiquettes",
      filters: [
        {
          component: (
            <EnhancedStatusFilter 
              status={filters.status} 
              onStatusChange={status => handleFilterChange('status', status)} 
            />
          )
        },
        {
          component: (
            <EnhancedTagsFilter 
              selectedTags={filters.tags} 
              onTagsChange={tags => handleFilterChange('tags', tags)} 
            />
          )
        }
      ]
    },
    {
      title: "Assignation et budget",
      description: "Gérer les assignments et critères financiers",
      filters: [
        ...(isCommercial ? [] : [{
          component: (
            <EnhancedAgentFilter 
              assignedTo={filters.assignedTo} 
              onAssignedToChange={agent => handleFilterChange('assignedTo', agent)} 
              assignedToOptions={assignedToOptions} 
            />
          )
        }]),
        {
          component: (
            <EnhancedBudgetFilter 
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
          )
        }
      ]
    },
    {
      title: "Localisation et propriétés",
      description: "Critères géographiques et types de biens",
      filters: [
        {
          component: (
            <EnhancedLocationFilter 
              location={filters.location} 
              onLocationChange={location => handleFilterChange('location', location)} 
            />
          )
        },
        {
          component: (
            <EnhancedPropertyTypeFilter 
              propertyType={filters.propertyType} 
              onPropertyTypeChange={type => handleFilterChange('propertyType', type)} 
            />
          )
        }
      ]
    },
    {
      title: "Délais d'achat",
      description: "Filtrer par urgence et timeline",
      filters: [
        {
          component: (
            <EnhancedTimeframeFilter 
              purchaseTimeframe={filters.purchaseTimeframe} 
              onTimeframeChange={timeframe => handleFilterChange('purchaseTimeframe', timeframe)} 
            />
          )
        }
      ]
    }
  ];

  return (
    <div className="space-y-8 pb-24">
      {filterSections.map((section, sectionIndex) => (
        <Card key={sectionIndex} className="overflow-hidden border-0 shadow-lg bg-card/50 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
            <CardTitle className="text-lg font-semibold text-foreground">
              {section.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {section.description}
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {section.filters.map((filter, filterIndex) => (
                <div 
                  key={filterIndex}
                  className="space-y-4 p-4 rounded-lg border border-border/50 bg-background/50 hover:bg-background/80 transition-colors"
                >
                  {filter.component}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FullPageFilters;