
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
    return category?.color || '#F5F5F0';
  };
  
  // Get text color for each task type
  const getTextColorForTaskType = (type: TaskType): string => {
    switch (type) {
      case 'Call':
        return '#221F26'; // Dark text for light background
      case 'Compromis':
        return '#221F26'; // Dark text for gold
      default:
        return '#FFFFFF'; // White text for other categories
    }
  };

  return (
    <div>
      <h4 className="text-xs font-futuraMedium mb-2 flex items-center gap-2 text-loro-navy/90">
        <Tag className="h-4 w-4" /> Type d'action
      </h4>
      <div className="flex flex-wrap gap-2">
        <Button
          variant={typeFilter === 'all' ? "default" : "outline"}
          size="sm"
          className={`text-xs font-futura rounded-full px-3 py-1 ${typeFilter === 'all' ? 'ring-1 ring-loro-sand/40' : 'border-loro-pearl/60'}`}
          onClick={() => setTypeFilter('all')}
          style={{
            background: typeFilter === 'all' ? '#F5F4F0' : '#fff',
            color: typeFilter === 'all' ? '#221F26' : '#8E9196',
            fontWeight: 500,
            border: typeFilter === 'all' ? '1px solid rgba(211, 197, 180, 0.7)' : '1px solid rgba(211, 197, 180, 0.3)',
            boxShadow: typeFilter === 'all' ? '0 2px 5px rgba(139, 111, 78, 0.1)' : undefined,
            letterSpacing: '0.04em',
          }}
        >
          Tous
        </Button>
        {taskTypes.map(type => {
          const isSelected = typeFilter === type;
          const bgColor = getColorForTaskType(type);
          const textColor = getTextColorForTaskType(type);
          
          return (
            <Button
              key={type}
              variant="outline"
              size="sm"
              className={`text-xs font-futura rounded-full px-3 py-1 transition-all duration-200 ${isSelected ? 'ring-1 ring-offset-1 scale-105' : ''}`}
              onClick={() => setTypeFilter(type)}
              style={{
                background: isSelected ? bgColor : 'transparent',
                border: isSelected 
                  ? `1px solid rgba(211, 197, 180, 0.7)` 
                  : '1px solid rgba(211, 197, 180, 0.3)',
                color: isSelected ? textColor : '#8E9196',
                fontWeight: isSelected ? 600 : 400,
                fontFamily: 'Futura, Optima, Verdana, Geneva, sans-serif',
                letterSpacing: '0.035em',
                boxShadow: isSelected ? '0 2px 5px rgba(139, 111, 78, 0.1)' : undefined,
                transition: 'all 0.2s ease-out',
                outline: 'none'
              }}
            >
              {type}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default TypeFilterButtons;
