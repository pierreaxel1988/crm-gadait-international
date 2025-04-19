
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import CalendarView from '@/components/calendar/CalendarView';
import DayDetail from '@/components/calendar/DayDetail';
import AddEventDialog from '@/components/calendar/AddEventDialog';
import CategoryFilter from '@/components/calendar/CategoryFilter';
import { eventCategories, useCalendar } from '@/contexts/CalendarContext';
import { useAuth } from '@/hooks/useAuth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
    selectedAgent,
    onAgentChange
  } = useCalendar();
  
  const { isAdmin } = useAuth();
  
  useEffect(() => {
    console.log("CalendarPageContent mounted - forcing refresh of events");
    refreshEvents();
    
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
  }, [refreshEvents, events]);

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

  return (
    <div className="container py-10 max-w-6xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/2 lg:w-2/5 space-y-6">
          <div className="flex flex-col space-y-4">
            {isAdmin && (
              <div className="w-full">
                <Select 
                  value={selectedAgent || "all"} 
                  onValueChange={(value) => onAgentChange(value === "all" ? null : value)}
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
            <CategoryFilter />
          </div>

          <CalendarView 
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            events={events}
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
            events={events}
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
      
    </div>
  );
};

export default CalendarPageContent;
