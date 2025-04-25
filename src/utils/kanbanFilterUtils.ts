
import { FilterOptions } from '@/components/pipeline/PipelineFilters';
import { ExtendedKanbanItem } from '@/hooks/useKanbanData';
import { LeadStatus } from '@/components/common/StatusBadge';
import { PropertyType, PurchaseTimeframe } from '@/types/lead';

export const applyFiltersToColumns = (
  columns: {
    title: string;
    status: LeadStatus;
    items: ExtendedKanbanItem[];
  }[],
  filters: FilterOptions | undefined
) => {
  if (!filters) return columns;

  console.log("Applying filters:", JSON.stringify(filters, null, 2));

  return columns.map(column => {
    let filteredItems = column.items;
    
    if (filters.status !== null) {
      filteredItems = filteredItems.filter(item => item.status === filters.status);
    }
    
    if (filters.tags.length > 0) {
      filteredItems = filteredItems.filter(item => 
        item.tags.some(tag => filters.tags.includes(tag))
      );
    }
    
    if (filters.assignedTo) {
      console.log("Filtering by assignedTo:", filters.assignedTo);
      filteredItems = filteredItems.filter(item => {
        // Vérifier à la fois assignedTo et assignedToId
        const matchesAssignedToId = item.assignedToId === filters.assignedTo;
        const matchesAssignedTo = item.assignedTo === filters.assignedTo;
        
        if (matchesAssignedTo || matchesAssignedToId) {
          console.log(`Lead ${item.id} (${item.name}) matches agent ${filters.assignedTo}`);
        }
        
        return matchesAssignedTo || matchesAssignedToId;
      });
      
      console.log(`Filtered items count for agent ${filters.assignedTo}:`, filteredItems.length);
    }
    
    if (filters.minBudget || filters.maxBudget) {
      filteredItems = filteredItems.filter(item => {
        if (!item.budget) return false;
        
        const numericBudget = extractNumericValue(item.budget);
        const min = filters.minBudget ? extractNumericValue(filters.minBudget) : 0;
        const max = filters.maxBudget ? extractNumericValue(filters.maxBudget) : Infinity;
        
        return numericBudget >= min && numericBudget <= max;
      });
    }
    
    if (filters.location) {
      filteredItems = filteredItems.filter(item => 
        item.desiredLocation?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    
    if (filters.purchaseTimeframe !== null) {
      filteredItems = filteredItems.filter(item => 
        item.purchaseTimeframe === filters.purchaseTimeframe
      );
    }
    
    if (filters.propertyType !== null) {
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

export const extractNumericValue = (formattedValue: string): number => {
  const numericString = formattedValue.replace(/[^\d]/g, '');
  return numericString ? parseInt(numericString) : 0;
};
