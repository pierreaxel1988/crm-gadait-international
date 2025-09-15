
import React from 'react';
import { X } from 'lucide-react';
import { LeadStatus } from '@/components/common/StatusBadge';
import { LeadTag } from '@/components/common/TagBadge';
import TagBadge from '@/components/common/TagBadge';
import { PurchaseTimeframe, PropertyType } from '@/types/lead';
import { FilterOptions } from '@/components/pipeline/PipelineFilters';
import { Button } from '@/components/ui/button';

interface ActiveFiltersListProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onClearFilters: () => void;
  getTeamMemberName: (id: string) => string;
  isFilterActive: (filterName: string) => boolean;
}

const ActiveFiltersList = ({ 
  filters, 
  onFilterChange, 
  onClearFilters, 
  getTeamMemberName,
  isFilterActive 
}: ActiveFiltersListProps) => {
  // Check if any filters are active by using the isFilterActive function
  const hasActiveFilters = 
    isFilterActive('status') || 
    isFilterActive('statuses') ||
    isFilterActive('tags') || 
    isFilterActive('assignedTo') || 
    isFilterActive('budget') || 
    isFilterActive('location') || 
    isFilterActive('country') || 
    isFilterActive('purchaseTimeframe') || 
    isFilterActive('propertyType') ||
    isFilterActive('propertyTypes');

  if (!hasActiveFilters) {
    return (
      <div className="text-sm text-muted-foreground italic">
        Aucun filtre actif - Affichage de tous les leads
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5 items-center">
      {/* Remove the "Filtres actifs:" label since it's now in the header */}
      
      {filters.statuses && filters.statuses.length > 0 && (
        <div className="bg-primary/15 text-primary text-xs rounded-md px-2 py-1 flex items-center gap-1 border border-primary/20">
          <span className="font-medium">Statuts:</span> {filters.statuses.join(', ')}
          <button 
            onClick={() => onFilterChange({...filters, statuses: []})}
            className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
      
      {filters.status && (
        <div className="bg-primary/15 text-primary text-xs rounded-md px-2 py-1 flex items-center gap-1 border border-primary/20">
          <span className="font-medium">Statut:</span> {filters.status}
          <button 
            onClick={() => onFilterChange({...filters, status: null})}
            className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
          >
            <X className="h-3 w-3" />
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
        <div className="bg-primary/15 text-primary text-xs rounded-md px-2 py-1 flex items-center gap-1 border border-primary/20">
          <span className="font-medium">Agent:</span> {getTeamMemberName(filters.assignedTo)}
          <button 
            onClick={() => onFilterChange({...filters, assignedTo: null})}
            className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
      
      {filters.country && (
        <div className="bg-primary/15 text-primary text-xs rounded-md px-2 py-1 flex items-center gap-1 border border-primary/20">
          <span className="font-medium">Pays:</span> {filters.country}
          <button 
            onClick={() => onFilterChange({...filters, country: ''})}
            className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
      
      {(filters.minBudget || filters.maxBudget) && (
        <div className="bg-primary/15 text-primary text-xs rounded-md px-2 py-1 flex items-center gap-1 border border-primary/20">
          <span className="font-medium">Budget:</span> {filters.minBudget ? `${filters.minBudget}` : '0€'} - {filters.maxBudget ? `${filters.maxBudget}` : '∞'}
          <button 
            onClick={() => onFilterChange({...filters, minBudget: '', maxBudget: ''})}
            className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
      
      {filters.location && (
        <div className="bg-primary/15 text-primary text-xs rounded-md px-2 py-1 flex items-center gap-1 border border-primary/20">
          <span className="font-medium">Lieu:</span> {filters.location}
          <button 
            onClick={() => onFilterChange({...filters, location: ''})}
            className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
      
      {filters.propertyTypes && filters.propertyTypes.length > 0 && (
        <div className="bg-primary/15 text-primary text-xs rounded-md px-2 py-1 flex items-center gap-1 border border-primary/20">
          <span className="font-medium">Types:</span> {filters.propertyTypes.join(', ')}
          <button 
            onClick={() => onFilterChange({...filters, propertyTypes: []})}
            className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
      
      {filters.purchaseTimeframe && (
        <div className="bg-primary/15 text-primary text-xs rounded-md px-2 py-1 flex items-center gap-1 border border-primary/20">
          <span className="font-medium">Délai:</span> {filters.purchaseTimeframe === 'Moins de trois mois' ? '< 3 mois' : '> 3 mois'}
          <button 
            onClick={() => onFilterChange({...filters, purchaseTimeframe: null})}
            className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
      
      {filters.propertyType && (
        <div className="bg-primary/15 text-primary text-xs rounded-md px-2 py-1 flex items-center gap-1 border border-primary/20">
          <span className="font-medium">Type:</span> {filters.propertyType}
          <button 
            onClick={() => onFilterChange({...filters, propertyType: null})}
            className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ActiveFiltersList;
