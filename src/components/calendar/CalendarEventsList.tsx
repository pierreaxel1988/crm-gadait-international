
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Clock, User } from 'lucide-react';
import { format, isToday, isTomorrow, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Event } from '@/contexts/CalendarContext';
import { Separator } from '@/components/ui/separator';

interface CalendarEventsListProps {
  events: Event[];
  selectedDate: Date | undefined;
  openAddEventDialog: () => void;
}

const CalendarEventsList = ({ events, selectedDate, openAddEventDialog }: CalendarEventsListProps) => {
  // If no date is selected, show message
  if (!selectedDate) {
    return (
      <div className="flex flex-col items-center justify-center h-48 space-y-4">
        <p className="text-loro-navy/60 font-futuraLight">Sélectionnez une date pour voir les événements</p>
        <Button onClick={openAddEventDialog} variant="outline" className="border-loro-navy/20">
          <PlusCircle className="mr-2 h-4 w-4" />
          Ajouter un événement
        </Button>
      </div>
    );
  }

  // Filter events for the selected date
  const eventsForSelectedDate = events.filter(
    (event) => format(event.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
  );

  // If no events for the selected date, show message
  if (eventsForSelectedDate.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 space-y-4">
        <p className="text-loro-navy/60 font-futuraLight">Aucun événement pour cette date</p>
        <Button onClick={openAddEventDialog} variant="outline" className="border-loro-navy/20">
          <PlusCircle className="mr-2 h-4 w-4" />
          Ajouter un événement
        </Button>
      </div>
    );
  }

  // Sort events by time
  const sortedEvents = [...eventsForSelectedDate].sort((a, b) => {
    const timeA = a.time.split(':').map(Number);
    const timeB = b.time.split(':').map(Number);
    
    // Compare hours first
    if (timeA[0] !== timeB[0]) {
      return timeA[0] - timeB[0];
    }
    
    // If hours are the same, compare minutes
    return timeA[1] - timeB[1];
  });

  return (
    <div className="space-y-4">
      {sortedEvents.map((event) => (
        <div
          key={event.id}
          className="p-4 rounded-lg border border-loro-pearl overflow-hidden relative animate-fade-in"
          style={{ borderLeftWidth: '4px', borderLeftColor: event.color }}
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-futura text-lg text-loro-navy">{event.title}</h3>
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: event.color }}
            />
          </div>
          
          <div className="flex items-center text-sm text-loro-navy/70 mb-2">
            <Clock className="h-4 w-4 mr-2" />
            {event.time}
          </div>

          {event.assignedToName && (
            <div className="flex items-center text-sm text-loro-navy/70 mb-2">
              <User className="h-4 w-4 mr-2" />
              {event.assignedToName}
            </div>
          )}
          
          {event.description && (
            <>
              <Separator className="my-2" />
              <p className="text-sm text-loro-navy/80 mt-2">{event.description}</p>
            </>
          )}
        </div>
      ))}
      
      <div className="flex justify-center pt-4">
        <Button onClick={openAddEventDialog} variant="outline" className="border-loro-navy/20">
          <PlusCircle className="mr-2 h-4 w-4" />
          Ajouter un événement
        </Button>
      </div>
    </div>
  );
};

export default CalendarEventsList;
