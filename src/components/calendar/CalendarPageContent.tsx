
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, ListChecks } from 'lucide-react';
import CalendarView from '@/components/calendar/CalendarView';
import DayDetail from '@/components/calendar/DayDetail';
import AddEventDialog from '@/components/calendar/AddEventDialog';
import CategoryFilter from '@/components/calendar/CategoryFilter';
import { eventCategories, useCalendar } from '@/contexts/CalendarContext';
import { useAuth } from '@/hooks/useAuth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSelectedAgent } from '@/hooks/useSelectedAgent';
import AllActionsDialog from './AllActionsDialog';
import { useActionsData } from '@/hooks/useActionsData';
import { ActionItem } from '@/types/actionHistory';

const CalendarPageContent = () => {
  const { 
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
    onAgentChange,
    syncActionsToCalendar
  } = useCalendar();
  
  const { isAdmin } = useAuth();
  const { selectedAgent, handleAgentChange } = useSelectedAgent();
  const [isAllActionsOpen, setIsAllActionsOpen] = useState(false);
  const { actions, refreshActions } = useActionsData();
  
  // Initial load of events and sync with actions
  useEffect(() => {
    console.log("CalendarPageContent mounted - forcing refresh of events");
    refreshEvents();
    
    // Fetch actions and sync them with calendar events
    refreshActions().then(() => {
      syncActionsToCalendar();
    });
    
    const timer = setTimeout(() => {
      console.log(`Current events count in CalendarPageContent: ${events.length}`);
      if (events.length === 0) {
        console.warn("No events loaded - forcing another refresh");
        refreshEvents();
      } else {
        console.log("Sample events:", events.slice(0, 3));
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [refreshEvents, refreshActions, syncActionsToCalendar]);

  // Sync with actions when they change
  useEffect(() => {
    if (actions.length > 0) {
      syncActionsToCalendar(actions);
    }
  }, [actions, syncActionsToCalendar]);
  
  useEffect(() => {
    // Update the calendar context with the selected agent
    onAgentChange(selectedAgent);
  }, [selectedAgent, onAgentChange]);

  // Get unique agents from events
  const uniqueAgents = events.reduce((acc: { id: string; name: string }[], event) => {
    if (event.assignedToId && event.assignedToName && 
        !acc.some(agent => agent.id === event.assignedToId)) {
      acc.push({ 
        id: event.assignedToId, 
        name: event.assignedToName 
      });
    }
    return acc;
  }, []);

  // Create colors array for AddEventDialog
  const colors = eventCategories.map(cat => ({ name: cat.name, value: cat.color }));

  // Filter events based on selected agent
  const filteredEvents = events.filter(event => {
    if (!selectedAgent) return true;
    return event.assignedToId === selectedAgent;
  });

  return (
    <div className="container py-10 max-w-6xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/2 lg:w-2/5 space-y-6">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row gap-2 justify-between items-start">
              {isAdmin && (
                <div className="w-full sm:w-2/3">
                  <Select 
                    value={selectedAgent || "all"} 
                    onValueChange={(value) => handleAgentChange(value === "all" ? null : value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Filtrer par commercial" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les commerciaux</SelectItem>
                      {uniqueAgents.map(agent => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {agent.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <Button 
                variant="outline"
                size="sm" 
                className="w-full sm:w-auto transition-all border-loro-navy/30 text-loro-navy hover:bg-loro-pearl/20"
                onClick={() => setIsAllActionsOpen(true)}
              >
                <ListChecks className="mr-2 h-4 w-4" />
                Toutes les actions
              </Button>
            </div>
            <CategoryFilter />
          </div>

          <CalendarView 
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            events={filteredEvents}
            view={view}
            setView={setView}
            activeFilters={activeFilters}
          />
          
          <Button 
            className="w-full shadow-sm" 
            onClick={() => setIsAddEventOpen(true)}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Ajouter un événement
          </Button>
        </div>
        
        <div className="md:w-1/2 lg:w-3/5">
          <DayDetail
            selectedDate={selectedDate}
            events={filteredEvents}
            setIsAddEventOpen={setIsAddEventOpen}
            activeFilters={activeFilters}
          />
        </div>
      </div>

      <AddEventDialog
        isOpen={isAddEventOpen}
        onOpenChange={setIsAddEventOpen}
        selectedDate={selectedDate}
        newEvent={newEvent}
        setNewEvent={setNewEvent}
        onAddEvent={handleAddEvent}
        colors={colors}
        categories={eventCategories}
      />
      
      <AllActionsDialog 
        isOpen={isAllActionsOpen}
        onOpenChange={setIsAllActionsOpen}
      />
    </div>
  );
};

export default CalendarPageContent;
