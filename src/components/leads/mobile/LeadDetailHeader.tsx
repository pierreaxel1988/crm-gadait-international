
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Phone, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { formatBudget, getActionStatusStyle } from '@/components/pipeline/mobile/utils/leadFormatUtils';
import { Currency } from '@/types/lead';
import { LeadStatus } from '@/components/common/StatusBadge';
import { TaskType } from '@/components/kanban/KanbanCard';
import TagList from '@/components/kanban/card/TagList';
import ContactInfo from '@/components/kanban/card/ContactInfo';
import PropertyInfo from '@/components/kanban/card/PropertyInfo';
import TaskTypeIndicator from '@/components/kanban/card/TaskTypeIndicator';
import AssignedUser from '@/components/kanban/card/AssignedUser';
import { isPast, isToday } from 'date-fns';

interface LeadDetailHeaderProps {
  name: string;
  createdAt?: string;
  phone?: string;
  email?: string;
  budget?: string;
  currency?: Currency;
  desiredLocation?: string;
  country?: string;
  purchaseTimeframe?: string;
  onBackClick: () => void;
  onSave: () => void;
  isSaving: boolean;
  hasChanges: boolean;
  tags?: string[];
  status?: LeadStatus;
  nextFollowUpDate?: string;
  taskType?: TaskType;
  propertyType?: string;
  bedrooms?: number[];
  assignedTo?: string;
  url?: string;
  views?: string[];
  amenities?: string[];
  id: string;
}

const LeadDetailHeader: React.FC<LeadDetailHeaderProps> = ({
  id,
  name,
  createdAt,
  phone,
  email,
  budget,
  currency,
  desiredLocation,
  onBackClick,
  status,
  nextFollowUpDate,
  taskType,
  tags = [],
  propertyType,
  bedrooms,
  assignedTo,
  url,
  views,
  amenities
}) => {
  // Fonctions de gestion des événements
  const handleAssignClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Navigation vers la page d'édition du lead pour assigner un commercial
    // Implementation serait ici
  };
  
  const handleLinkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (url) {
      window.open(url, '_blank');
    }
  };
  
  // Fonctions pour déterminer le style en fonction du statut de la tâche
  const isOverdue = () => {
    if (!nextFollowUpDate) return false;
    const followUpDate = new Date(nextFollowUpDate);
    return isPast(followUpDate) && !isToday(followUpDate);
  };

  // Déterminer la couleur de fond en fonction du statut de la tâche
  const getCardBorderClass = () => {
    if (isOverdue()) {
      return 'bg-[#FFDEE2]/30'; // Soft pink background for overdue tasks
    } else if (nextFollowUpDate && isToday(new Date(nextFollowUpDate))) {
      return 'bg-amber-50'; // Light amber background
    } else if (nextFollowUpDate) {
      return 'bg-[#e3f7ed]/80'; // Light green background with 80% opacity
    }
    return '';
  };
  
  return (
    <div className={`flex flex-col p-3 ${getCardBorderClass()}`}>
      {/* Header avec bouton back et actions */}
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full border-gray-200 mr-3 bg-white"
            onClick={onBackClick}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* En-tête avec nom et tags */}
      <div className="flex justify-between items-start mb-3 mt-2">
        <h3 className="font-medium text-lg text-gray-900">{name}</h3>
        <TagList tags={tags.map(tag => ({ name: tag }))} />
      </div>
      
      {/* Informations de contact principales */}
      <ContactInfo 
        email={email} 
        phone={phone} 
        leadId={id} 
      />
      
      {/* Informations sur la propriété */}
      <PropertyInfo 
        propertyType={propertyType}
        budget={budget}
        desiredLocation={desiredLocation}
        country={undefined}
        bedrooms={bedrooms && bedrooms.length > 0 ? bedrooms[0] : undefined}
        url={url}
        onLinkClick={handleLinkClick}
      />
      
      {/* Commercial assigné et type de tâche */}
      <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
        <AssignedUser 
          assignedToId={assignedTo} 
          onAssignClick={handleAssignClick} 
        />
        
        {/* Type de tâche avec indication de statut */}
        <TaskTypeIndicator 
          taskType={taskType} 
          phoneNumber={phone}
          nextFollowUpDate={nextFollowUpDate}
          isOverdue={isOverdue()}
        />
      </div>
    </div>
  );
};

export default LeadDetailHeader;
