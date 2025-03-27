
import { ExtendedKanbanItem } from '@/hooks/useKanbanData';
import { FilterOptions } from '@/components/pipeline/PipelineFilters';

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
          item.propertyType === filters.propertyType || 
          (Array.isArray(item.propertyTypes) && item.propertyTypes.includes(filters.propertyType))
        );
      }
      
      // Filter by budget - if budgetMin and budgetMax are defined
      if (filters.budgetMin !== undefined || filters.budgetMax !== undefined) {
        filteredItems = filteredItems.filter(item => {
          // Extract numeric value from budget string (e.g., "1,000,000" -> 1000000)
          const itemBudget = item.budget ? parseFloat(item.budget.replace(/,/g, '')) : 0;
          
          // Apply min filter if defined
          if (filters.budgetMin !== undefined && itemBudget < filters.budgetMin) {
            return false;
          }
          
          // Apply max filter if defined
          if (filters.budgetMax !== undefined && itemBudget > filters.budgetMax) {
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
      
      // Filter by timeframe
      if (filters.timeframe && filters.timeframe !== 'all') {
        filteredItems = filteredItems.filter(item => item.purchaseTimeframe === filters.timeframe);
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
