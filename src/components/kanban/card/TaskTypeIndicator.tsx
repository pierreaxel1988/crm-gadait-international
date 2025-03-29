
import React from 'react';
import { Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TaskType } from '@/components/kanban/KanbanCard';

interface TaskTypeIndicatorProps {
  taskType?: TaskType;
  className?: string;
  phoneNumber?: string;
}

const TaskTypeIndicator = ({ taskType, className, phoneNumber }: TaskTypeIndicatorProps) => {
  if (!taskType) return null;

  const handlePhoneClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (taskType === 'Call' && phoneNumber) {
      window.location.href = `tel:${phoneNumber}`;
    }
  };
  
  const getTaskStyles = (): { color: string; text: string; classes: string, icon?: React.ReactNode, isClickable: boolean } => {
    let isClickable = false;
    
    switch (taskType) {
      case 'Call':
        isClickable = !!phoneNumber;
        return {
          color: 'text-green-800 bg-green-50 border-green-200 hover:bg-green-100',
          text: 'Appel',
          classes: 'text-[#25D366]',
          icon: <Phone className="h-3 w-3" />,
          isClickable
        };
      case 'Visites':
        return {
          color: 'text-purple-800 bg-purple-50 border-purple-200',
          text: 'Visite',
          classes: '',
          isClickable: false
        };
      case 'Compromis':
        return {
          color: 'text-amber-800 bg-amber-50 border-amber-200',
          text: 'Compromis',
          classes: '',
          isClickable: false
        };
      case 'Acte de vente':
        return {
          color: 'text-red-800 bg-red-50 border-red-200',
          text: 'Acte',
          classes: '',
          isClickable: false
        };
      case 'Contrat de Location':
        return {
          color: 'text-blue-800 bg-blue-50 border-blue-200',
          text: 'Location',
          classes: '',
          isClickable: false
        };
      case 'Propositions':
        return {
          color: 'text-indigo-800 bg-indigo-50 border-indigo-200',
          text: 'Proposition',
          classes: '',
          isClickable: false
        };
      case 'Follow up':
        return {
          color: 'text-pink-800 bg-pink-50 border-pink-200',
          text: 'Follow-up',
          classes: '',
          isClickable: false
        };
      case 'Estimation':
        return {
          color: 'text-teal-800 bg-teal-50 border-teal-200',
          text: 'Estimation',
          classes: '',
          isClickable: false
        };
      case 'Prospection':
        return {
          color: 'text-orange-800 bg-orange-50 border-orange-200',
          text: 'Prospection',
          classes: '',
          isClickable: false
        };
      case 'Admin':
      default:
        return {
          color: 'text-gray-800 bg-gray-50 border-gray-200',
          text: taskType,
          classes: '',
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
      {icon}
      <span className={cn("text-xs font-medium whitespace-nowrap", classes)}>
        {text}
      </span>
      {isClickable && <Phone className="h-3 w-3 ml-1" />}
    </div>
  );
};

export default TaskTypeIndicator;
