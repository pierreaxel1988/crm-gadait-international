
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

  // Debug logging to check what filters are being applied
  console.log("Applying filters:", JSON.stringify(filters, null, 2));

  return columns.map(column => {
    let filteredItems = column.items;
    
    // Filter by status if status filter is applied
    if (filters.status !== null) {
      filteredItems = filteredItems.filter(item => item.status === filters.status);
    }
    
    // Filter by tags if any are selected
    if (filters.tags.length > 0) {
      filteredItems = filteredItems.filter(item => 
        item.tags.some(tag => filters.tags.includes(tag))
      );
    }
    
    // Filter by assignedTo - using UUID comparison
    if (filters.assignedTo) {
      console.log(`Filtering by agent ID: ${filters.assignedTo}`);
      
      filteredItems = filteredItems.filter(item => {
        // Check all possible assignments that might exist in different fields
        const assignedId = item.assignedTo || item.assignedToId;
        
        console.log(`Lead: ${item.id} - Assigned to: ${assignedId}, comparing with: ${filters.assignedTo}`);
        
        // Return true if the assignment matches, considering different field names
        return assignedId === filters.assignedTo;
      });
    }
    
    // Filter by budget range
    if (filters.minBudget || filters.maxBudget) {
      filteredItems = filteredItems.filter(item => {
        if (!item.budget) return false;
        
        const numericBudget = extractNumericValue(item.budget);
        const min = filters.minBudget ? extractNumericValue(filters.minBudget) : 0;
        const max = filters.maxBudget ? extractNumericValue(filters.maxBudget) : Infinity;
        
        return numericBudget >= min && numericBudget <= max;
      });
    }
    
    // Filter by location
    if (filters.location) {
      filteredItems = filteredItems.filter(item => 
        item.desiredLocation?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    
    // Filter by purchase timeframe
    if (filters.purchaseTimeframe !== null) {
      filteredItems = filteredItems.filter(item => 
        item.purchaseTimeframe === filters.purchaseTimeframe
      );
    }
    
    // Filter by property type
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

// Utility function to extract numeric value from formatted budget string
export const extractNumericValue = (formattedValue: string): number => {
  const numericString = formattedValue.replace(/[^\d]/g, '');
  return numericString ? parseInt(numericString) : 0;
};
