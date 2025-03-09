
import React from 'react';
import { Calendar, Mail, Phone, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LeadStatus } from '@/components/common/StatusBadge';
import TagBadge, { LeadTag } from '@/components/common/TagBadge';

export interface KanbanItem {
  id: string;
  name: string;
  email: string;
  phone?: string;
  tags: LeadTag[];
  assignedTo?: string;
  dueDate?: string;
  status: LeadStatus;
  pipelineType?: 'purchase' | 'rental';
}

interface KanbanCardProps {
  item: KanbanItem;
  className?: string;
}

const KanbanCard = ({ item, className }: KanbanCardProps) => {
  return (
    <div 
      className={cn(
        'luxury-card p-4 cursor-grab active:cursor-grabbing',
        className
      )}
      draggable="true"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-sm">{item.name}</h3>
      </div>
      
      <div className="mb-3 flex items-center text-xs text-muted-foreground">
        <Mail className="h-3 w-3 mr-1" />
        <span className="truncate">{item.email}</span>
      </div>
      
      {item.phone && (
        <div className="mb-3 flex items-center text-xs text-muted-foreground">
          <Phone className="h-3 w-3 mr-1" />
          <span>{item.phone}</span>
        </div>
      )}
      
      <div className="mb-3 flex flex-wrap gap-1">
        {item.tags.map((tag) => (
          <TagBadge key={tag} tag={tag} className="text-[10px]" />
        ))}
      </div>
      
      <div className="flex justify-between items-center mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
        <div className="flex items-center">
          <User className="h-3 w-3 mr-1" />
          <span>{item.assignedTo || 'Unassigned'}</span>
        </div>
        
        {item.dueDate && (
          <div className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            <span>{item.dueDate}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanCard;
