
import { ExtendedKanbanItem } from '@/hooks/useKanbanData';
import { FilterOptions } from '@/components/pipeline/PipelineFilters';

// Add this utility function to extract numeric values from budget strings
export const extractNumericValue = (value: string): number => {
  // Remove all non-digit characters and parse as float
  const numericString = value.replace(/[^\d]/g, '');
  return numericString ? parseFloat(numericString) : 0;
};

export const applyFiltersToColumns = (
  columns: { 
    title: string; 
    status: string; 
    items: ExtendedKanbanItem[]; 
  }[],
  filters?: FilterOptions,
  searchTerm?: string
) => {
  if (!filters && !searchTerm) return columns;
  
  return columns.map(column => {
    let filteredItems = [...column.items];
    
    if (filters) {
      // Filter by status (already filtered by pipeline type via the column structure)
      if (filters.status && column.status !== filters.status) {
        filteredItems = [];
      }
      
      // Filter by assignedTo
      if (filters.assignedTo && filters.assignedTo !== 'all') {
        filteredItems = filteredItems.filter(item => item.assignedToId === filters.assignedTo);
      }
      
      // Filter by propertyType
      if (filters.propertyType && filters.propertyType !== 'all') {
        filteredItems = filteredItems.filter(item => 
          item.propertyType === filters.propertyType
        );
      }
      
      // Filter by budget - if minBudget and maxBudget are defined
      if (filters.minBudget !== undefined || filters.maxBudget !== undefined) {
        filteredItems = filteredItems.filter(item => {
          // Extract numeric value from budget string (e.g., "1,000,000" -> 1000000)
          const itemBudget = item.budget ? extractNumericValue(item.budget) : 0;
          
          // Apply min filter if defined
          if (filters.minBudget !== undefined && filters.minBudget !== '' && itemBudget < extractNumericValue(filters.minBudget)) {
            return false;
          }
          
          // Apply max filter if defined
          if (filters.maxBudget !== undefined && filters.maxBudget !== '' && itemBudget > extractNumericValue(filters.maxBudget)) {
            return false;
          }
          
          return true;
        });
      }
      
      // Filter by location
      if (filters.location && filters.location !== 'all') {
        filteredItems = filteredItems.filter(item => 
          item.desiredLocation?.toLowerCase().includes(filters.location?.toLowerCase() || '') ||
          item.country?.toLowerCase() === filters.location?.toLowerCase()
        );
      }
      
      // Filter by purchaseTimeframe
      if (filters.purchaseTimeframe && filters.purchaseTimeframe !== 'all') {
        filteredItems = filteredItems.filter(item => item.purchaseTimeframe === filters.purchaseTimeframe);
      }
      
      // Filter by tags
      if (filters.tags && filters.tags.length > 0) {
        filteredItems = filteredItems.filter(item => {
          if (!item.tags || item.tags.length === 0) return false;
          
          // Check if any of the selected tags are present in the item's tags
          return filters.tags.some(tag => item.tags.includes(tag));
        });
      }
    }
    
    // Apply search term filtering
    if (searchTerm && searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase().trim();
      filteredItems = filteredItems.filter(item => {
        // Search in name, email, phone, desiredLocation, budget, and propertyType
        return (
          item.name?.toLowerCase().includes(searchLower) ||
          item.email?.toLowerCase().includes(searchLower) ||
          item.phone?.toString().includes(searchLower) ||
          item.desiredLocation?.toLowerCase().includes(searchLower) ||
          item.budget?.toLowerCase().includes(searchLower) ||
          item.propertyType?.toLowerCase().includes(searchLower) ||
          (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchLower)))
        );
      });
    }
    
    return {
      ...column,
      items: filteredItems
    };
  });
};
