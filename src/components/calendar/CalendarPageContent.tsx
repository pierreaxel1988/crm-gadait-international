
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import CalendarView from '@/components/calendar/CalendarView';
import DayDetail from '@/components/calendar/DayDetail';
import AddEventDialog from '@/components/calendar/AddEventDialog';
import CategoryFilter from '@/components/calendar/CategoryFilter';
import { eventCategories, useCalendar } from '@/contexts/CalendarContext';

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
    refreshEvents
  } = useCalendar();

  // Force refresh of events when component mounts
  useEffect(() => {
    console.log("CalendarPageContent mounted - forcing refresh of events");
    refreshEvents();
    
    // Log events after a small delay to see what we have
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
  }, []);

  const colors = eventCategories.map(cat => ({ name: cat.name, value: cat.color }));

  return (
    <div className="container py-10 max-w-6xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/2 lg:w-2/5 space-y-6">
          <CategoryFilter />

          <CalendarView 
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            events={events}
            view={view}
            setView={setView}
            activeFilters={activeFilters}
          />
          
          <Button 
            className="w-full" 
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
