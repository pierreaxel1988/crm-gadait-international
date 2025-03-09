
import React from 'react';
import { cn } from '@/lib/utils';
import KanbanCard, { KanbanItem } from './KanbanCard';
import { LeadStatus } from '@/components/common/StatusBadge';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';

interface KanbanColumnProps {
  title: string;
  status: LeadStatus;
  items: KanbanItem[];
  className?: string;
  onDrop?: (item: KanbanItem, status: LeadStatus) => void;
}

const KanbanColumn = ({ title, status, items, className, onDrop }: KanbanColumnProps) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  
  const handleAddLead = () => {
    navigate('/leads/new');
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    try {
      const itemData = JSON.parse(e.dataTransfer.getData('application/json'));
      if (itemData && itemData.id && onDrop) {
        onDrop(itemData, status);
      }
    } catch (error) {
      console.error('Error parsing dropped data:', error);
    }
  };
  
  return (
    <div className={cn(
      'flex flex-col min-w-[280px] border-r border-border last:border-r-0', 
      isMobile && 'min-w-[250px]',
      className
    )}>
      <div className="flex items-center justify-between p-3 md:p-4 border-b border-border">
        <h3 className="font-medium text-sm md:text-base">{title}</h3>
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-xs font-medium text-primary">
          {items.length}
        </span>
      </div>
      
      <div 
        className="flex-1 p-2 md:p-3 overflow-y-auto space-y-2 md:space-y-3"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {items.map((item) => (
          <KanbanCard key={item.id} item={item} draggable />
        ))}
        
        {items.length === 0 && (
          <div className="flex items-center justify-center h-16 md:h-20 border border-dashed border-border rounded-md">
            <p className="text-xs md:text-sm text-muted-foreground">No leads in this stage</p>
          </div>
        )}
      </div>
      
      {!isMobile && (
        <div className="p-3 border-t border-border">
          <button 
            className="w-full rounded-md border border-dashed border-border p-2 text-sm text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors"
            onClick={handleAddLead}
          >
            + Add Lead
          </button>
        </div>
      )}
    </div>
  );
};

export default KanbanColumn;
