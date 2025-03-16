
import { FilterOptions } from '@/components/pipeline/PipelineFilters';
import { ExtendedKanbanItem } from '@/hooks/useKanbanData';
import { LeadStatus } from '@/components/common/StatusBadge';

export const applyFiltersToColumns = (
  columns: {
    title: string;
    status: LeadStatus;
    items: ExtendedKanbanItem[];
  }[],
  filters: FilterOptions | undefined
) => {
  if (!filters) return columns;

  return columns.map(column => {
    let filteredItems = column.items;
    
    // Filter by tags if any are selected
    if (filters.tags.length > 0) {
      filteredItems = filteredItems.filter(item => 
        item.tags.some(tag => filters.tags.includes(tag))
      );
    }
    
    // Filter by assignedTo
    if (filters.assignedTo) {
      filteredItems = filteredItems.filter(item => {
        // Check if the item has an assignedTo property that matches the filter
        // This can be either the name or the ID
        if (typeof item.assignedTo === 'string') {
          return item.assignedTo === filters.assignedTo || 
                 item.assignedToId === filters.assignedTo;
        }
        return false;
      });
    }
    
    // Apply budget filters if provided
    if (filters.minBudget || filters.maxBudget) {
      filteredItems = filteredItems.filter(item => {
        if (!item.budget) return false;
        
        const budget = parseInt(item.budget.replace(/[^\d]/g, ''));
        const min = filters.minBudget ? parseInt(filters.minBudget) : 0;
        const max = filters.maxBudget ? parseInt(filters.maxBudget) : Infinity;
        
        return budget >= min && budget <= max;
      });
    }
    
    // Filter by location
    if (filters.location) {
      filteredItems = filteredItems.filter(item => 
        item.desiredLocation?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    
    // Filter by purchase timeframe
    if (filters.purchaseTimeframe) {
      filteredItems = filteredItems.filter(item => 
        item.purchaseTimeframe === filters.purchaseTimeframe
      );
    }
    
    // Filter by property type
    if (filters.propertyType) {
      filteredItems = filteredItems.filter(item => 
        item.propertyType === filters.propertyType
      );
    }
    
    return {
      ...column,
      items: filteredItems
    };
  });
};
