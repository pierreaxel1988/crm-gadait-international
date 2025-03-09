
import React from 'react';
import { cn } from '@/lib/utils';
import KanbanColumn from './KanbanColumn';
import { KanbanItem } from './KanbanCard';
import { LeadStatus } from '@/components/common/StatusBadge';
import { useIsMobile } from '@/hooks/use-mobile';
import { FilterOptions } from '../pipeline/PipelineFilters';
import { PropertyType, PurchaseTimeframe } from '@/types/lead';

// Extend KanbanItem with the additional properties needed for filtering
interface ExtendedKanbanItem extends KanbanItem {
  budget?: string;
  desiredLocation?: string;
  purchaseTimeframe?: PurchaseTimeframe;
  propertyType?: PropertyType;
}

interface KanbanBoardProps {
  columns: {
    title: string;
    status: LeadStatus;
    items: ExtendedKanbanItem[];
  }[];
  className?: string;
  filters?: FilterOptions;
}

const KanbanBoard = ({ columns, className, filters }: KanbanBoardProps) => {
  const isMobile = useIsMobile();
  
  // Apply filters to the items in each column
  const filteredColumns = columns.map(column => {
    let filteredItems = column.items;
    
    if (filters) {
      // Filter by tags if any are selected
      if (filters.tags.length > 0) {
        filteredItems = filteredItems.filter(item => 
          item.tags.some(tag => filters.tags.includes(tag))
        );
      }
      
      // Filter by assignedTo
      if (filters.assignedTo) {
        filteredItems = filteredItems.filter(item => 
          item.assignedTo === filters.assignedTo
        );
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
    }
    
    return {
      ...column,
      items: filteredItems
    };
  });
  
  return (
    <div className={cn('luxury-card p-0 overflow-hidden', className)}>
      <div className={cn(
        "flex overflow-x-auto",
        isMobile ? "h-[calc(100vh-130px)] pb-16" : "h-[calc(100vh-170px)]"
      )}>
        {filteredColumns.map((column) => (
          <KanbanColumn
            key={column.status}
            title={column.title}
            status={column.status}
            items={column.items}
            className={cn(
              "flex-1",
              isMobile && "min-w-[250px]" // Slightly narrower columns on mobile
            )}
          />
        ))}
      </div>
    </div>
  );
};

export default KanbanBoard;
