
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
      item.tags?.some(itemTag => 
        typeof itemTag === 'string' 
          ? itemTag.toLowerCase().includes(tag.toLowerCase())
          : itemTag.name.toLowerCase().includes(tag.toLowerCase())
      )
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
