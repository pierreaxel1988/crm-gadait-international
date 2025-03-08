
import React from 'react';
import { cn } from '@/lib/utils';
import KanbanColumn from './KanbanColumn';
import { KanbanItem } from './KanbanCard';
import { LeadStatus } from '@/components/common/StatusBadge';

interface KanbanBoardProps {
  columns: {
    title: string;
    status: LeadStatus;
    items: KanbanItem[];
  }[];
  className?: string;
}

const KanbanBoard = ({ columns, className }: KanbanBoardProps) => {
  return (
    <div className={cn('luxury-card p-0 overflow-hidden', className)}>
      <div className="flex overflow-x-auto h-[calc(100vh-170px)]">
        {columns.map((column) => (
          <KanbanColumn
            key={column.status}
            title={column.title}
            status={column.status}
            items={column.items}
            className="flex-1"
          />
        ))}
      </div>
    </div>
  );
};

export default KanbanBoard;
