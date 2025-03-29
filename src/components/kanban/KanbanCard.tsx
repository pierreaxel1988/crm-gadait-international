
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LeadStatus } from '@/components/common/StatusBadge';
import { LeadTag } from '@/components/common/TagBadge';
import { Card, CardContent } from "@/components/ui/card";

// Import sub-components
import ContactInfo from './card/ContactInfo';
import PropertyInfo from './card/PropertyInfo';
import TaskTypeIndicator from './card/TaskTypeIndicator';
import AssignedUser from './card/AssignedUser';
import ImportInfo from './card/ImportInfo';
import TagList from './card/TagList';

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
  // Ajout des propriétés supplémentaires
  propertyType?: string;
  budget?: string;
  desiredLocation?: string;
  country?: string;
  bedrooms?: number;
  url?: string;
  createdAt?: string;
  importedAt?: string;
}

interface KanbanCardProps {
  item: KanbanItem;
  className?: string;
  draggable?: boolean;
  pipelineType?: 'purchase' | 'rental';
}

const KanbanCard = ({ item, className, draggable = false, pipelineType }: KanbanCardProps) => {
  const navigate = useNavigate();
  
  // Debug des informations du lead
  console.log(`KanbanCard: ${item.name}`, {
    id: item.id,
    status: item.status,
    pipelineType: item.pipelineType,
    providedPipelineType: pipelineType
  });

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

  return (
    <Card 
      className={cn(
        'border shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden',
        'bg-white',
        draggable && 'cursor-grab active:cursor-grabbing',
        className
      )}
      onClick={handleCardClick}
      draggable={draggable}
      onDragStart={draggable ? handleDragStart : undefined}
      onDragEnd={draggable ? handleDragEnd : undefined}
    >
      <CardContent className="p-4">
        {/* En-tête avec nom et tags */}
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-medium text-sm text-gray-900">{item.name}</h3>
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
        <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
          <AssignedUser 
            assignedToId={item.assignedTo} 
            onAssignClick={handleAssignClick} 
          />
          
          {/* Type de tâche */}
          <TaskTypeIndicator taskType={item.taskType} phoneNumber={item.phone} />
        </div>
      </CardContent>
    </Card>
  );
};

export default KanbanCard;
