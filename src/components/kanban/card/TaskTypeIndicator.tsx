
import React from 'react';
import { Phone, Calendar, FileText, ClipboardCheck, Building, Send, Clock, FileSearch, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TaskType } from '@/components/kanban/KanbanCard';

interface TaskTypeIndicatorProps {
  taskType?: TaskType;
  className?: string;
  phoneNumber?: string;
  phoneCountryCode?: string;
  nextFollowUpDate?: string;
  isOverdue?: boolean;
}

const TaskTypeIndicator = ({ 
  taskType, 
  className, 
  phoneNumber, 
  phoneCountryCode = '+33',
  nextFollowUpDate, 
  isOverdue 
}: TaskTypeIndicatorProps) => {
  if (!taskType) return null;

  const handlePhoneClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (taskType === 'Call' && phoneNumber) {
      // Use country code if available
      const formattedPhone = phoneNumber.startsWith('+') ? 
        phoneNumber : 
        `${phoneCountryCode}${phoneNumber.startsWith('0') ? phoneNumber.substring(1) : phoneNumber}`;
      
      window.location.href = `tel:${formattedPhone}`;
    }
  };
  
  const getTaskStyles = (): { color: string; text: string; classes: string, icon: React.ReactNode, isClickable: boolean } => {
    let isClickable = false;
    
    switch (taskType) {
      case 'Call':
        isClickable = !!phoneNumber;
        return {
          color: isOverdue 
            ? 'text-[#D05A76] bg-[#F8E2E8] border-pink-200 hover:bg-pink-100' 
            : 'text-[#D05A76] bg-[#EBD5CE] border-amber-200 hover:bg-amber-100',
          text: 'Appel',
          classes: 'text-[#D05A76]',
          icon: <Phone className="h-4 w-4" />,  // Harmonisation : une seule icône, taille 16px (h-4, w-4)
          isClickable
        };
      case 'Visites':
        return {
          color: 'text-purple-800 bg-purple-50 border-purple-200',
          text: 'Visite',
          classes: '',
          icon: <Calendar className="h-3 w-3" />,
          isClickable: false
        };
      case 'Compromis':
        return {
          color: 'text-amber-800 bg-amber-50 border-amber-200',
          text: 'Compromis',
          classes: '',
          icon: <FileText className="h-3 w-3" />,
          isClickable: false
        };
      case 'Acte de vente':
        return {
          color: 'text-red-800 bg-red-50 border-red-200',
          text: 'Acte',
          classes: '',
          icon: <ClipboardCheck className="h-3 w-3" />,
          isClickable: false
        };
      case 'Contrat de Location':
        return {
          color: 'text-blue-800 bg-blue-50 border-blue-200',
          text: 'Location',
          classes: '',
          icon: <Building className="h-3 w-3" />,
          isClickable: false
        };
      case 'Propositions':
        return {
          color: 'text-indigo-800 bg-indigo-50 border-indigo-200',
          text: 'Proposition',
          classes: '',
          icon: <Send className="h-3 w-3" />,
          isClickable: false
        };
      case 'Follow up':
        return {
          color: 'text-pink-800 bg-[#F3E9D6] border-pink-200',
          text: 'Follow-up',
          classes: 'text-[#B58C59]',
          icon: <Clock className="h-3 w-3" />,
          isClickable: false
        };
      case 'Estimation':
        return {
          color: 'text-teal-800 bg-teal-50 border-teal-200',
          text: 'Estimation',
          classes: '',
          icon: <FileSearch className="h-3 w-3" />,
          isClickable: false
        };
      case 'Prospection':
        return {
          color: 'text-orange-800 bg-orange-50 border-orange-200',
          text: 'Prospection',
          classes: '',
          icon: <Users className="h-3 w-3" />,
          isClickable: false
        };
      case 'Admin':
      default:
        return {
          color: 'text-gray-800 bg-gray-50 border-gray-200',
          text: taskType,
          classes: '',
          icon: <FileText className="h-3 w-3" />,
          isClickable: false
        };
    }
  };

  // Get task styling based on type and overdue status
  const { color, text, classes, icon, isClickable } = getTaskStyles();

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-full px-3 py-1 transition-all duration-200 shadow-sm border max-w-fit",
        color,
        isClickable && "cursor-pointer hover:shadow-md",
        className
      )}
      onClick={isClickable ? handlePhoneClick : undefined}
      title={isClickable ? "Cliquer pour appeler" : undefined}
    >
      {icon && <span className={cn("", classes)}>{icon}</span>}
      <span className={cn("text-xs font-medium whitespace-nowrap", classes)}>
        {text}
      </span>
      {/* Suppression de la seconde icône Phone pour harmonisation */}
    </div>
  );
};

export default TaskTypeIndicator;
