
import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import KanbanColumn from './KanbanColumn';
import { useIsMobile } from '@/hooks/use-mobile';
import { FilterOptions } from '@/components/pipeline/PipelineFilters';
import { useKanbanDragDrop } from '@/hooks/useKanbanDragDrop';
import { LeadStatus } from '@/components/common/StatusBadge';
import { isPast, isToday } from 'date-fns';
import { sortLeadsByPriority } from '@/components/pipeline/mobile/utils/leadSortUtils';
import LoadingScreen from '@/components/layout/LoadingScreen';

interface KanbanBoardProps {
  columns: {
    title: string;
    status: LeadStatus;
    items: any[]; // Will be populated by the hook
    pipelineType?: 'purchase' | 'rental';
  }[];
  className?: string;
  filters?: FilterOptions;
  refreshTrigger?: number;
  pipelineType: 'purchase' | 'rental';
  isLoading?: boolean;
}

const KanbanBoard = ({ columns, className, filters, refreshTrigger = 0, pipelineType, isLoading = false }: KanbanBoardProps) => {
  const isMobile = useIsMobile();
  
  // Log information for debugging
  console.log('===== KANBAN BOARD =====');
  console.log(`Pipeline Type: ${pipelineType}`);
  console.log(`Number of columns: ${columns.length}`);
  
  // Only log column information if there are columns (avoid errors)
  if (columns.length > 0) {
    console.log('Columns:', columns.map(c => `${c.title} (${c.status}): ${c.items?.length || 0} leads`).join(', '));
  }
  
  const { handleDrop } = useKanbanDragDrop(() => {});
  
  // Memoize columns to prevent unnecessary re-renders and compute task status
  const memoizedColumns = useMemo(() => {
    console.log("Memoizing columns:", columns);
    // Ensure all columns have an items array even if it's empty and add computed properties
    return columns.map(col => {
      // Ajouter des propriétés calculées pour chaque élément
      const itemsWithStatus = (col.items || []).map(item => {
        let isTaskOverdue = false;
        let isTaskToday = false;
        
        if (item.nextFollowUpDate) {
          const followUpDate = new Date(item.nextFollowUpDate);
          isTaskOverdue = isPast(followUpDate) && !isToday(followUpDate);
          isTaskToday = isToday(followUpDate);
        }
        
        return {
          ...item,
          isTaskOverdue,
          isTaskToday
        };
      });
      
      // Sort items within each column by priority
      const sortedItems = sortLeadsByPriority(itemsWithStatus, 'priority');
      
      return {
        ...col,
        items: sortedItems,
        pipelineType: col.pipelineType || pipelineType
      };
    });
  }, [
    columns,
    pipelineType
  ]);
  
  if (isLoading) {
    return (
      <div className={cn('overflow-hidden h-full flex items-center justify-center', className)}>
        <LoadingScreen fullscreen={false} />
      </div>
    );
  }
  
  return (
    <div className={cn('overflow-hidden h-full', className)}>
      <div className={cn(
        "flex overflow-x-auto h-full",
        isMobile ? "pb-16" : ""
      )}>
        {memoizedColumns.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <p className="text-muted-foreground">Aucune donnée disponible</p>
          </div>
        ) : (
          memoizedColumns.map((column) => (
            <KanbanColumn
              key={column.status}
              title={column.title}
              status={column.status}
              items={column.items || []}
              className={cn(
                "flex-1 min-w-[240px]",
                isMobile && "min-w-[250px]" // Slightly narrower columns on mobile
              )}
              onDrop={handleDrop}
              pipelineType={pipelineType}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default KanbanBoard;
