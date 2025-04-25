
import React from 'react';
import { X } from 'lucide-react';
import { LeadStatus } from '@/components/common/StatusBadge';
import { LeadTag } from '@/components/common/TagBadge';
import TagBadge from '@/components/common/TagBadge';
import { PurchaseTimeframe, PropertyType } from '@/types/lead';
import { FilterOptions } from '@/components/pipeline/types/filterTypes';
import { Button } from '@/components/ui/button';

interface ActiveFiltersListProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onClearFilters: () => void;
  isFilterActive: (filterName: string) => boolean;
  teamMembers?: { id: string; name: string }[];
}

const ActiveFiltersList = ({ 
  filters, 
  onFilterChange, 
  onClearFilters, 
  isFilterActive,
  teamMembers = []
}: ActiveFiltersListProps) => {
  // Helper function to get team member name from ID
  const getTeamMemberName = (id: string): string => {
    const member = teamMembers.find(member => member.id === id);
    return member ? member.name : 'Unknown';
  };

  // Check if any filters are active by using the isFilterActive function
  const hasActiveFilters = 
    isFilterActive('status') || 
    isFilterActive('tags') || 
    isFilterActive('assignedTo') || 
    isFilterActive('budget') || 
    isFilterActive('location') || 
    isFilterActive('purchaseTimeframe') || 
    isFilterActive('propertyType');

  if (!hasActiveFilters) return null;

  return (
    <div className="flex flex-wrap gap-2 items-center mt-4">
      <span className="text-sm text-muted-foreground mr-1">Filtres actifs:</span>
      
      {filters.status && (
        <div className="bg-primary/10 text-primary text-xs rounded-full px-3 py-1 flex items-center gap-1">
          {filters.status}
          <button onClick={() => onFilterChange({...filters, status: null})}>
            <X className="h-3 w-3 ml-1" />
          </button>
        </div>
      )}
      
      {filters.tags.map(tag => (
        <div key={tag} className="flex items-center">
          <TagBadge tag={tag} className="text-xs" />
          <button 
            onClick={() => onFilterChange({...filters, tags: filters.tags.filter(t => t !== tag)})}
            className="ml-1 bg-background rounded-full w-4 h-4 flex items-center justify-center"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
      
      {filters.assignedTo && (
        <div className="bg-primary/10 text-primary text-xs rounded-full px-3 py-1 flex items-center gap-1">
          {getTeamMemberName(filters.assignedTo)}
          <button onClick={() => onFilterChange({...filters, assignedTo: undefined})}>
            <X className="h-3 w-3 ml-1" />
          </button>
        </div>
      )}
      
      {(filters.minBudget || filters.maxBudget) && (
        <div className="bg-primary/10 text-primary text-xs rounded-full px-3 py-1 flex items-center gap-1">
          Budget: {filters.minBudget ? `${filters.minBudget}` : '0€'} - {filters.maxBudget ? `${filters.maxBudget}` : '∞'}
          <button onClick={() => onFilterChange({...filters, minBudget: '', maxBudget: ''})}>
            <X className="h-3 w-3 ml-1" />
          </button>
        </div>
      )}
      
      {filters.location && (
        <div className="bg-primary/10 text-primary text-xs rounded-full px-3 py-1 flex items-center gap-1">
          {filters.location}
          <button onClick={() => onFilterChange({...filters, location: ''})}>
            <X className="h-3 w-3 ml-1" />
          </button>
        </div>
      )}
      
      {filters.purchaseTimeframe && (
        <div className="bg-primary/10 text-primary text-xs rounded-full px-3 py-1 flex items-center gap-1">
          {filters.purchaseTimeframe === 'Moins de trois mois' ? '< 3 mois' : '> 3 mois'}
          <button onClick={() => onFilterChange({...filters, purchaseTimeframe: null})}>
            <X className="h-3 w-3 ml-1" />
          </button>
        </div>
      )}
      
      {filters.propertyType && (
        <div className="bg-primary/10 text-primary text-xs rounded-full px-3 py-1 flex items-center gap-1">
          {filters.propertyType}
          <button onClick={() => onFilterChange({...filters, propertyType: null})}>
            <X className="h-3 w-3 ml-1" />
          </button>
        </div>
      )}
      
      {hasActiveFilters && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs text-muted-foreground hover:text-foreground"
          onClick={onClearFilters}
        >
          Tout effacer
        </Button>
      )}
    </div>
  );
};

export default ActiveFiltersList;
