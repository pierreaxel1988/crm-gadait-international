
import React from 'react';
import { cn } from '@/lib/utils';
import KanbanColumn from './KanbanColumn';
import { KanbanItem } from './KanbanCard';
import { LeadStatus } from '@/components/common/StatusBadge';
import { useIsMobile } from '@/hooks/use-mobile';

interface KanbanBoardProps {
  columns: {
    title: string;
    status: LeadStatus;
    items: KanbanItem[];
  }[];
  className?: string;
}

const KanbanBoard = ({ columns, className }: KanbanBoardProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={cn('luxury-card p-0 overflow-hidden', className)}>
      <div className={cn(
        "flex overflow-x-auto",
        isMobile ? "h-[calc(100vh-130px)] pb-16" : "h-[calc(100vh-170px)]"
      )}>
        {columns.map((column) => (
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
