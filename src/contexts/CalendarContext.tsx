import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { isSameDay } from 'date-fns';
import { TaskType } from '@/types/actionHistory';

interface Event {
  id: string;
  date: Date;
  time: string;
  title: string;
  description: string;
  category: TaskType;
  color: string;
}

interface CalendarContextType {
  events: Event[];
  addEvent: (event: Omit<Event, 'id'>) => void;
  deleteEvent: (id: string) => void;
  updateEvent: (updatedEvent: Event) => void;
  markEventComplete: (id: string) => void;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

interface CalendarProviderProps {
  children: ReactNode;
}

export const eventCategories = [
  { name: 'Appel', value: 'Call', color: '#D05A76' },
  { name: 'Visite', value: 'Visit', color: '#7E69AB' },
  { name: 'Compromis', value: 'Contract', color: '#D2B24C' },
  { name: 'Acte de vente', value: 'Sales Act', color: '#403E43' },
  { name: 'Contrat de Location', value: 'Rental Contract', color: '#9F9EA1' },
  { name: 'Proposition', value: 'Offer', color: '#6E59A5' },
  { name: 'Follow-up', value: 'Follow Up', color: '#AAADB0' },
  { name: 'Estimation', value: 'Estimation', color: '#A68C6D' },
  { name: 'Prospection', value: 'Prospecting', color: '#8E9196' },
  { name: 'Admin', value: 'Admin', color: '#8E9196' },
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

  useEffect(() => {
    localStorage.setItem('calendarEvents', JSON.stringify(events));
  }, [events]);

  const addEvent = (event: Omit<Event, 'id'>) => {
    const newEvent: Event = { ...event, id: uuidv4() , date: new Date(event.date) };
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
        event.id === id && isSameDay(event.date, new Date()) ? { ...event, title: `✅ ${event.title}` } : event
      )
    );
  };

  const value: CalendarContextType = {
    events,
    addEvent,
    deleteEvent,
    updateEvent,
    markEventComplete,
  };

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
};
