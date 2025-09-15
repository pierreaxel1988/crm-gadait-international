
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
    <div className="flex flex-wrap gap-2 items-center mt-3 pt-3 border-t border-border/50">
      {/* Remove the "Filtres actifs:" label since it's now in the header */}
      
      {filters.statuses && filters.statuses.length > 0 && (
        <div className="flex items-center gap-1 bg-background border border-border rounded-md px-2 py-1 text-sm">
          <span className="text-muted-foreground">Statuts:</span> 
          <span className="font-medium">{filters.statuses.join(', ')}</span>
          <button 
            onClick={() => onFilterChange({...filters, statuses: []})}
            className="ml-1 hover:bg-muted rounded-full p-1 transition-colors"
            aria-label="Supprimer les filtres statuts"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
      
      {filters.status && (
        <div className="flex items-center gap-1 bg-background border border-border rounded-md px-2 py-1 text-sm">
          <span className="text-muted-foreground">Statut:</span> 
          <span className="font-medium">{filters.status}</span>
          <button 
            onClick={() => onFilterChange({...filters, status: null})}
            className="ml-1 hover:bg-muted rounded-full p-1 transition-colors"
            aria-label="Supprimer le filtre statut"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
      
      {filters.tags.map(tag => (
        <div key={tag} className="flex items-center gap-1 bg-background border border-border rounded-md px-2 py-1 text-sm">
          <TagBadge tag={tag} className="text-xs" />
          <button 
            onClick={() => onFilterChange({...filters, tags: filters.tags.filter(t => t !== tag)})}
            className="ml-1 hover:bg-muted rounded-full p-1 transition-colors"
            aria-label={`Supprimer le tag ${tag}`}
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
      
      {filters.assignedTo && (
        <div className="flex items-center gap-1 bg-background border border-border rounded-md px-2 py-1 text-sm">
          <span className="text-muted-foreground">Agent:</span> 
          <span className="font-medium">{getTeamMemberName(filters.assignedTo)}</span>
          <button 
            onClick={() => onFilterChange({...filters, assignedTo: null})}
            className="ml-1 hover:bg-muted rounded-full p-1 transition-colors"
            aria-label="Supprimer le filtre agent"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
      
      {filters.country && (
        <div className="flex items-center gap-1 bg-background border border-border rounded-md px-2 py-1 text-sm">
          <span className="text-muted-foreground">Pays:</span> 
          <span className="font-medium">{filters.country}</span>
          <button 
            onClick={() => onFilterChange({...filters, country: ''})}
            className="ml-1 hover:bg-muted rounded-full p-1 transition-colors"
            aria-label="Supprimer le filtre pays"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
      
      {(filters.minBudget || filters.maxBudget) && (
        <div className="flex items-center gap-1 bg-background border border-border rounded-md px-2 py-1 text-sm">
          <span className="text-muted-foreground">Budget:</span> 
          <span className="font-medium">{filters.minBudget ? `${filters.minBudget}` : '0€'} - {filters.maxBudget ? `${filters.maxBudget}` : '∞'}</span>
          <button 
            onClick={() => onFilterChange({...filters, minBudget: '', maxBudget: ''})}
            className="ml-1 hover:bg-muted rounded-full p-1 transition-colors"
            aria-label="Supprimer le filtre budget"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
      
      {filters.location && (
        <div className="flex items-center gap-1 bg-background border border-border rounded-md px-2 py-1 text-sm">
          <span className="text-muted-foreground">Lieu:</span> 
          <span className="font-medium">{filters.location}</span>
          <button 
            onClick={() => onFilterChange({...filters, location: ''})}
            className="ml-1 hover:bg-muted rounded-full p-1 transition-colors"
            aria-label="Supprimer le filtre lieu"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
      
      {filters.propertyTypes && filters.propertyTypes.length > 0 && (
        <div className="flex items-center gap-1 bg-background border border-border rounded-md px-2 py-1 text-sm">
          <span className="text-muted-foreground">Types:</span> 
          <span className="font-medium">{filters.propertyTypes.join(', ')}</span>
          <button 
            onClick={() => onFilterChange({...filters, propertyTypes: []})}
            className="ml-1 hover:bg-muted rounded-full p-1 transition-colors"
            aria-label="Supprimer les filtres types"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
      
      {filters.purchaseTimeframe && (
        <div className="flex items-center gap-1 bg-background border border-border rounded-md px-2 py-1 text-sm">
          <span className="text-muted-foreground">Délai:</span> 
          <span className="font-medium">{filters.purchaseTimeframe === 'Moins de trois mois' ? '< 3 mois' : '> 3 mois'}</span>
          <button 
            onClick={() => onFilterChange({...filters, purchaseTimeframe: null})}
            className="ml-1 hover:bg-muted rounded-full p-1 transition-colors"
            aria-label="Supprimer le filtre délai"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
      
      {filters.propertyType && (
        <div className="flex items-center gap-1 bg-background border border-border rounded-md px-2 py-1 text-sm">
          <span className="text-muted-foreground">Type:</span> 
          <span className="font-medium">{filters.propertyType}</span>
          <button 
            onClick={() => onFilterChange({...filters, propertyType: null})}
            className="ml-1 hover:bg-muted rounded-full p-1 transition-colors"
            aria-label="Supprimer le filtre type"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ActiveFiltersList;
