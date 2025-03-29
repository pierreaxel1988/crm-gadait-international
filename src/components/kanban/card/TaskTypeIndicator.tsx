
import React from 'react';
import { Phone, Calendar, FileText, ClipboardCheck, Home, Building, Send, Clock, FileSearch, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TaskType } from '@/components/kanban/KanbanCard';

interface TaskTypeIndicatorProps {
  taskType?: TaskType;
  className?: string;
  phoneNumber?: string;
  nextFollowUpDate?: string;
  isOverdue?: boolean;
}

const TaskTypeIndicator = ({ taskType, className, phoneNumber, nextFollowUpDate, isOverdue }: TaskTypeIndicatorProps) => {
  if (!taskType) return null;

  const handlePhoneClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (taskType === 'Call' && phoneNumber) {
      window.location.href = `tel:${phoneNumber}`;
    }
  };
  
  const getTaskStyles = (): { color: string; text: string; classes: string, icon: React.ReactNode, isClickable: boolean } => {
    let isClickable = false;
    
    switch (taskType) {
      case 'Call':
        isClickable = !!phoneNumber;
        return {
          color: isOverdue 
            ? 'text-red-800 bg-red-50 border-red-200 hover:bg-red-100' 
            : nextFollowUpDate 
              ? 'text-amber-800 bg-amber-50 border-amber-200 hover:bg-amber-100'
              : 'text-green-800 bg-green-50 border-green-200 hover:bg-green-100',
          text: 'Appel',
          classes: isOverdue ? 'text-red-600' : nextFollowUpDate ? 'text-amber-600' : 'text-[#25D366]',
          icon: <Phone className="h-3 w-3" />,
          isClickable
        };
      case 'Visites':
        return {
          color: isOverdue 
            ? 'text-red-800 bg-red-50 border-red-200' 
            : nextFollowUpDate 
              ? 'text-amber-800 bg-amber-50 border-amber-200'
              : 'text-purple-800 bg-purple-50 border-purple-200',
          text: 'Visite',
          classes: isOverdue ? 'text-red-600' : nextFollowUpDate ? 'text-amber-600' : '',
          icon: <Calendar className="h-3 w-3" />,
          isClickable: false
        };
      case 'Compromis':
        return {
          color: isOverdue 
            ? 'text-red-800 bg-red-50 border-red-200' 
            : nextFollowUpDate 
              ? 'text-amber-800 bg-amber-50 border-amber-200'
              : 'text-amber-800 bg-amber-50 border-amber-200',
          text: 'Compromis',
          classes: isOverdue ? 'text-red-600' : nextFollowUpDate ? 'text-amber-600' : '',
          icon: <FileText className="h-3 w-3" />,
          isClickable: false
        };
      case 'Acte de vente':
        return {
          color: isOverdue 
            ? 'text-red-800 bg-red-50 border-red-200' 
            : nextFollowUpDate 
              ? 'text-amber-800 bg-amber-50 border-amber-200'
              : 'text-red-800 bg-red-50 border-red-200',
          text: 'Acte',
          classes: isOverdue ? 'text-red-600' : nextFollowUpDate ? 'text-amber-600' : '',
          icon: <ClipboardCheck className="h-3 w-3" />,
          isClickable: false
        };
      case 'Contrat de Location':
        return {
          color: isOverdue 
            ? 'text-red-800 bg-red-50 border-red-200' 
            : nextFollowUpDate 
              ? 'text-amber-800 bg-amber-50 border-amber-200'
              : 'text-blue-800 bg-blue-50 border-blue-200',
          text: 'Location',
          classes: isOverdue ? 'text-red-600' : nextFollowUpDate ? 'text-amber-600' : '',
          icon: <Building className="h-3 w-3" />,
          isClickable: false
        };
      case 'Propositions':
        return {
          color: isOverdue 
            ? 'text-red-800 bg-red-50 border-red-200' 
            : nextFollowUpDate 
              ? 'text-amber-800 bg-amber-50 border-amber-200'
              : 'text-indigo-800 bg-indigo-50 border-indigo-200',
          text: 'Proposition',
          classes: isOverdue ? 'text-red-600' : nextFollowUpDate ? 'text-amber-600' : '',
          icon: <Send className="h-3 w-3" />,
          isClickable: false
        };
      case 'Follow up':
        return {
          color: isOverdue 
            ? 'text-red-800 bg-red-50 border-red-200' 
            : nextFollowUpDate 
              ? 'text-amber-800 bg-amber-50 border-amber-200'
              : 'text-pink-800 bg-pink-50 border-pink-200',
          text: 'Follow-up',
          classes: isOverdue ? 'text-red-600' : nextFollowUpDate ? 'text-amber-600' : '',
          icon: <Clock className="h-3 w-3" />,
          isClickable: false
        };
      case 'Estimation':
        return {
          color: isOverdue 
            ? 'text-red-800 bg-red-50 border-red-200' 
            : nextFollowUpDate 
              ? 'text-amber-800 bg-amber-50 border-amber-200'
              : 'text-teal-800 bg-teal-50 border-teal-200',
          text: 'Estimation',
          classes: isOverdue ? 'text-red-600' : nextFollowUpDate ? 'text-amber-600' : '',
          icon: <FileSearch className="h-3 w-3" />,
          isClickable: false
        };
      case 'Prospection':
        return {
          color: isOverdue 
            ? 'text-red-800 bg-red-50 border-red-200' 
            : nextFollowUpDate 
              ? 'text-amber-800 bg-amber-50 border-amber-200'
              : 'text-orange-800 bg-orange-50 border-orange-200',
          text: 'Prospection',
          classes: isOverdue ? 'text-red-600' : nextFollowUpDate ? 'text-amber-600' : '',
          icon: <Users className="h-3 w-3" />,
          isClickable: false
        };
      case 'Admin':
      default:
        return {
          color: isOverdue 
            ? 'text-red-800 bg-red-50 border-red-200' 
            : nextFollowUpDate 
              ? 'text-amber-800 bg-amber-50 border-amber-200'
              : 'text-gray-800 bg-gray-50 border-gray-200',
          text: taskType,
          classes: isOverdue ? 'text-red-600' : nextFollowUpDate ? 'text-amber-600' : '',
          icon: <FileText className="h-3 w-3" />,
          isClickable: false
        };
    }
  };

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
      {isClickable && <Phone className={cn("h-3 w-3 ml-1", classes)} />}
    </div>
  );
};

export default TaskTypeIndicator;
