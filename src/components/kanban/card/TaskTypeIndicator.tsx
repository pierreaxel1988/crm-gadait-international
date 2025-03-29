
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
        return <Phone className="h-4 w-4" />;
      case 'Visites':
        return <Home className="h-4 w-4" />;
      case 'Compromis':
        return <FileCheck className="h-4 w-4" />;
      case 'Acte de vente':
        return <FileSignature className="h-4 w-4" />;
      case 'Contrat de Location':
        return <FileSignature className="h-4 w-4" />;
      case 'Propositions':
        return <MessageSquare className="h-4 w-4" />;
      case 'Follow up':
        return <Calendar className="h-4 w-4" />;
      case 'Estimation':
        return <Calculator className="h-4 w-4" />;
      case 'Prospection':
        return <Search className="h-4 w-4" />;
      case 'Admin':
        return <AreaChart className="h-4 w-4" />;
      default:
        return null;
    }
  };
  
  const getTaskTypeColor = (type: TaskType) => {
    switch (type) {
      case 'Call':
        return {
          bg: '#FFF5F1',
          text: '#C55F3E',
          icon: '#C55F3E'
        };
      case 'Visites':
        return {
          bg: '#F4F3FF',
          text: '#9B51E0',
          icon: '#9B51E0'
        };
      case 'Compromis':
        return {
          bg: '#EEF5FF',
          text: '#E8B64B',
          icon: '#E8B64B'
        };
      case 'Acte de vente':
        return {
          bg: '#F7FFF2',
          text: '#4CAF50',
          icon: '#4CAF50'
        };
      case 'Contrat de Location':
        return {
          bg: '#FFFBEC',
          text: '#3D8FD1',
          icon: '#3D8FD1'
        };
      case 'Propositions':
        return {
          bg: '#FFF2F5',
          text: '#9C27B0',
          icon: '#9C27B0'
        };
      case 'Follow up':
        return {
          bg: '#F0FFFE',
          text: '#E91E63',
          icon: '#E91E63'
        };
      case 'Estimation':
        return {
          bg: '#F8F3FF',
          text: '#009688',
          icon: '#009688'
        };
      case 'Prospection':
        return {
          bg: '#FFF5F1',
          text: '#F44336',
          icon: '#F44336'
        };
      case 'Admin':
        return {
          bg: '#F5F5F5',
          text: '#607D8B',
          icon: '#607D8B'
        };
      default:
        return {
          bg: '#F5F5F5',
          text: '#607D8B',
          icon: '#607D8B'
        };
    }
  };
  
  const colorConfig = getTaskTypeColor(taskType);
  
  return (
    <div 
      className="flex items-center gap-1.5 rounded-full px-3 py-1 transition-all duration-200 shadow-sm border max-w-fit"
      style={{ 
        backgroundColor: colorConfig.bg,
        borderColor: `${colorConfig.text}20`,
        color: colorConfig.text
      }}
    >
      <div className="flex items-center justify-center" style={{ color: colorConfig.icon }}>
        {getTaskTypeIcon(taskType)}
      </div>
      <span className="text-xs font-futura uppercase tracking-wide whitespace-nowrap">{taskType}</span>
    </div>
  );
};

export default TaskTypeIndicator;
