
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LeadStatus } from '@/components/common/StatusBadge';
import { LeadTag } from '@/components/common/TagBadge';
import { Card, CardContent } from "@/components/ui/card";
import { isPast, isToday } from 'date-fns';
import { PipelineType } from '@/types/lead';

// Import sub-components
import ContactInfo from './card/ContactInfo';
import PropertyInfo from './card/PropertyInfo';
import TaskTypeIndicator from './card/TaskTypeIndicator';
import AssignedUser from './card/AssignedUser';
import ImportInfo from './card/ImportInfo';
import TagList from './card/TagList';
import RestoreActions from './card/RestoreActions';
import { useAuth } from '@/hooks/useAuth';

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
  pipelineType?: PipelineType;
  taskType?: TaskType;
  // Ajout des propriétés supplémentaires
  propertyType?: string;
  budget?: string;
  desiredLocation?: string;
  country?: string;
  bedrooms?: number;
  url?: string;
  createdAt?: string;
  importedAt?: string;
  nextFollowUpDate?: string;
  deleted_at?: string;
}

interface KanbanCardProps {
  item: KanbanItem;
  className?: string;
  draggable?: boolean;
  pipelineType?: PipelineType;
}

const KanbanCard = ({ item, className, draggable = false, pipelineType }: KanbanCardProps) => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  
  // Debug des informations du lead
  console.log(`KanbanCard: ${item.name}`, {
    id: item.id,
    status: item.status,
    pipelineType: item.pipelineType,
    providedPipelineType: pipelineType,
    deleted_at: item.deleted_at
  });

  const handleCardClick = () => {
    // Don't navigate if this is a deleted lead (let admin decide if they want to restore first)
    if (item.status === 'Deleted') return;
    
    // Navigate to lead detail page with criteria tab preselected
    navigate(`/leads/${item.id}?tab=criteria`);
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    // Don't allow dragging deleted leads
    if (item.status === 'Deleted') {
      e.preventDefault();
      return;
    }
    
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

  const handleAssignClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Navigation vers la page d'édition du lead pour assigner un commercial
    navigate(`/leads/${item.id}?assign=true`);
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.url) {
      window.open(item.url, '_blank');
    }
  };
  
  // Déterminer si la tâche est en retard
  const isOverdue = () => {
    if (!item.nextFollowUpDate) return false;
    const followUpDateTime = new Date(item.nextFollowUpDate);
    return isPast(followUpDateTime) && !isToday(followUpDateTime);
  };

  // Déterminer la couleur de la bordure en fonction du statut de la tâche
  const getCardBorderClass = () => {
    if (item.status === 'Deleted') {
      return 'bg-red-50 border-red-200'; // Special styling for deleted leads
    } else if (isOverdue()) {
      return 'bg-[#FFDEE2]/30'; // Soft pink background for overdue tasks
    } else if (item.nextFollowUpDate && isToday(new Date(item.nextFollowUpDate))) {
      return 'bg-amber-50'; // Changed from border-amber-300 to a light amber background
    } else if (item.nextFollowUpDate) {
      return 'bg-[#e3f7ed]/80'; // Updated to #e3f7ed with 80% opacity for upcoming tasks
    }
    return '';
  };

  const isDeleted = item.status === 'Deleted';

  return (
    <Card 
      className={cn(
        'border shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden',
        'bg-white',
        draggable && !isDeleted && 'cursor-grab active:cursor-grabbing',
        isDeleted && 'opacity-75',
        getCardBorderClass(),
        className
      )}
      onClick={handleCardClick}
      draggable={draggable && !isDeleted}
      onDragStart={draggable ? handleDragStart : undefined}
      onDragEnd={draggable ? handleDragEnd : undefined}
    >
      <CardContent className="p-4">
        {/* En-tête avec nom et tags */}
        <div className="flex justify-between items-start mb-3">
          <h3 className={cn(
            "font-medium text-sm",
            isDeleted ? "text-gray-500" : "text-gray-900"
          )}>
            {item.name}
          </h3>
          <TagList tags={item.tags} />
        </div>
        
        {/* Informations de contact principales */}
        <ContactInfo 
          email={item.email} 
          phone={item.phone} 
          leadId={item.id} 
        />
        
        {/* Informations sur la propriété */}
        <PropertyInfo 
          propertyType={item.propertyType}
          budget={item.budget}
          desiredLocation={item.desiredLocation}
          country={item.country}
          bedrooms={item.bedrooms}
          url={item.url}
          onLinkClick={handleLinkClick}
        />
        
        {/* Date d'importation */}
        <ImportInfo importedAt={item.importedAt} createdAt={item.createdAt} />
        
        {/* Commercial assigné ou bouton pour assigner */}
        {!isDeleted && (
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
            <AssignedUser 
              assignedToId={item.assignedTo} 
              onAssignClick={handleAssignClick} 
            />
            
            {/* Type de tâche avec indication de statut */}
            <TaskTypeIndicator 
              taskType={item.taskType} 
              phoneNumber={item.phone}
              nextFollowUpDate={item.nextFollowUpDate}
              isOverdue={isOverdue()}
            />
          </div>
        )}
        
        {/* Actions de restauration pour les leads supprimés (visible seulement pour les admins) */}
        {isDeleted && isAdmin && (
          <RestoreActions 
            leadId={item.id} 
            leadName={item.name}
            onRestore={() => {
              // Force a refresh of the data
              window.location.reload();
            }}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default KanbanCard;
