
import React from 'react';
import { cn } from '@/lib/utils';
import KanbanCard, { KanbanItem } from './KanbanCard';
import { LeadStatus } from '@/components/common/StatusBadge';

interface KanbanColumnProps {
  title: string;
  status: LeadStatus;
  items: KanbanItem[];
  className?: string;
}

const KanbanColumn = ({ title, status, items, className }: KanbanColumnProps) => {
  return (
    <div className={cn('flex flex-col min-w-[280px] border-r border-border last:border-r-0', className)}>
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-medium">{title}</h3>
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-xs font-medium text-primary">
          {items.length}
        </span>
      </div>
      
      <div className="flex-1 p-3 overflow-y-auto space-y-3">
        {items.map((item) => (
          <KanbanCard key={item.id} item={item} />
        ))}
        
        {items.length === 0 && (
          <div className="flex items-center justify-center h-20 border border-dashed border-border rounded-md">
            <p className="text-sm text-muted-foreground">No leads in this stage</p>
          </div>
        )}
      </div>
      
      <div className="p-3 border-t border-border">
        <button className="w-full rounded-md border border-dashed border-border p-2 text-sm text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors">
          + Add Lead
        </button>
      </div>
    </div>
  );
};

export default KanbanColumn;
