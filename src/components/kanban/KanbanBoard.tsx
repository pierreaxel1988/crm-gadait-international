
import React from 'react';
import { cn } from '@/lib/utils';
import KanbanColumn from './KanbanColumn';
import { useIsMobile } from '@/hooks/use-mobile';
import { FilterOptions } from '@/components/pipeline/PipelineFilters';
import { useKanbanDragDrop } from '@/hooks/useKanbanDragDrop';
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
}

const KanbanBoard = ({ columns, className, filters, refreshTrigger = 0, pipelineType }: KanbanBoardProps) => {
  const isMobile = useIsMobile();
  
  console.log('===== KANBAN BOARD =====');
  console.log(`Pipeline Type: ${pipelineType}`);
  console.log(`Nombre de colonnes: ${columns.length}`);
  console.log('Colonnes initiales:', columns.map(c => `${c.title} (${c.status}): ${c.items.length} leads`).join(', '));
  
  const { handleDrop } = useKanbanDragDrop(() => {});
  
  return (
    <div className={cn('luxury-card p-0 overflow-hidden h-full', className)}>
      <div className={cn(
        "flex overflow-x-auto h-full",
        isMobile ? "pb-16" : ""
      )}>
        {columns.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <p className="text-muted-foreground">Aucune donnée disponible</p>
          </div>
        ) : (
          columns.map((column) => (
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
