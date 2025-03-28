
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import CalendarView from '@/components/calendar/CalendarView';
import DayDetail from '@/components/calendar/DayDetail';
import AddEventDialog from '@/components/calendar/AddEventDialog';
import CategoryFilter from '@/components/calendar/CategoryFilter';
import { eventCategories, useCalendar } from '@/contexts/CalendarContext';
import { useIsMobile } from '@/hooks/use-mobile';

const CalendarPageContent = () => {
  const isMobile = useIsMobile();
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

  const colors = eventCategories.map(cat => ({ name: cat.name, value: cat.color }));

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h1 className="tracking-tight font-medium text-zinc-900 text-base">Calendrier</h1>
        
        <Button 
          onClick={() => refreshEvents()}
          variant="outline" 
          size="sm"
          className="font-futura text-sm"
        >
          Actualiser
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
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
          
          {!isMobile && (
            <Button 
              className="w-full" 
              onClick={() => setIsAddEventOpen(true)}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Ajouter un événement
            </Button>
          )}
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

      {isMobile && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button 
            className="rounded-full h-14 w-14 shadow-luxury" 
            onClick={() => setIsAddEventOpen(true)}
          >
            <PlusCircle className="h-6 w-6" />
          </Button>
        </div>
      )}

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
