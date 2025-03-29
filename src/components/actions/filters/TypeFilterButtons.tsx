
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tag } from 'lucide-react';
import { TaskType } from '@/components/kanban/KanbanCard';
import { eventCategories } from '@/contexts/CalendarContext';

interface TypeFilterButtonsProps {
  typeFilter: TaskType | 'all';
  setTypeFilter: (type: TaskType | 'all') => void;
}

const TypeFilterButtons: React.FC<TypeFilterButtonsProps> = ({ typeFilter, setTypeFilter }) => {
  const taskTypes: TaskType[] = [
    'Call', 
    'Visites', 
    'Compromis', 
    'Acte de vente', 
    'Contrat de Location', 
    'Propositions', 
    'Follow up', 
    'Estimation', 
    'Prospection', 
    'Admin'
  ];

  // Helper function to get color for a task type
  const getColorForTaskType = (type: TaskType): string => {
    const category = eventCategories.find(cat => cat.value === type);
    return category?.color || '#F5F5F5';
  };
  
  // Get text color for each task type
  const getTextColorForTaskType = (type: TaskType): string => {
    switch (type) {
      case 'Call': return '#C55F3E';
      case 'Visites': return '#9B51E0';
      case 'Compromis': return '#E8B64B';
      case 'Acte de vente': return '#4CAF50';
      case 'Contrat de Location': return '#3D8FD1';
      case 'Propositions': return '#9C27B0';
      case 'Follow up': return '#E91E63';
      case 'Estimation': return '#009688';
      case 'Prospection': return '#F44336';
      case 'Admin': return '#607D8B';
      default: return '#607D8B';
    }
  };

  return (
    <div>
      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
        <Tag className="h-4 w-4" /> Type d'action
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Button
          variant={typeFilter === 'all' ? "default" : "outline"}
          size="sm"
          className="text-xs"
          onClick={() => setTypeFilter('all')}
        >
          Tous
        </Button>
        {taskTypes.map(type => (
          <Button
            key={type}
            variant="outline"
            size="sm"
            className={`text-xs max-w-fit ${typeFilter === type ? 'ring-2 ring-offset-1' : ''}`}
            onClick={() => setTypeFilter(type)}
            style={{
              backgroundColor: typeFilter === type ? getColorForTaskType(type) : 'transparent',
              borderColor: typeFilter === type ? getTextColorForTaskType(type) + '20' : undefined,
              color: typeFilter === type ? getTextColorForTaskType(type) : undefined,
              ...(typeFilter === type ? { ringColor: getTextColorForTaskType(type) } : {})
            }}
          >
            {type}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default TypeFilterButtons;
