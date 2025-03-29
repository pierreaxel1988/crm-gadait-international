
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
            className={`text-xs ${typeFilter === type ? 'ring-2 ring-loro-terracotta ring-offset-1' : ''}`}
            onClick={() => setTypeFilter(type)}
            style={{
              backgroundColor: typeFilter === type ? getColorForTaskType(type) : 'transparent'
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
