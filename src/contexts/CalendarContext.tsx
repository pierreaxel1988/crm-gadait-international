
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { TaskType } from '@/components/kanban/KanbanCard';

// Export the Event type
export interface Event {
  id: string;
  title: string;
  description?: string;
  date: Date;
  time?: string;
  category?: TaskType;
  color: string;
  // Add other properties that might have been missing
  actionId?: string;
  assignedToId?: string;
  assignedToName?: string;
  isCompleted?: boolean;
  leadName?: string;
}

export const eventCategories = [
  { name: 'Call', value: 'Call' as TaskType, color: '#25D366' }, // WhatsApp brand green
  { name: 'Visites', value: 'Visites' as TaskType, color: '#9B51E0' }, // Purple
  { name: 'Compromis', value: 'Compromis' as TaskType, color: '#E8B64B' }, // Gold
  { name: 'Acte de vente', value: 'Acte de vente' as TaskType, color: '#4CAF50' }, // Green
  { name: 'Contrat de Location', value: 'Contrat de Location' as TaskType, color: '#3D8FD1' }, // Blue
  { name: 'Propositions', value: 'Propositions' as TaskType, color: '#9C27B0' }, // Magenta
  { name: 'Follow up', value: 'Follow up' as TaskType, color: '#E91E63' }, // Pink
  { name: 'Estimation', value: 'Estimation' as TaskType, color: '#009688' }, // Teal
  { name: 'Prospection', value: 'Prospection' as TaskType, color: '#F44336' }, // Red
  { name: 'Admin', value: 'Admin' as TaskType, color: '#607D8B' }, // Blue Grey
];

export interface CalendarContextType {
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  events: Event[];
  view: 'month' | 'week';
  setView: (view: 'month' | 'week') => void;
  activeFilters: TaskType[];
  isAddEventOpen: boolean;
  setIsAddEventOpen: (isOpen: boolean) => void;
  newEvent: Omit<Event, 'id' | 'date'>;
  setNewEvent: React.Dispatch<React.SetStateAction<Omit<Event, 'id' | 'date'>>>;
  handleAddEvent: () => void;
  refreshEvents: () => void;
  selectedAgent: string | null;
  onAgentChange: (agentId: string | null) => void;
  toggleFilter: (category: TaskType) => void;
  markEventComplete: (eventId: string) => Promise<void>;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error("useCalendar must be used within a CalendarProvider");
  }
  return context;
};

interface CalendarProviderProps {
  children: ReactNode;
}

export const CalendarProvider: React.FC<CalendarProviderProps> = ({ children }) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [view, setView] = useState<'month' | 'week'>('month');
  const [activeFilters, setActiveFilters] = useState<TaskType[]>([]);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [newEvent, setNewEvent] = useState<Omit<Event, 'id' | 'date'>>({
    title: '',
    description: '',
    time: '09:00',
    category: 'Call',
    color: '#25D366'
  });
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  // Charger les événements depuis le localStorage au démarrage
  React.useEffect(() => {
    refreshEvents();
  }, []);

  const refreshEvents = async () => {
    try {
      const storedEvents = localStorage.getItem('calendarEvents');
      const initialEvents: Event[] = storedEvents ? JSON.parse(storedEvents) : [];
      setEvents(initialEvents);
    } catch (error) {
      console.error("Error fetching events from localStorage:", error);
    }
  };

  const handleAddEvent = () => {
    if (!selectedDate) return;

    const newEventWithId: Event = {
      id: crypto.randomUUID(),
      date: selectedDate,
      ...newEvent
    };

    setEvents(prevEvents => {
      const updatedEvents = [...prevEvents, newEventWithId];
      localStorage.setItem('calendarEvents', JSON.stringify(updatedEvents));
      return updatedEvents;
    });

    setIsAddEventOpen(false);
    setNewEvent({
      title: '',
      description: '',
      time: '09:00',
      category: 'Call',
      color: '#25D366'
    });
  };

  const onAgentChange = (agentId: string | null) => {
    setSelectedAgent(agentId);
  };

  const toggleFilter = (category: TaskType) => {
    setActiveFilters(prevFilters => {
      if (prevFilters.includes(category)) {
        return prevFilters.filter(filter => filter !== category);
      } else {
        return [...prevFilters, category];
      }
    });
  };
  
  const markEventComplete = async (eventId: string): Promise<void> => {
    setEvents(prevEvents => {
      const updatedEvents = prevEvents.map(event => {
        if (event.id === eventId) {
          return { ...event, isCompleted: true };
        }
        return event;
      });
      localStorage.setItem('calendarEvents', JSON.stringify(updatedEvents));
      return updatedEvents;
    });
  };

  const value: CalendarContextType = {
    selectedDate,
    setSelectedDate,
    events,
    view,
    setView,
    activeFilters,
    isAddEventOpen,
    setIsAddEventOpen,
    newEvent,
    setNewEvent,
    handleAddEvent,
    refreshEvents,
    selectedAgent,
    onAgentChange,
    toggleFilter,
    markEventComplete
  };

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
};
