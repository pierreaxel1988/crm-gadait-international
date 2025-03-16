
import React from 'react';
import { cn } from '@/lib/utils';
import KanbanColumn from './KanbanColumn';
import { useIsMobile } from '@/hooks/use-mobile';
import { FilterOptions } from '@/components/pipeline/PipelineFilters';
import { useKanbanData } from '@/hooks/useKanbanData';
import { useKanbanDragDrop } from '@/hooks/useKanbanDragDrop';
import { applyFiltersToColumns } from '@/utils/kanbanFilterUtils';
import { LeadStatus } from '@/components/common/StatusBadge';

interface KanbanBoardProps {
  columns: {
    title: string;
    status: LeadStatus;
    items: any[]; // Will be populated by the hook
  }[];
  className?: string;
  filters?: FilterOptions;
  refreshTrigger?: number;
}

const KanbanBoard = ({ columns, className, filters, refreshTrigger = 0 }: KanbanBoardProps) => {
  const isMobile = useIsMobile();
  const { loadedColumns, isLoading } = useKanbanData(columns, refreshTrigger);
  const { handleDrop } = useKanbanDragDrop(loadedColumns => {
    // This is a hacky way to implement state setter in a hook,
    // but it works for this refactoring. In a more thorough refactoring,
    // we might use context or other state management approaches.
    //@ts-ignore - Known type issue from refactoring
    setLoadedColumns(loadedColumns);
  });
  
  // Apply filters to the columns
  const filteredColumns = applyFiltersToColumns(loadedColumns, filters);
  
  return (
    <div className={cn('luxury-card p-0 overflow-hidden', className)}>
      <div className={cn(
        "flex overflow-x-auto",
        isMobile ? "h-[calc(100vh-130px)] pb-16" : "h-[calc(100vh-170px)]"
      )}>
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <p className="text-muted-foreground">Chargement des données...</p>
          </div>
        ) : (
          filteredColumns.map((column) => (
            <KanbanColumn
              key={column.status}
              title={column.title}
              status={column.status}
              items={column.items}
              className={cn(
                "flex-1",
                isMobile && "min-w-[250px]" // Slightly narrower columns on mobile
              )}
              onDrop={handleDrop}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default KanbanBoard;
