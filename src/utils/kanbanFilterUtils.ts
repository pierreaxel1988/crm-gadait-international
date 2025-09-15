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

  // Debug logging to check what filters are being applied
  console.log("Applying filters:", JSON.stringify(filters, null, 2));

  return columns.map(column => {
    let filteredItems = column.items;
    
    // Filter by status if status filter is applied
    if (filters.status !== null) {
      // This logic was incorrectly emptying columns that don't match the filter
      // Instead, we need to filter the items in all columns and only keep items that match the status
      filteredItems = filteredItems.filter(item => item.status === filters.status);
    }
    
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
        
        // Extraction des chiffres du budget en ignorant les caractères de formatage
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
    
    // Filter by country
    if (filters.country) {
      filteredItems = filteredItems.filter(item => 
        item.country?.toLowerCase().includes(filters.country.toLowerCase())
      );
    }
    
    // Filter by purchase timeframe - fixed comparison
    if (filters.purchaseTimeframe !== null) {
      filteredItems = filteredItems.filter(item => 
        item.purchaseTimeframe === filters.purchaseTimeframe
      );
    }
    
    // Filter by property type - fixed comparison
    if (filters.propertyType !== null) {
      filteredItems = filteredItems.filter(item => 
        item.propertyType === filters.propertyType
      );
    }
    
    // Filter by multiple property types
    if (filters.propertyTypes && filters.propertyTypes.length > 0) {
      filteredItems = filteredItems.filter(item => 
        item.propertyType && filters.propertyTypes!.includes(item.propertyType as PropertyType)
      );
    }
    
    return {
      ...column,
      items: filteredItems
    };
  });
};

// Fonction utilitaire pour extraire la valeur numérique d'une chaîne de budget formatée
export const extractNumericValue = (formattedValue: string): number => {
  // Enlever tous les caractères non numériques
  const numericString = formattedValue.replace(/[^\d]/g, '');
  
  // Convertir en nombre ou retourner 0 si vide
  return numericString ? parseInt(numericString) : 0;
};
