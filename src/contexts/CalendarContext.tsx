
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
  leadId?: string;
  leadName?: string;
}

interface CalendarContextType {
  events: Event[];
  addEvent: (event: Omit<Event, 'id'>) => void;
  deleteEvent: (id: string) => void;
  updateEvent: (updatedEvent: Event) => void;
  markEventComplete: (id: string) => void;
  selectedDate?: Date;
  setSelectedDate: (date: Date | undefined) => void;
  view: 'month' | 'week';
  setView: (view: 'month' | 'week') => void;
  activeFilters: TaskType[];
  toggleFilter: (filter: TaskType) => void;
  isAddEventOpen: boolean;
  setIsAddEventOpen: (isOpen: boolean) => void;
  newEvent: Omit<Event, 'id' | 'date'>;
  setNewEvent: React.Dispatch<React.SetStateAction<Omit<Event, 'id' | 'date'>>>;
  handleAddEvent: () => void;
  refreshEvents: () => void;
  selectedAgent: string | null;
  onAgentChange: (agentId: string | null) => void;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

interface CalendarProviderProps {
  children: ReactNode;
  initialSelectedAgent?: string | null;
  onAgentChange?: (agentId: string | null) => void;
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

export const CalendarProvider: React.FC<CalendarProviderProps> = ({ 
  children, 
  initialSelectedAgent = null,
  onAgentChange: externalAgentChange
}) => {
  const [events, setEvents] = useState<Event[]>(() => {
    try {
      const storedEvents = localStorage.getItem('calendarEvents');
      const parsedEvents = storedEvents ? JSON.parse(storedEvents) : [];
      
      // Convert string dates to Date objects
      return parsedEvents.map((event: any) => ({
        ...event,
        date: new Date(event.date)
      }));
    } catch (error) {
      console.error("Failed to load events from localStorage, defaulting to empty array.", error);
      return [];
    }
  });

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');
  const [activeFilters, setActiveFilters] = useState<TaskType[]>([]);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(initialSelectedAgent);
  
  const [newEvent, setNewEvent] = useState<Omit<Event, 'id' | 'date'>>({
    time: '09:00',
    title: '',
    description: '',
    category: 'Call',
    color: eventCategories[0].color
  });

  useEffect(() => {
    // Convert Date objects to ISO strings for storage
    const eventsForStorage = events.map(event => ({
      ...event,
      date: event.date.toISOString()
    }));
    localStorage.setItem('calendarEvents', JSON.stringify(eventsForStorage));
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
        event.id === id && isSameDay(event.date, new Date()) 
          ? { ...event, title: `✅ ${event.title}`, isCompleted: true } 
          : event
      )
    );
  };

  const toggleFilter = (filter: TaskType) => {
    setActiveFilters(prevFilters =>
      prevFilters.includes(filter)
        ? prevFilters.filter(f => f !== filter)
        : [...prevFilters, filter]
    );
  };

  const handleAddEvent = () => {
    if (selectedDate && newEvent.title) {
      addEvent({
        ...newEvent,
        date: selectedDate
      });

      // Reset new event form
      setNewEvent({
        time: '09:00',
        title: '',
        description: '',
        category: 'Call',
        color: eventCategories[0].color
      });

      setIsAddEventOpen(false);
    }
  };

  const refreshEvents = () => {
    console.log("Refreshing events...");
    try {
      const storedEvents = localStorage.getItem('calendarEvents');
      if (storedEvents) {
        const parsedEvents = JSON.parse(storedEvents);
        // Convert string dates to Date objects
        setEvents(parsedEvents.map((event: any) => ({
          ...event,
          date: new Date(event.date)
        })));
      }
    } catch (error) {
      console.error("Failed to refresh events from localStorage", error);
    }
  };

  const onAgentChange = (agentId: string | null) => {
    setSelectedAgent(agentId);
    if (externalAgentChange) {
      externalAgentChange(agentId);
    }
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
    toggleFilter,
    isAddEventOpen,
    setIsAddEventOpen,
    newEvent,
    setNewEvent,
    handleAddEvent,
    refreshEvents,
    selectedAgent,
    onAgentChange,
  };

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
};
