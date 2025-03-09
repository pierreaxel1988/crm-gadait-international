
import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarIcon, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Event } from '@/pages/Calendar';
import CalendarEventsList from './CalendarEventsList';

interface DayDetailProps {
  selectedDate: Date | undefined;
  events: Event[];
  setIsAddEventOpen: (isOpen: boolean) => void;
  activeFilters: string[];
}

const DayDetail = ({ selectedDate, events, setIsAddEventOpen, activeFilters }: DayDetailProps) => {
  // Filter events based on active filters
  const filteredEvents = activeFilters.length > 0
    ? events.filter(event => event.category && activeFilters.includes(event.category))
    : events;

  const eventsForSelectedDate = selectedDate
    ? filteredEvents.filter((event) => format(event.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd'))
    : [];

  return (
    <Card className="bg-white shadow-luxury h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="font-times text-2xl text-loro-terracotta">
            {selectedDate ? format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr }) : 'Sélectionner une date'}
          </CardTitle>
          <CalendarIcon className="h-5 w-5 text-loro-terracotta" />
        </div>
        <CardDescription className="font-times text-chocolate-dark">
          {eventsForSelectedDate.length 
            ? `${eventsForSelectedDate.length} événement${eventsForSelectedDate.length > 1 ? 's' : ''}`
            : 'Aucun événement prévu'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CalendarEventsList 
          events={filteredEvents} 
          selectedDate={selectedDate} 
          openAddEventDialog={() => setIsAddEventOpen(true)} 
        />
      </CardContent>
    </Card>
  );
};

export default DayDetail;
