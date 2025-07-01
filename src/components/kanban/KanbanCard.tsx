
import React from 'react';
import { cn } from '@/lib/utils';
import { LeadStatus } from '@/components/common/StatusBadge';
import { LeadTag } from '@/components/common/TagBadge';
import { Card, CardContent } from "@/components/ui/card";
import { PipelineType } from '@/types/lead';

// Import sub-components
import ContactInfo from './card/ContactInfo';
import PropertyInfo from './card/PropertyInfo';
import TaskTypeIndicator from './card/TaskTypeIndicator';
import AssignedUser from './card/AssignedUser';
import ImportInfo from './card/ImportInfo';
import TagList from './card/TagList';
import RestoreActions from './card/RestoreActions';

// Import hooks and utilities
import { useAuth } from '@/hooks/useAuth';
import { getTaskStatus } from './utils/taskStatusUtils';
import { getCardBorderClass } from './utils/cardStyleUtils';
import { useDragHandlers } from './hooks/useDragHandlers';
import { useCardHandlers } from './hooks/useCardHandlers';

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
  const { isAdmin } = useAuth();
  
  // Debug des informations du lead
  console.log(`KanbanCard: ${item.name}`, {
    id: item.id,
    status: item.status,
    pipelineType: item.pipelineType,
    providedPipelineType: pipelineType,
    deleted_at: item.deleted_at
  });

  // Get task status using utility function
  const { isOverdue, isTaskToday, isFutureTask, hasScheduledAction } = getTaskStatus(item.nextFollowUpDate);

  // Get handlers
  const { handleCardClick, handleAssignClick, handleLinkClick } = useCardHandlers(item);
  const { handleDragStart, handleDragEnd } = useDragHandlers(item, draggable);

  // Get card styling
  const cardBorderClass = getCardBorderClass(
    item.status, 
    isOverdue, 
    isTaskToday, 
    isFutureTask, 
    hasScheduledAction
  );

  const isDeleted = item.status === 'Deleted';

  return (
    <Card 
      className={cn(
        'border shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden',
        draggable && !isDeleted && 'cursor-grab active:cursor-grabbing',
        isDeleted && 'opacity-75',
        cardBorderClass,
        className
      )}
      onClick={handleCardClick}
      draggable={draggable && !isDeleted}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
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
              isOverdue={isOverdue}
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
