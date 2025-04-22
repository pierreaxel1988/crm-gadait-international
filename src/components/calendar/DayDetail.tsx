
import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarIcon } from 'lucide-react';
import CalendarEventsList from './CalendarEventsList';
import { Event, useCalendar } from '@/contexts/CalendarContext';
import { TaskType } from '@/types/actionHistory';

interface DayDetailProps {
  selectedDate: Date | undefined;
  events: Event[];
  setIsAddEventOpen: (isOpen: boolean) => void;
  activeFilters: TaskType[];
}

const DayDetail = ({
  selectedDate,
  events,
  setIsAddEventOpen,
  activeFilters
}: DayDetailProps) => {
  const { markEventComplete } = useCalendar();
  
  // Filter events based on active filters
  const filteredEvents = activeFilters.length > 0 
    ? events.filter(event => event.category && activeFilters.includes(event.category)) 
    : events;
  
  const eventsForSelectedDate = selectedDate 
    ? filteredEvents.filter(event => format(event.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')) 
    : [];
  
  // Convert the markEventComplete function to the format expected by CalendarEventsList
  const handleMarkComplete = async (id: string) => {
    await markEventComplete(id);
  };
  
  return (
    <Card className="bg-white shadow-luxury h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="font-futuraLight text-loro-terracotta text-base font-normal">
            {selectedDate ? format(selectedDate, 'EEEE d MMMM yyyy', {
              locale: fr
            }).charAt(0).toUpperCase() + format(selectedDate, 'EEEE d MMMM yyyy', {
              locale: fr
            }).slice(1) : 'Sélectionner une date'}
          </CardTitle>
          <CalendarIcon className="h-5 w-5 text-loro-terracotta" />
        </div>
        <CardDescription className="font-times text-chocolate-dark">
          {eventsForSelectedDate.length ? `${eventsForSelectedDate.length} événement${eventsForSelectedDate.length > 1 ? 's' : ''}` : 'Aucun événement prévu'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CalendarEventsList 
          events={filteredEvents} 
          selectedDate={selectedDate} 
          openAddEventDialog={() => setIsAddEventOpen(true)} 
          onMarkComplete={handleMarkComplete}
        />
      </CardContent>
    </Card>
  );
};

export default DayDetail;
