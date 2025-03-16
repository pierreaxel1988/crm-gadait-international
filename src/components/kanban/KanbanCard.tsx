
import React from 'react';
import { Calendar, Mail, Phone, User, FileText, MessageSquare, CheckCircle, Tag, Star, Home, FileCheck, FileSignature, Calculator, Search, AreaChart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LeadStatus } from '@/components/common/StatusBadge';
import TagBadge, { LeadTag } from '@/components/common/TagBadge';
import { useNavigate } from 'react-router-dom';

export type TaskType = 
  | 'Call'
  | 'Visites'
  | 'Compromis'
  | 'Acte de vente'
  | 'Contrat de Location'
  | 'Propositions'
  | 'Follow up'
  | 'Estimation'
  | 'Prospection'
  | 'Admin';

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
  taskType?: TaskType;
}

interface KanbanCardProps {
  item: KanbanItem;
  className?: string;
  draggable?: boolean;
}

const KanbanCard = ({ item, className, draggable = false }: KanbanCardProps) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/leads/${item.id}`);
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('application/json', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'move';
    
    // Add a subtle visual effect
    setTimeout(() => {
      e.currentTarget.classList.add('opacity-50');
    }, 0);
  };
  
  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('opacity-50');
  };

  const getTaskTypeIcon = (type?: TaskType) => {
    switch (type) {
      case 'Call':
        return <Phone className="h-4 w-4 text-green-500" />;
      case 'Visites':
        return <Home className="h-4 w-4 text-purple-500" />;
      case 'Compromis':
        return <FileCheck className="h-4 w-4 text-amber-500" />;
      case 'Acte de vente':
        return <FileSignature className="h-4 w-4 text-red-500" />;
      case 'Contrat de Location':
        return <FileSignature className="h-4 w-4 text-blue-500" />;
      case 'Propositions':
        return <MessageSquare className="h-4 w-4 text-indigo-500" />;
      case 'Follow up':
        return <Calendar className="h-4 w-4 text-pink-500" />;
      case 'Estimation':
        return <Calculator className="h-4 w-4 text-teal-500" />;
      case 'Prospection':
        return <Search className="h-4 w-4 text-orange-500" />;
      case 'Admin':
        return <AreaChart className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  return (
    <div 
      className={cn(
        'luxury-card p-4 cursor-pointer hover:shadow-md transition-shadow duration-200',
        draggable && 'cursor-grab active:cursor-grabbing',
        className
      )}
      onClick={handleCardClick}
      draggable={draggable}
      onDragStart={draggable ? handleDragStart : undefined}
      onDragEnd={draggable ? handleDragEnd : undefined}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-sm">{item.name}</h3>
        {item.taskType && (
          <div className="flex items-center gap-1 bg-accent/50 rounded-full px-2 py-0.5">
            {getTaskTypeIcon(item.taskType)}
            <span className="text-xs">{item.taskType}</span>
          </div>
        )}
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
