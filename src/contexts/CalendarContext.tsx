import React, { createContext, useState, useContext, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { TaskType } from '@/components/kanban/KanbanCard';
import { supabase } from '@/integrations/supabase/client';
import { ActionItem, ActionStatus } from '@/types/actionHistory';
import { format } from 'date-fns';

export type Event = {
  id: string;
  title: string;
  description: string;
  date: Date;
  time?: string;
  color?: string;
  category?: TaskType;
  leadId?: string;
  leadName?: string;
  actionId?: string; // To track if this event is from an action
  isCompleted?: boolean;
};

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

export const initialEvents: Event[] = [];

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
  refreshEvents: () => Promise<void>;
  markEventComplete: (eventId: string) => Promise<void>;
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
    time: '09:00',
  });

  const { toast } = useToast();

  const fetchLeadActions = async () => {
    try {
      console.log("Fetching lead actions for calendar...");
      
      const { data: userData } = await supabase.auth.getUser();
      const currentUserEmail = userData?.user?.email;
      
      const { data: teamMemberData, error: teamMemberError } = await supabase
        .from('team_members')
        .select('id, is_admin')
        .eq('email', currentUserEmail)
        .single();
      
      if (teamMemberError) {
        console.error('Error fetching team member:', teamMemberError);
        throw teamMemberError;
      }
      
      const isUserAdmin = teamMemberData?.is_admin || false;
      const currentUserId = teamMemberData?.id;
      
      console.log("Current user info:", { isUserAdmin, currentUserId });
      
      let query = supabase
        .from('leads')
        .select('id, name, action_history, assigned_to');
      
      if (!isUserAdmin && currentUserId) {
        query = query.eq('assigned_to', currentUserId);
      }
      
      const { data: leads, error } = await query;
      
      if (error) {
        console.error('Error fetching leads:', error);
        throw error;
      }
      
      console.log(`Fetched ${leads?.length || 0} leads with action history`);
      
      const { data: members, error: membersError } = await supabase
        .from('team_members')
        .select('id, name');
      
      if (membersError) {
        console.error('Error fetching team members:', membersError);
        throw membersError;
      }
      
      const memberMap = new Map();
      members?.forEach(member => memberMap.set(member.id, member.name));
      
      let actionEvents: Event[] = [];
      
      leads?.forEach((lead: any) => {
        const leadActions = lead.action_history || [];
        
        if (Array.isArray(leadActions) && leadActions.length > 0) {
          console.log(`Processing ${leadActions.length} actions for lead: ${lead.name}`);
          
          leadActions.forEach((action: any) => {
            if (action.scheduledDate) {
              const category = eventCategories.find(cat => cat.value === action.actionType);
              
              actionEvents.push({
                id: `action-${action.id}`,
                title: `${action.actionType} - ${lead.name}`,
                description: action.notes || '',
                date: new Date(action.scheduledDate),
                time: action.scheduledDate ? format(new Date(action.scheduledDate), 'HH:mm') : undefined,
                color: category?.color || '#D3D3D3',
                category: action.actionType as TaskType,
                leadId: lead.id,
                leadName: lead.name,
                actionId: action.id,
                isCompleted: !!action.completedDate
              });
            }
          });
        } else {
          console.log(`No actions found for lead: ${lead.name}`);
        }
      });
      
      console.log(`Converted ${actionEvents.length} actions to calendar events`);
      
      setEvents([...initialEvents, ...actionEvents]);
    } catch (error) {
      console.error('Error fetching lead actions:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les actions depuis la base de données."
      });
    }
  };

  useEffect(() => {
    console.log("Initial fetch of lead actions");
    refreshEvents();
  }, []);

  const refreshEvents = async () => {
    console.log("Refreshing events...");
    await fetchLeadActions();
  };

  const markEventComplete = async (eventId: string) => {
    if (eventId.startsWith('action-')) {
      const actionId = eventId.replace('action-', '');
      
      try {
        console.log(`Marking action ${actionId} as complete`);
        
        const event = events.find(e => e.id === eventId);
        if (!event || !event.leadId) {
          console.error("Cannot find event or leadId is missing");
          return;
        }
        
        const { data: lead, error: leadError } = await supabase
          .from('leads')
          .select('action_history')
          .eq('id', event.leadId)
          .single();
        
        if (leadError) {
          console.error('Error fetching lead:', leadError);
          throw leadError;
        }
        
        if (lead && lead.action_history) {
          const actionHistory = lead.action_history as any[];
          const actionIndex = actionHistory.findIndex((a: any) => a.id === actionId);
          
          if (actionIndex !== -1) {
            actionHistory[actionIndex].completedDate = new Date().toISOString();
            
            const { error: updateError } = await supabase
              .from('leads')
              .update({ 
                action_history: actionHistory,
                last_contacted_at: new Date().toISOString()
              })
              .eq('id', event.leadId);
            
            if (updateError) {
              console.error('Error updating lead:', updateError);
              throw updateError;
            }
            
            setEvents(prev => 
              prev.map(e => 
                e.id === eventId 
                  ? {...e, isCompleted: true} 
                  : e
              )
            );
            
            window.dispatchEvent(new CustomEvent('action-completed'));
            
            toast({
              title: "Action complétée",
              description: "L'action a été marquée comme complétée."
            });
          } else {
            console.error(`Action ${actionId} not found in lead's action history`);
          }
        }
      } catch (error) {
        console.error('Error marking action as complete:', error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de mettre à jour l'action."
        });
      }
    }
  };

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
    setNewEvent({ 
      title: '', 
      description: '', 
      color: '#FDE1D3', 
      category: 'Call',
      time: '09:00'
    });
    
    toast({
      title: "Événement ajouté",
      description: `L'événement "${event.title}" a été ajouté au ${selectedDate.toLocaleDateString('fr-FR')}${event.time ? ' à ' + event.time : ''}`,
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
        refreshEvents,
        markEventComplete,
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
