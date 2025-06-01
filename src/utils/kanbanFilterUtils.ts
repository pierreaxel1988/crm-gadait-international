
import { ExtendedKanbanItem } from '@/hooks/useKanbanData';

export const extractNumericValue = (value: string | null | undefined): number => {
  if (!value) return 0;
  
  // Remove all non-numeric characters except decimal points
  const numericString = value.toString().replace(/[^\d.]/g, '');
  const numericValue = parseFloat(numericString);
  
  return isNaN(numericValue) ? 0 : numericValue;
};

export const filterByBudget = (items: ExtendedKanbanItem[], minBudget?: number, maxBudget?: number) => {
  if (!minBudget && !maxBudget) return items;
  
  return items.filter(item => {
    if (!item.budget) return false;
    
    const itemBudget = extractNumericValue(item.budget);
    
    if (minBudget && itemBudget < minBudget) return false;
    if (maxBudget && itemBudget > maxBudget) return false;
    
    return true;
  });
};

export const filterByPropertyType = (items: ExtendedKanbanItem[], propertyType?: string) => {
  if (!propertyType) return items;
  
  return items.filter(item => 
    item.propertyType?.toLowerCase().includes(propertyType.toLowerCase())
  );
};

export const filterByLocation = (items: ExtendedKanbanItem[], location?: string) => {
  if (!location) return items;
  
  return items.filter(item => 
    item.desiredLocation?.toLowerCase().includes(location.toLowerCase()) ||
    item.country?.toLowerCase().includes(location.toLowerCase())
  );
};

export const filterByAgent = (items: ExtendedKanbanItem[], agentId?: string) => {
  if (!agentId) return items;
  
  return items.filter(item => item.assignedTo === agentId);
};

export const filterByTags = (items: ExtendedKanbanItem[], tags?: string[]) => {
  if (!tags || tags.length === 0) return items;
  
  return items.filter(item => 
    tags.some(tag => 
      item.tags?.some(itemTag => {
        if (typeof itemTag === 'string') {
          return itemTag.toLowerCase().includes(tag.toLowerCase());
        } else if (itemTag && typeof itemTag === 'object' && 'name' in itemTag) {
          return itemTag.name.toLowerCase().includes(tag.toLowerCase());
        }
        return false;
      })
    )
  );
};

export const filterByTimeframe = (items: ExtendedKanbanItem[], timeframe?: string) => {
  if (!timeframe) return items;
  
  return items.filter(item => 
    item.purchaseTimeframe?.toLowerCase().includes(timeframe.toLowerCase())
  );
};

export const sortItemsByDate = (items: ExtendedKanbanItem[], ascending = false) => {
  return [...items].sort((a, b) => {
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();
    
    return ascending ? dateA - dateB : dateB - dateA;
  });
};

// Add the missing applyFiltersToColumns function
export const applyFiltersToColumns = (
  columns: Array<{
    title: string;
    status: any;
    items: ExtendedKanbanItem[];
    pipelineType?: any;
  }>,
  filters: any
) => {
  return columns.map(column => {
    let filteredItems = column.items;
    
    // Apply budget filter
    if (filters.minBudget || filters.maxBudget) {
      filteredItems = filterByBudget(
        filteredItems, 
        filters.minBudget ? parseFloat(filters.minBudget) : undefined,
        filters.maxBudget ? parseFloat(filters.maxBudget) : undefined
      );
    }
    
    // Apply property type filter
    if (filters.propertyType) {
      filteredItems = filterByPropertyType(filteredItems, filters.propertyType);
    }
    
    // Apply location filter
    if (filters.location) {
      filteredItems = filterByLocation(filteredItems, filters.location);
    }
    
    // Apply agent filter
    if (filters.assignedTo) {
      filteredItems = filterByAgent(filteredItems, filters.assignedTo);
    }
    
    // Apply tags filter
    if (filters.tags && filters.tags.length > 0) {
      filteredItems = filterByTags(filteredItems, filters.tags);
    }
    
    // Apply timeframe filter
    if (filters.purchaseTimeframe) {
      filteredItems = filterByTimeframe(filteredItems, filters.purchaseTimeframe);
    }
    
    return {
      ...column,
      items: filteredItems
    };
  });
};
