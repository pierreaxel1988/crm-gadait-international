
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

  // Helper function to get color for a task type (synchronize with TaskTypeIndicator)
  const getColorForTaskType = (type: TaskType): string => {
    switch (type) {
      case 'Call':
        return '#EBD5CE'; // Light beige/pink
      case 'Visites':
        return '#A78BFA'; // Purple
      case 'Compromis':
        return '#FCD34D'; // Amber/gold
      case 'Acte de vente':
        return '#EF4444'; // Red
      case 'Contrat de Location':
        return '#3B82F6'; // Blue
      case 'Propositions':
        return '#EC4899'; // Magenta
      case 'Follow up':
        return '#F3E9D6'; // Beige
      case 'Estimation':
        return '#14B8A6'; // Teal
      case 'Prospection':
        return '#F97316'; // Orange
      case 'Admin':
        return '#9BA3AD'; // Gray
      default:
        return '#F5F5F0'; // Default loro-white
    }
  };
  
  // Get background color class based on task type (for consistency with TaskTypeIndicator)
  const getBgClassForTaskType = (type: TaskType): string => {
    switch (type) {
      case 'Call':
        return 'bg-[#EBD5CE] border-amber-200'; 
      case 'Visites':
        return 'bg-purple-50 border-purple-200';
      case 'Compromis':
        return 'bg-amber-50 border-amber-200';
      case 'Acte de vente':
        return 'bg-red-50 border-red-200';
      case 'Contrat de Location':
        return 'bg-blue-50 border-blue-200';
      case 'Propositions':
        return 'bg-indigo-50 border-indigo-200';
      case 'Follow up':
        return 'bg-[#F3E9D6] border-pink-200';
      case 'Estimation':
        return 'bg-teal-50 border-teal-200';
      case 'Prospection':
        return 'bg-orange-50 border-orange-200';
      case 'Admin':
        return 'bg-gray-50 border-gray-200';
      default:
        return '';
    }
  };
  
  // Get icon for task type (matching TaskTypeIndicator)
  const getIconForTaskType = (type: TaskType): JSX.Element | null => {
    switch (type) {
      case 'Call':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
          </svg>
        );
      case 'Visites':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        );
      case 'Compromis':
      case 'Admin':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        );
      case 'Acte de vente':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
            <polyline points="9 11 12 14 22 4"></polyline>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
          </svg>
        );
      case 'Contrat de Location':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
            <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
            <path d="M9 9h6v6H9z"></path>
            <path d="M9 1v3"></path>
            <path d="M15 1v3"></path>
            <path d="M9 20v3"></path>
            <path d="M15 20v3"></path>
            <path d="M20 9h3"></path>
            <path d="M20 14h3"></path>
            <path d="M1 9h3"></path>
            <path d="M1 14h3"></path>
          </svg>
        );
      case 'Propositions':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        );
      case 'Follow up':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        );
      case 'Estimation':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <line x1="11" y1="8" x2="11" y2="14"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </svg>
        );
      case 'Prospection':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        );
      default:
        return null;
    }
  };
  
  // Get text color for each task type
  const getTextColorForTaskType = (type: TaskType): string => {
    switch (type) {
      case 'Call':
        return '#D05A76'; // Dark rose/pink
      case 'Visites':
        return '#5B21B6'; // Dark purple
      case 'Compromis':
        return '#92400E'; // Dark amber
      case 'Acte de vente':
        return '#B91C1C'; // Dark red
      case 'Contrat de Location':
        return '#1E40AF'; // Dark blue
      case 'Propositions':
        return '#831843'; // Dark pink
      case 'Follow up':
        return '#B58C59'; // Dark beige
      case 'Estimation':
        return '#115E59'; // Dark teal
      case 'Prospection':
        return '#7C2D12'; // Dark orange
      case 'Admin':
        return '#1F2937'; // Dark gray
      default:
        return '#221F26'; // Dark text
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
          const bgColor = isSelected ? getColorForTaskType(type) : 'transparent';
          const textColor = isSelected ? getTextColorForTaskType(type) : '#8E9196';
          const icon = getIconForTaskType(type);
          
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
                color: textColor,
                fontWeight: isSelected ? 600 : 400,
                fontFamily: 'Futura, Optima, Verdana, Geneva, sans-serif',
                letterSpacing: '0.035em',
                boxShadow: isSelected ? '0 2px 5px rgba(139, 111, 78, 0.1)' : undefined,
                transition: 'all 0.2s ease-out',
                outline: 'none'
              }}
            >
              {isSelected && icon}
              {type}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default TypeFilterButtons;
