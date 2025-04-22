
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { isSameDay } from 'date-fns';
import { TaskType } from '@/types/actionHistory';

export interface Event {
  id: string;
  date: Date;
  time: string;
  title: string;
  description: string;
  category: TaskType;
  color: string;
  isCompleted?: boolean;
  actionId?: string;
  assignedToId?: string;
  assignedToName?: string;
}

export interface CalendarContextType {
  events: Event[];
  addEvent: (event: Omit<Event, 'id'>) => void;
  deleteEvent: (id: string) => void;
  updateEvent: (updatedEvent: Event) => void;
  markEventComplete: (id: string) => void;
  selectedDate?: Date;
  setSelectedDate?: (date: Date) => void;
  view?: string;
  setView?: (view: string) => void;
  activeFilters?: string[];
  isAddEventOpen?: boolean;
  setIsAddEventOpen?: (isOpen: boolean) => void;
  newEvent?: Partial<Event>;
  setNewEvent?: (event: Partial<Event>) => void;
  handleAddEvent?: () => void;
  refreshEvents?: () => void;
  selectedAgent?: string;
  onAgentChange?: (agentId: string) => void;
  toggleFilter?: (filter: string) => void;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

interface CalendarProviderProps {
  children: ReactNode;
}

export const eventCategories = [
  { name: 'Appel', value: 'Call' as TaskType, color: '#D05A76' },
  { name: 'Visite', value: 'Visit' as TaskType, color: '#7E69AB' },
  { name: 'Compromis', value: 'Contract' as TaskType, color: '#D2B24C' },
  { name: 'Acte de vente', value: 'Sales Act' as TaskType, color: '#403E43' },
  { name: 'Contrat de Location', value: 'Rental Contract' as TaskType, color: '#9F9EA1' },
  { name: 'Proposition', value: 'Offer' as TaskType, color: '#6E59A5' },
  { name: 'Follow-up', value: 'Follow Up' as TaskType, color: '#AAADB0' },
  { name: 'Estimation', value: 'Estimation' as TaskType, color: '#A68C6D' },
  { name: 'Prospection', value: 'Prospecting' as TaskType, color: '#8E9196' },
  { name: 'Admin', value: 'Admin' as TaskType, color: '#8E9196' },
];

export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error("useCalendar must be used within a CalendarProvider");
  }
  return context;
};

export const CalendarProvider: React.FC<CalendarProviderProps> = ({ children }) => {
  const [events, setEvents] = useState<Event[]>(() => {
    try {
      const storedEvents = localStorage.getItem('calendarEvents');
      return storedEvents ? JSON.parse(storedEvents) : [];
    } catch (error) {
      console.error("Failed to load events from localStorage, defaulting to empty array.", error);
      return [];
    }
  });

  // Additional state for extended functionality
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<string>('month');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [isAddEventOpen, setIsAddEventOpen] = useState<boolean>(false);
  const [newEvent, setNewEvent] = useState<Partial<Event>>({});
  const [selectedAgent, setSelectedAgent] = useState<string>('');

  useEffect(() => {
    localStorage.setItem('calendarEvents', JSON.stringify(events));
  }, [events]);

  const addEvent = (event: Omit<Event, 'id'>) => {
    const newEvent: Event = { ...event, id: uuidv4(), date: new Date(event.date) };
    setEvents(prevEvents => [...prevEvents, newEvent]);
  };

  const deleteEvent = (id: string) => {
    setEvents(prevEvents => prevEvents.filter(event => event.id !== id));
  };

  const updateEvent = (updatedEvent: Event) => {
    setEvents(prevEvents =>
      prevEvents.map(event => (event.id === updatedEvent.id ? updatedEvent : event))
    );
  };

  const markEventComplete = (id: string) => {
    setEvents(prevEvents =>
      prevEvents.map(event =>
        event.id === id && isSameDay(event.date, new Date()) ? { ...event, title: `✅ ${event.title}`, isCompleted: true } : event
      )
    );
  };

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter) 
        : [...prev, filter]
    );
  };

  const refreshEvents = useCallback(() => {
    // Simulate refresh by reloading from localStorage
    try {
      const storedEvents = localStorage.getItem('calendarEvents');
      if (storedEvents) {
        setEvents(JSON.parse(storedEvents));
      }
    } catch (error) {
      console.error("Failed to refresh events", error);
    }
  }, []);

  const handleAddEvent = () => {
    if (newEvent.title && newEvent.date) {
      addEvent({
        title: newEvent.title,
        description: newEvent.description || '',
        date: newEvent.date,
        time: newEvent.time || '09:00',
        category: newEvent.category as TaskType || 'Call',
        color: newEvent.color || '#D05A76',
        assignedToId: newEvent.assignedToId,
        assignedToName: newEvent.assignedToName,
      } as Omit<Event, 'id'>);
      
      setNewEvent({});
      setIsAddEventOpen(false);
    }
  };

  const onAgentChange = (agentId: string) => {
    setSelectedAgent(agentId);
  };

  const value: CalendarContextType = {
    events,
    addEvent,
    deleteEvent,
    updateEvent,
    markEventComplete,
    selectedDate,
    setSelectedDate,
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
  };

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
};
