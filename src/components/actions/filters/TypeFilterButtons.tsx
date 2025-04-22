import React from 'react';
import { Button } from '@/components/ui/button';
import { Tag } from 'lucide-react';
import { TaskType } from '@/types/actionHistory';
import { eventCategories } from '@/contexts/CalendarContext';

interface TypeFilterButtonsProps {
  typeFilter: TaskType | 'all';
  setTypeFilter: (type: TaskType | 'all') => void;
}

const TypeFilterButtons: React.FC<TypeFilterButtonsProps> = ({ typeFilter, setTypeFilter }) => {
  const taskTypes: TaskType[] = [
    'Call', 
    'Visit', 
    'Contract', 
    'Sales Act', 
    'Rental Contract', 
    'Offer', 
    'Follow Up', 
    'Estimation', 
    'Prospecting', 
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
      case 'Call': return '#221F26'; // Noire premium
      case 'Visit': return '#7E69AB'; // Violet chic
      case 'Contract': return '#D2B24C'; // Gold soft
      case 'Sales Act': return '#403E43'; // Gris foncé profond
      case 'Rental Contract': return '#9F9EA1'; // Gris argenté
      case 'Offer': return '#6E59A5';
      case 'Follow Up': return '#AAADB0'; 
      case 'Estimation': return '#A68C6D'; // Crème café
      case 'Prospecting': return '#8E9196';
      case 'Admin': return '#8E9196';
      default: return '#403E43';
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
          className={`text-xs font-futura rounded-full px-3 py-1 border border-gray-200 ${typeFilter === 'all' ? 'ring-2 ring-loro-navy/30' : ''}`}
          onClick={() => setTypeFilter('all')}
          style={{
            background: typeFilter === 'all' ? '#F5F4F0' : '#fff',
            color: typeFilter === 'all' ? '#221F26' : '#888',
            fontWeight: 500,
            boxShadow: typeFilter === 'all' ? '0 2px 6px 0 #a68c6d22' : undefined,
            letterSpacing: '0.04em',
          }}
        >
          Tous
        </Button>
        {taskTypes.map(type => (
          <Button
            key={type}
            variant="outline"
            size="sm"
            className={`text-xs font-futura rounded-full px-3 py-1 border border-gray-200 transition-transform duration-200 ${typeFilter === type ? 'ring-2 ring-offset-1 scale-105' : ''}`}
            onClick={() => setTypeFilter(type)}
            style={{
              background: typeFilter === type ? '#F5F4F0' : '#fff',
              borderColor: typeFilter === type ? getTextColorForTaskType(type) + '40' : '#eee',
              color: typeFilter === type ? getTextColorForTaskType(type) : '#8E9196',
              fontWeight: typeFilter === type ? 600 : 400,
              fontFamily: 'Futura, Optima, Verdana, Geneva, sans-serif',
              letterSpacing: '0.035em',
              boxShadow: typeFilter === type ? '0 2px 8px 0 #a68c6d21' : undefined,
              transition: 'all 0.18s cubic-bezier(.68,-0.55,.27,1.55)',
              outline: 'none'
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
