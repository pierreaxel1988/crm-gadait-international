
import React from 'react';
import { Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TaskType } from '@/components/kanban/KanbanCard';

interface TaskTypeIndicatorProps {
  taskType?: TaskType;
  className?: string;
  phoneNumber?: string;
  dueDate?: string;
  isCompleted?: boolean;
}

const TaskTypeIndicator = ({ taskType, className, phoneNumber, dueDate, isCompleted }: TaskTypeIndicatorProps) => {
  if (!taskType) return null;

  const handlePhoneClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (taskType === 'Call' && phoneNumber) {
      window.location.href = `tel:${phoneNumber}`;
    }
  };
  
  // Determine if the task is overdue
  const isOverdue = () => {
    if (!dueDate || isCompleted) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDateObj = new Date(dueDate);
    dueDateObj.setHours(0, 0, 0, 0);
    return dueDateObj < today;
  };

  const getTaskStyles = (): { color: string; text: string; classes: string, icon?: React.ReactNode, isClickable: boolean } => {
    let isClickable = false;
    
    // Base styles based on task type
    let baseStyles = {
      color: '',
      text: '',
      classes: '',
      icon: undefined as React.ReactNode | undefined,
      isClickable: false
    };
    
    switch (taskType) {
      case 'Call':
        isClickable = !!phoneNumber;
        baseStyles = {
          color: 'text-green-800 bg-green-50 border-green-200 hover:bg-green-100',
          text: 'Appel',
          classes: 'text-[#25D366]',
          icon: <Phone className="h-3 w-3" />,
          isClickable
        };
        break;
      case 'Visites':
        baseStyles = {
          color: 'text-purple-800 bg-purple-50 border-purple-200',
          text: 'Visite',
          classes: '',
          isClickable: false
        };
        break;
      case 'Compromis':
        baseStyles = {
          color: 'text-amber-800 bg-amber-50 border-amber-200',
          text: 'Compromis',
          classes: '',
          isClickable: false
        };
        break;
      case 'Acte de vente':
        baseStyles = {
          color: 'text-red-800 bg-red-50 border-red-200',
          text: 'Acte',
          classes: '',
          isClickable: false
        };
        break;
      case 'Contrat de Location':
        baseStyles = {
          color: 'text-blue-800 bg-blue-50 border-blue-200',
          text: 'Location',
          classes: '',
          isClickable: false
        };
        break;
      case 'Propositions':
        baseStyles = {
          color: 'text-indigo-800 bg-indigo-50 border-indigo-200',
          text: 'Proposition',
          classes: '',
          isClickable: false
        };
        break;
      case 'Follow up':
        baseStyles = {
          color: 'text-pink-800 bg-pink-50 border-pink-200',
          text: 'Follow-up',
          classes: '',
          isClickable: false
        };
        break;
      case 'Estimation':
        baseStyles = {
          color: 'text-teal-800 bg-teal-50 border-teal-200',
          text: 'Estimation',
          classes: '',
          isClickable: false
        };
        break;
      case 'Prospection':
        baseStyles = {
          color: 'text-orange-800 bg-orange-50 border-orange-200',
          text: 'Prospection',
          classes: '',
          isClickable: false
        };
        break;
      case 'Admin':
      default:
        baseStyles = {
          color: 'text-gray-800 bg-gray-50 border-gray-200',
          text: taskType,
          classes: '',
          isClickable: false
        };
    }
    
    // Apply status-based styles
    if (isCompleted) {
      // Completed tasks get a more subdued appearance
      return {
        ...baseStyles,
        color: 'text-gray-600 bg-gray-50 border-gray-200',
        classes: 'text-gray-600'
      };
    } else if (isOverdue()) {
      // Overdue tasks get a red/pink highlight
      return {
        ...baseStyles,
        color: 'text-rose-700 bg-[#FFDEE2]/50 border-rose-300 hover:bg-[#FFDEE2]/70',
        classes: 'text-rose-700'
      };
    } else {
      // Future tasks get a green highlight
      return {
        ...baseStyles,
        color: baseStyles.color || 'text-green-700 bg-[#F2FCE2]/50 border-green-300 hover:bg-[#F2FCE2]/70',
        classes: baseStyles.classes || 'text-green-700'
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
      {icon}
      <span className={cn("text-xs font-medium whitespace-nowrap", classes)}>
        {text}
      </span>
      {isClickable && <Phone className="h-3 w-3 ml-1" />}
    </div>
  );
};

export default TaskTypeIndicator;
