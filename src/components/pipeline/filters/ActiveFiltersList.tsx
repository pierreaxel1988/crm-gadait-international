
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
      
      {filters.statuses && filters.statuses.map(status => (
        <div key={status} className="flex items-center gap-0.5 bg-muted/60 rounded-full px-2 py-1 text-xs">
          <span className="text-xs text-foreground font-medium">{status}</span>
          <button 
            onClick={() => onFilterChange({...filters, statuses: filters.statuses.filter(s => s !== status)})}
            className="ml-0.5 hover:bg-destructive/10 active:bg-destructive/20 hover:text-destructive active:scale-95 rounded-full p-0.5 transition-all duration-150"
            aria-label={`Supprimer le statut ${status}`}
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </div>
      ))}
      
      {filters.status && (
        <div className="flex items-center gap-0.5 bg-muted/60 rounded-full px-2 py-1 text-xs">
          <span className="text-xs text-foreground font-medium">{filters.status}</span>
          <button 
            onClick={() => onFilterChange({...filters, status: null})}
            className="ml-0.5 hover:bg-destructive/10 active:bg-destructive/20 hover:text-destructive active:scale-95 rounded-full p-0.5 transition-all duration-150"
            aria-label="Supprimer le filtre statut"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </div>
      )}
      
      {filters.tags.map(tag => (
        <div key={tag} className="flex items-center gap-0.5 bg-amber-100/70 dark:bg-amber-900/30 rounded-full px-2 py-1 text-xs">
          <span className="text-xs text-foreground font-medium">{tag}</span>
          <button 
            onClick={() => onFilterChange({...filters, tags: filters.tags.filter(t => t !== tag)})}
            className="ml-0.5 hover:bg-destructive/10 active:bg-destructive/20 hover:text-destructive active:scale-95 rounded-full p-0.5 transition-all duration-150"
            aria-label={`Supprimer le tag ${tag}`}
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </div>
      ))}
      
      {filters.assignedTo && (
        <div className="flex items-center gap-0.5 bg-blue-100/70 dark:bg-blue-900/30 rounded-full px-2 py-1 text-xs">
          <span className="text-xs text-foreground font-medium">{getTeamMemberName(filters.assignedTo)}</span>
          <button 
            onClick={() => {
              console.log('Removing assignedTo filter. Current filters:', filters);
              onFilterChange({...filters, assignedTo: null});
              console.log('After filter change, new filters should be:', {...filters, assignedTo: null});
            }}
            className="ml-0.5 hover:bg-destructive/10 active:bg-destructive/20 hover:text-destructive active:scale-95 rounded-full p-0.5 transition-all duration-150"
            aria-label="Supprimer le filtre agent"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </div>
      )}
      
      {filters.country && (
        <div className="flex items-center gap-0.5 bg-green-100/70 dark:bg-green-900/30 rounded-full px-2 py-1 text-xs">
          <span className="text-xs text-foreground font-medium">{filters.country}</span>
          <button 
            onClick={() => onFilterChange({...filters, country: ''})}
            className="ml-0.5 hover:bg-destructive/10 active:bg-destructive/20 hover:text-destructive active:scale-95 rounded-full p-0.5 transition-all duration-150"
            aria-label="Supprimer le filtre pays"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </div>
      )}
      
      {(filters.minBudget || filters.maxBudget) && (
        <div className="flex items-center gap-0.5 bg-emerald-100/70 dark:bg-emerald-900/30 rounded-full px-2 py-1 text-xs">
          <span className="text-xs text-foreground font-medium">{filters.minBudget ? `${filters.minBudget}` : '0€'} - {filters.maxBudget ? `${filters.maxBudget}` : '∞'}</span>
          <button 
            onClick={() => onFilterChange({...filters, minBudget: '', maxBudget: ''})}
            className="ml-0.5 hover:bg-destructive/10 active:bg-destructive/20 hover:text-destructive active:scale-95 rounded-full p-0.5 transition-all duration-150"
            aria-label="Supprimer le filtre budget"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </div>
      )}
      
      {filters.location && (
        <div className="flex items-center gap-0.5 bg-purple-100/70 dark:bg-purple-900/30 rounded-full px-2 py-1 text-xs">
          <span className="text-xs text-foreground font-medium">{filters.location}</span>
          <button 
            onClick={() => onFilterChange({...filters, location: ''})}
            className="ml-0.5 hover:bg-destructive/10 active:bg-destructive/20 hover:text-destructive active:scale-95 rounded-full p-0.5 transition-all duration-150"
            aria-label="Supprimer le filtre lieu"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </div>
      )}
      
      {filters.propertyTypes && filters.propertyTypes.map(type => (
        <div key={type} className="flex items-center gap-0.5 bg-rose-100/70 dark:bg-rose-900/30 rounded-full px-2 py-1 text-xs">
          <span className="text-xs text-foreground font-medium">{type}</span>
          <button 
            onClick={() => onFilterChange({...filters, propertyTypes: filters.propertyTypes.filter(t => t !== type)})}
            className="ml-0.5 hover:bg-destructive/10 active:bg-destructive/20 hover:text-destructive active:scale-95 rounded-full p-0.5 transition-all duration-150"
            aria-label={`Supprimer le type ${type}`}
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </div>
      ))}
      
      {filters.purchaseTimeframe && (
        <div className="flex items-center gap-0.5 bg-orange-100/70 dark:bg-orange-900/30 rounded-full px-2 py-1 text-xs">
          <span className="text-xs text-foreground font-medium">{filters.purchaseTimeframe === 'Moins de trois mois' ? '< 3 mois' : '> 3 mois'}</span>
          <button 
            onClick={() => onFilterChange({...filters, purchaseTimeframe: null})}
            className="ml-0.5 hover:bg-destructive/10 active:bg-destructive/20 hover:text-destructive active:scale-95 rounded-full p-0.5 transition-all duration-150"
            aria-label="Supprimer le filtre délai"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </div>
      )}
      
      {filters.propertyType && (
        <div className="flex items-center gap-0.5 bg-slate-100/70 dark:bg-slate-800/30 rounded-full px-2 py-1 text-xs">
          <span className="text-xs text-foreground font-medium">{filters.propertyType}</span>
          <button 
            onClick={() => onFilterChange({...filters, propertyType: null})}
            className="ml-0.5 hover:bg-destructive/10 active:bg-destructive/20 hover:text-destructive active:scale-95 rounded-full p-0.5 transition-all duration-150"
            aria-label="Supprimer le filtre type"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ActiveFiltersList;
