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
        const matchesAssignedTo = item.assignedTo === filters.assignedTo;
        const matchesAssignedToId = item.assignedToId === filters.assignedTo;
        console.log(`Item ${item.id}: assignedTo=${item.assignedTo}, assignedToId=${item.assignedToId}, matches=${matchesAssignedTo || matchesAssignedToId}`);
        return matchesAssignedTo || matchesAssignedToId;
      });
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
