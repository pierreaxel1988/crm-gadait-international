
import React from 'react';
import { 
  Phone, Home, FileCheck, FileSignature, 
  MessageSquare, Calendar, Calculator, 
  Search, AreaChart 
} from 'lucide-react';
import { TaskType } from '../KanbanCard';

interface TaskTypeIndicatorProps {
  taskType?: TaskType;
}

const TaskTypeIndicator = ({ taskType }: TaskTypeIndicatorProps) => {
  if (!taskType) return null;
  
  const getTaskTypeIcon = (type: TaskType) => {
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
  
  const getTaskTypeBackground = (type: TaskType) => {
    switch (type) {
      case 'Call':
        return '#FFF5F1';
      case 'Visites':
        return '#F4F3FF';
      case 'Compromis':
        return '#EEF5FF';
      case 'Acte de vente':
        return '#F7FFF2';
      case 'Contrat de Location':
        return '#FFFBEC';
      case 'Propositions':
        return '#FFF2F5';
      case 'Follow up':
        return '#F0FFFE';
      case 'Estimation':
        return '#F8F3FF';
      case 'Prospection':
        return '#FFF5F1';
      case 'Admin':
        return '#F5F5F5';
      default:
        return '#F5F5F5';
    }
  };
  
  return (
    <div 
      className="flex items-center gap-1 rounded-full px-2 py-0.5"
      style={{ backgroundColor: getTaskTypeBackground(taskType) }}
    >
      {getTaskTypeIcon(taskType)}
      <span className="text-xs font-futura uppercase tracking-wide">{taskType}</span>
    </div>
  );
};

export default TaskTypeIndicator;
