
import React, { createContext, useState, useContext } from 'react';
import { useToast } from '@/hooks/use-toast';
import { TaskType } from '@/components/kanban/KanbanCard';

export type Event = {
  id: string;
  title: string;
  description: string;
  date: Date;
  color?: string;
  category?: TaskType;
};

// Define event categories with colors matching task types from KanbanCard
export const eventCategories = [
  { name: 'Call', color: '#FDE1D3', value: 'Call' as TaskType },
  { name: 'Visites', color: '#E5DEFF', value: 'Visites' as TaskType },
  { name: 'Compromis', color: '#D3E4FD', value: 'Compromis' as TaskType },
  { name: 'Acte de vente', color: '#F2FCE2', value: 'Acte de vente' as TaskType },
  { name: 'Contrat de Location', color: '#FEF7CD', value: 'Contrat de Location' as TaskType },
  { name: 'Propositions', color: '#FFD6E0', value: 'Propositions' as TaskType },
  { name: 'Follow up', color: '#D3FDFC', value: 'Follow up' as TaskType },
  { name: 'Estimation', color: '#E8D3FD', value: 'Estimation' as TaskType },
  { name: 'Prospection', color: '#FDD3D3', value: 'Prospection' as TaskType },
  { name: 'Admin', color: '#D3D3D3', value: 'Admin' as TaskType },
];

// Initial mock data for events
export const initialEvents: Event[] = [
  {
    id: '1',
    title: 'Visite propriété',
    description: 'Visite du bien avec la famille Martin',
    date: new Date(new Date().setDate(new Date().getDate() + 2)),
    color: '#E5DEFF',
    category: 'Visites',
  },
  {
    id: '2',
    title: 'Signature contrat',
    description: 'Signature du compromis pour la villa des Lilas',
    date: new Date(new Date().setDate(new Date().getDate() + 5)),
    color: '#D3E4FD',
    category: 'Compromis',
  },
  {
    id: '3',
    title: 'Rendez-vous banque',
    description: 'Discussion financement avec Crédit Immobilier',
    date: new Date(),
    color: '#FDD3D3',
    category: 'Prospection',
  },
  {
    id: '4',
    title: 'Tournage vidéo',
    description: 'Tournage du bien rue Victor Hugo',
    date: new Date(new Date().setDate(new Date().getDate() + 1)),
    color: '#FFD6E0',
    category: 'Propositions',
  },
  {
    id: '5',
    title: 'Déjeuner équipe',
    description: 'Restaurant Le Bistrot',
    date: new Date(new Date().setDate(new Date().getDate() + 4)),
    color: '#D3D3D3',
    category: 'Admin',
  },
];

export type CalendarContextType = {
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  events: Event[];
  setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
  view: 'month' | 'week';
  setView: React.Dispatch<React.SetStateAction<'month' | 'week'>>;
  activeFilters: TaskType[];
  setActiveFilters: React.Dispatch<React.SetStateAction<TaskType[]>>;
  isAddEventOpen: boolean;
  setIsAddEventOpen: (isOpen: boolean) => void;
  newEvent: Omit<Event, 'id' | 'date'>;
  setNewEvent: React.Dispatch<React.SetStateAction<Omit<Event, 'id' | 'date'>>>;
  toggleFilter: (category: TaskType) => void;
  handleAddEvent: () => void;
};

export const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export const CalendarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [view, setView] = useState<'month' | 'week'>('month');
  const [activeFilters, setActiveFilters] = useState<TaskType[]>([]);
  const [newEvent, setNewEvent] = useState<Omit<Event, 'id' | 'date'>>({
    title: '',
    description: '',
    color: '#FDE1D3',
    category: 'Call',
  });

  const { toast } = useToast();

  const toggleFilter = (category: TaskType) => {
    setActiveFilters(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category) 
        : [...prev, category]
    );
  };

  const handleAddEvent = () => {
    if (!selectedDate || !newEvent.title.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir au moins un titre pour l'événement",
        variant: "destructive",
      });
      return;
    }

    const categoryInfo = eventCategories.find(cat => cat.value === newEvent.category);

    const event: Event = {
      id: Date.now().toString(),
      ...newEvent,
      date: selectedDate,
      color: categoryInfo?.color || newEvent.color,
    };

    setEvents([...events, event]);
    setIsAddEventOpen(false);
    setNewEvent({ title: '', description: '', color: '#FDE1D3', category: 'Call' });
    
    toast({
      title: "Événement ajouté",
      description: `L'événement "${event.title}" a été ajouté au ${selectedDate.toLocaleDateString('fr-FR')}`,
    });
  };

  return (
    <CalendarContext.Provider
      value={{
        selectedDate,
        setSelectedDate,
        events,
        setEvents,
        isAddEventOpen,
        setIsAddEventOpen,
        view,
        setView,
        activeFilters,
        setActiveFilters,
        newEvent,
        setNewEvent,
        toggleFilter,
        handleAddEvent,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
};

export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (context === undefined) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
};
