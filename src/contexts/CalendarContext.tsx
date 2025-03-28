
import React, { createContext, useState, useContext, useEffect } from 'react';
import { TaskType } from '@/components/kanban/KanbanCard';
import { supabase } from '@/integrations/supabase/client';
import { ActionItem, ActionStatus } from '@/types/actionHistory';
import { format, parseISO } from 'date-fns';
import { toast } from '@/hooks/use-toast';

export type Event = {
  id: string;
  date: Date;
  title: string;
  description: string;
  time: string;
  color: string;
  category: TaskType;
  leadId?: string;
  actionId?: string;
  assignedToName?: string;
};

export const eventCategories = [
  { name: 'Appel', value: 'Call' as TaskType, color: '#10b981' },
  { name: 'Visite', value: 'Visites' as TaskType, color: '#8b5cf6' },
  { name: 'Compromis', value: 'Compromis' as TaskType, color: '#f59e0b' },
  { name: 'Acte de vente', value: 'Acte de vente' as TaskType, color: '#ef4444' },
  { name: 'Contrat de Location', value: 'Contrat de Location' as TaskType, color: '#3b82f6' },
  { name: 'Propositions', value: 'Propositions' as TaskType, color: '#6366f1' },
  { name: 'Follow up', value: 'Follow up' as TaskType, color: '#ec4899' },
  { name: 'Estimation', value: 'Estimation' as TaskType, color: '#14b8a6' },
  { name: 'Prospection', value: 'Prospection' as TaskType, color: '#f97316' },
  { name: 'Admin', value: 'Admin' as TaskType, color: '#6b7280' },
];

interface CalendarContextProps {
  events: Event[];
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  view: 'month' | 'week' | 'day';
  setView: (view: 'month' | 'week' | 'day') => void;
  isAddEventOpen: boolean;
  setIsAddEventOpen: (isOpen: boolean) => void;
  activeFilters: TaskType[];
  setActiveFilters: (filters: TaskType[]) => void;
  toggleFilter: (filter: TaskType) => void;
  newEvent: Omit<Event, 'id' | 'date'>;
  setNewEvent: React.Dispatch<React.SetStateAction<Omit<Event, 'id' | 'date'>>>;
  handleAddEvent: () => void;
  refreshEvents: () => void;
}

export const CalendarContext = createContext<CalendarContextProps>({
  events: [],
  selectedDate: undefined,
  setSelectedDate: () => {},
  view: 'month',
  setView: () => {},
  isAddEventOpen: false,
  setIsAddEventOpen: () => {},
  activeFilters: [],
  setActiveFilters: () => {},
  toggleFilter: () => {},
  newEvent: { title: '', description: '', time: '', color: '', category: 'Call' },
  setNewEvent: () => {},
  handleAddEvent: () => {},
  refreshEvents: () => {},
});

export const CalendarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<TaskType[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [newEvent, setNewEvent] = useState<Omit<Event, 'id' | 'date'>>({
    title: '',
    description: '',
    time: '12:00',
    color: eventCategories[0].color,
    category: eventCategories[0].value,
  });

  const refreshEvents = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Toggle category filter
  const toggleFilter = (filter: TaskType) => {
    setActiveFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter) 
        : [...prev, filter]
    );
  };

  // Load actions from Supabase and convert them to calendar events
  useEffect(() => {
    const fetchActions = async () => {
      try {
        // Get current user info
        const { data: userData } = await supabase.auth.getUser();
        const currentUserEmail = userData?.user?.email;
        
        // Get the current user's team member id
        const { data: teamMemberData } = await supabase
          .from('team_members')
          .select('id, is_admin')
          .eq('email', currentUserEmail)
          .single();
        
        const isUserAdmin = teamMemberData?.is_admin || false;
        const currentUserId = teamMemberData?.id;
        
        // Fetch leads with their action history
        let query = supabase
          .from('leads')
          .select('id, name, action_history, assigned_to, status');
        
        // Non-admin users can only see their assigned leads
        if (!isUserAdmin && currentUserId) {
          query = query.eq('assigned_to', currentUserId);
        }
        
        const { data: leads, error } = await query;
        
        if (error) throw error;
        
        // Fetch team members for assigned_to mapping
        const { data: members } = await supabase
          .from('team_members')
          .select('id, name');
        
        const memberMap = new Map();
        members?.forEach(member => memberMap.set(member.id, member.name));
        
        // Extract actions and convert to calendar events
        let calendarEvents: Event[] = [];
        
        leads?.forEach((lead: any) => {
          const leadActions = lead.action_history || [];
          
          if (Array.isArray(leadActions)) {
            leadActions.forEach((action: any) => {
              if (action.scheduledDate) {
                // Find the category color
                const categoryInfo = eventCategories.find(cat => cat.value === action.actionType);
                const scheduledDate = new Date(action.scheduledDate);
                
                calendarEvents.push({
                  id: action.id,
                  date: scheduledDate,
                  title: `${action.actionType} - ${lead.name}`,
                  description: action.notes || '',
                  time: format(scheduledDate, 'HH:mm'),
                  color: categoryInfo?.color || '#6b7280',
                  category: action.actionType as TaskType,
                  leadId: lead.id,
                  actionId: action.id,
                  assignedToName: memberMap.get(lead.assigned_to) || 'Non assigné'
                });
              }
            });
          }
        });
        
        setEvents(calendarEvents);
      } catch (error) {
        console.error('Error fetching actions for calendar:', error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les actions pour le calendrier."
        });
      }
    };
    
    fetchActions();
  }, [refreshTrigger]);

  // Handle adding a new event
  const handleAddEvent = async () => {
    if (!selectedDate) return;
    
    try {
      const eventDate = new Date(selectedDate);
      const [hours, minutes] = newEvent.time.split(':').map(Number);
      eventDate.setHours(hours, minutes, 0, 0);
      
      // If we're adding a stand-alone calendar event (not tied to a lead)
      const eventToAdd: Event = {
        id: crypto.randomUUID(),
        date: eventDate,
        ...newEvent
      };
      
      setEvents(prev => [...prev, eventToAdd]);
      
      // Reset form
      setNewEvent({
        title: '',
        description: '',
        time: '12:00',
        color: eventCategories[0].color,
        category: eventCategories[0].value,
      });
      
      setIsAddEventOpen(false);
      
      toast({
        title: "Événement ajouté",
        description: `${eventToAdd.title} a été ajouté au calendrier.`
      });
    } catch (error) {
      console.error('Error adding event:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'ajouter l'événement."
      });
    }
  };

  return (
    <CalendarContext.Provider
      value={{
        events,
        selectedDate,
        setSelectedDate,
        view,
        setView,
        isAddEventOpen,
        setIsAddEventOpen,
        activeFilters,
        setActiveFilters,
        toggleFilter,
        newEvent,
        setNewEvent,
        handleAddEvent,
        refreshEvents
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
};

export const useCalendar = () => useContext(CalendarContext);
