import React from 'react';
import { X } from 'lucide-react';
import { FilterOptions } from '@/components/pipeline/types/filterTypes';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import TagBadge from '@/components/common/TagBadge';
import { SPECIFIC_AGENTS } from '@/components/actions/filters/AgentFilterButtons';

interface ActiveFilterTagsProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onClearFilters: () => void;
  className?: string;
}

const ActiveFilterTags = ({
  filters,
  onFilterChange,
  onClearFilters,
  className
}: ActiveFilterTagsProps) => {
  const getTeamMemberName = (id: string): string => {
    const agent = SPECIFIC_AGENTS.find(a => a.id === id);
    return agent ? agent.name : id;
  };

  const hasActiveFilters = 
    filters.status !== null ||
    filters.tags.length > 0 ||
    filters.assignedTo !== null ||
    filters.minBudget !== '' ||
    filters.maxBudget !== '' ||
    filters.location !== '' ||
    filters.purchaseTimeframe !== null ||
    filters.propertyType !== null;

  if (!hasActiveFilters) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {filters.status && (
        <Badge 
          variant="secondary" 
          className={cn(
            "pl-2 pr-1 py-0.5 flex items-center gap-1 hover:bg-secondary/80",
            filters.status === 'Gagné' && "bg-green-100 hover:bg-green-200",
            filters.status === 'Perdu' && "bg-red-100 hover:bg-red-200"
          )}
        >
          {filters.status}
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => onFilterChange({ ...filters, status: null })}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}

      {filters.tags.map(tag => (
        <div key={tag} className="flex items-center">
          <TagBadge tag={tag} className="text-xs" />
          <Button
            variant="ghost"
            size="sm"
            className="ml-1 bg-background rounded-full w-4 h-4 flex items-center justify-center"
            onClick={() => onFilterChange({...filters, tags: filters.tags.filter(t => t !== tag)})}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ))}

      {filters.assignedTo && (
        <Badge variant="secondary" className="pl-2 pr-1 py-0.5 flex items-center gap-1">
          {getTeamMemberName(filters.assignedTo)}
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => onFilterChange({...filters, assignedTo: null})}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}

      {(filters.minBudget || filters.maxBudget) && (
        <Badge 
          variant="secondary" 
          className="pl-2 pr-1 py-0.5 flex items-center gap-1 hover:bg-secondary/80"
        >
          Budget: {filters.minBudget ? `${filters.minBudget}` : '0€'} - {filters.maxBudget ? `${filters.maxBudget}` : '∞'}
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => onFilterChange({...filters, minBudget: '', maxBudget: ''})}
          >
            <X className="h-3 w-3 ml-1" />
          </Button>
        </Badge>
      )}

      {filters.location && (
        <Badge variant="secondary" className="pl-2 pr-1 py-0.5 flex items-center gap-1">
          {filters.location}
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => onFilterChange({...filters, location: ''})}
          >
            <X className="h-3 w-3 ml-1" />
          </Button>
        </Badge>
      )}

      {filters.purchaseTimeframe && (
        <Badge 
          variant="secondary" 
          className={cn(
            "pl-2 pr-1 py-0.5 flex items-center gap-1 hover:bg-secondary/80",
            filters.purchaseTimeframe === 'Moins de trois mois' && "bg-green-100 hover:bg-green-200",
            filters.purchaseTimeframe === 'Plus de trois mois' && "bg-red-100 hover:bg-red-200"
          )}
        >
          {filters.purchaseTimeframe === 'Moins de trois mois' ? '< 3 mois' : '> 3 mois'}
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => onFilterChange({...filters, purchaseTimeframe: null})}
          >
            <X className="h-3 w-3 ml-1" />
          </Button>
        </Badge>
      )}

      {filters.propertyType && (
        <Badge variant="secondary" className="pl-2 pr-1 py-0.5 flex items-center gap-1">
          {filters.propertyType}
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => onFilterChange({...filters, propertyType: null})}
          >
            <X className="h-3 w-3 ml-1" />
          </Button>
        </Badge>
      )}

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="text-xs text-muted-foreground hover:text-foreground ml-2"
        >
          Effacer tout
        </Button>
      )}
    </div>
  );
};

export default ActiveFilterTags;
