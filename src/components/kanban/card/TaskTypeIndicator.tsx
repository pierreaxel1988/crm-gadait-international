
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
          bg: '#E7F7E4',  // WhatsApp-style light green background
          text: '#25D366', // WhatsApp brand green
          icon: '#25D366'  // WhatsApp brand green
        };
      case 'Visites':
        return {
          bg: '#F4F3FF',  // Light purple background
          text: '#9B51E0', // Purple
          icon: '#9B51E0'
        };
      case 'Compromis':
        return {
          bg: '#FFF8E6',  // Light gold background
          text: '#E8B64B', // Gold
          icon: '#E8B64B'
        };
      case 'Acte de vente':
        return {
          bg: '#E8F5E9',  // Light green background
          text: '#4CAF50', // Green
          icon: '#4CAF50'
        };
      case 'Contrat de Location':
        return {
          bg: '#E3F2FD',  // Light blue background
          text: '#3D8FD1', // Blue
          icon: '#3D8FD1'
        };
      case 'Propositions':
        return {
          bg: '#F3E5F5',  // Light magenta background
          text: '#9C27B0', // Magenta
          icon: '#9C27B0'
        };
      case 'Follow up':
        return {
          bg: '#FCE4EC',  // Light pink background
          text: '#E91E63', // Pink
          icon: '#E91E63'
        };
      case 'Estimation':
        return {
          bg: '#E0F2F1',  // Light teal background
          text: '#009688', // Teal
          icon: '#009688'
        };
      case 'Prospection':
        return {
          bg: '#FFEBEE',  // Light red background
          text: '#F44336', // Red
          icon: '#F44336'
        };
      case 'Admin':
        return {
          bg: '#ECEFF1',  // Light blue-grey background
          text: '#607D8B', // Blue Grey
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
