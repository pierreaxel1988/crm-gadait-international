
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
    pipelineType?: 'purchase' | 'rental';
  }[];
  className?: string;
  filters?: FilterOptions;
  refreshTrigger?: number;
  pipelineType: 'purchase' | 'rental';
  searchTerm?: string; // Add the searchTerm property
}

const KanbanBoard = ({ columns, className, filters, refreshTrigger = 0, pipelineType, searchTerm }: KanbanBoardProps) => {
  const isMobile = useIsMobile();
  
  console.log('===== KANBAN BOARD =====');
  console.log(`Pipeline Type: ${pipelineType}`);
  console.log(`Nombre de colonnes: ${columns.length}`);
  console.log('Colonnes initiales:', columns.map(c => `${c.title} (${c.status})`).join(', '));
  console.log('Search Term:', searchTerm); // Log the search term
  
  const { loadedColumns, isLoading, setLoadedColumns } = useKanbanData(columns, refreshTrigger, pipelineType);
  
  console.log('Colonnes après chargement:', loadedColumns.map(c => 
    `${c.title} (${c.status}): ${c.items.length} leads`).join(', ')
  );
  
  const { handleDrop } = useKanbanDragDrop(setLoadedColumns);
  
  // Apply filters to the columns
  const filteredColumns = applyFiltersToColumns(loadedColumns, filters, searchTerm);
  
  console.log('Colonnes après filtrage:', filteredColumns.map(c => 
    `${c.title} (${c.status}): ${c.items.length} leads`).join(', ')
  );
  
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
              pipelineType={pipelineType}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default KanbanBoard;
