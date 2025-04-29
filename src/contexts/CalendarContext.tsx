
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { TaskType } from '@/components/kanban/KanbanCard';
import { ActionItem } from '@/types/actionHistory';

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
  leadId?: string;
}

// Updated color palette to match the image
export const eventCategories = [
  { name: 'Call', value: 'Call' as TaskType, color: '#8AE2A2' }, // Light green
  { name: 'Visites', value: 'Visites' as TaskType, color: '#A48CF6' }, // Purple
  { name: 'Compromis', value: 'Compromis' as TaskType, color: '#F2D67F' }, // Gold/Yellow
  { name: 'Acte de vente', value: 'Acte de vente' as TaskType, color: '#7DD39C' }, // Green
  { name: 'Contrat de Location', value: 'Contrat de Location' as TaskType, color: '#7DB5E5' }, // Blue
  { name: 'Propositions', value: 'Propositions' as TaskType, color: '#BB8DDE' }, // Magenta
  { name: 'Follow up', value: 'Follow up' as TaskType, color: '#F47C8A' }, // Pink
  { name: 'Estimation', value: 'Estimation' as TaskType, color: '#75BEB9' }, // Teal
  { name: 'Prospection', value: 'Prospection' as TaskType, color: '#EA8470' }, // Salmon
  { name: 'Admin', value: 'Admin' as TaskType, color: '#9BA3AD' }, // Gray
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
  syncActionsToCalendar: (actions?: ActionItem[]) => void;
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
  const [lastSyncTimestamp, setLastSyncTimestamp] = useState<number>(0);

  // Charger les événements depuis le localStorage au démarrage
  React.useEffect(() => {
    refreshEvents();
  }, []);

  const refreshEvents = useCallback(() => {
    try {
      const storedEvents = localStorage.getItem('calendarEvents');
      if (storedEvents) {
        // Parse the events and ensure the dates are properly converted
        const parsedEvents: Event[] = JSON.parse(storedEvents).map((event: any) => ({
          ...event,
          date: new Date(event.date)
        }));
        setEvents(parsedEvents);
      }
    } catch (error) {
      console.error("Error fetching events from localStorage:", error);
    }
  }, []);

  const syncActionsToCalendar = useCallback((actionItems?: ActionItem[]) => {
    try {
      // Skip if we've synced recently (within the last 10 seconds)
      const now = Date.now();
      if (now - lastSyncTimestamp < 10000 && !actionItems) {
        console.log("Skipping action sync - synced recently");
        return;
      }
      
      setLastSyncTimestamp(now);
      
      // Get existing events to retain non-action events
      const storedEvents = localStorage.getItem('calendarEvents');
      const existingEvents: Event[] = storedEvents 
        ? JSON.parse(storedEvents).filter((event: Event) => !event.actionId)
        : [];
      
      // Use provided actions or fetch from localStorage
      const actionsJson = localStorage.getItem('cachedActions');
      const actions: ActionItem[] = actionItems || (actionsJson ? JSON.parse(actionsJson) : []);
      
      if (!actions || actions.length === 0) {
        console.log("No actions found for syncing");
        return;
      }
      
      console.log(`Syncing ${actions.length} actions to calendar`);
      
      // Save actions to localStorage for future use
      if (!actionItems && actions.length > 0) {
        localStorage.setItem('cachedActions', JSON.stringify(actions));
      }
      
      // Convert actions to calendar events
      const actionEvents: Event[] = actions.map(action => {
        // Find matching category or default to "Call"
        const actionCategory = action.actionType as TaskType;
        const categoryInfo = eventCategories.find(cat => cat.value === actionCategory) || eventCategories[0];
        
        // Convert scheduled date or use created date
        const actionDate = action.scheduledDate 
          ? new Date(action.scheduledDate) 
          : action.createdAt 
            ? new Date(action.createdAt)
            : new Date();
        
        // Set time component if available, otherwise use default time
        let time: string | undefined = undefined;
        if (action.scheduledDate) {
          const date = new Date(action.scheduledDate);
          time = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        }
        
        return {
          id: action.id,
          title: `${action.actionType} - ${action.leadName}`,
          description: action.notes || undefined,
          date: actionDate,
          time: time || '09:00',
          category: actionCategory,
          color: categoryInfo.color,
          actionId: action.id,
          assignedToId: action.assignedToId,
          assignedToName: action.assignedToName,
          isCompleted: action.status === 'done',
          leadName: action.leadName,
          leadId: action.leadId
        };
      });
      
      // Combine non-action events with action events
      const combinedEvents = [...existingEvents, ...actionEvents];
      localStorage.setItem('calendarEvents', JSON.stringify(combinedEvents));
      
      // Update state
      setEvents(combinedEvents);
      console.log(`Calendar now has ${combinedEvents.length} events (${actionEvents.length} from actions)`);
    } catch (error) {
      console.error("Error syncing actions to calendar:", error);
    }
  }, [lastSyncTimestamp]);

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
    // Update the event in the local storage
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
    
    // If it's an action, try to mark the action as complete as well
    const event = events.find(e => e.id === eventId);
    if (event?.actionId) {
      try {
        // Update cached actions
        const actionsJson = localStorage.getItem('cachedActions');
        if (actionsJson) {
          const actions: ActionItem[] = JSON.parse(actionsJson);
          const updatedActions = actions.map(action => {
            if (action.id === eventId) {
              return { ...action, status: 'done', completedDate: new Date().toISOString() };
            }
            return action;
          });
          localStorage.setItem('cachedActions', JSON.stringify(updatedActions));
        }
      } catch (error) {
        console.error("Failed to update cached action:", error);
      }
    }
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
    markEventComplete,
    syncActionsToCalendar
  };

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
};
