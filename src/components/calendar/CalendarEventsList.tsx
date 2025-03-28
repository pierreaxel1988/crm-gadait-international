
import React from 'react';
import { isSameDay } from 'date-fns';
import { Event } from '@/contexts/CalendarContext';

interface CalendarEventsListProps {
  events: Event[];
  selectedDate: Date | undefined;
  openAddEventDialog: () => void;
}

const CalendarEventsList = ({ events, selectedDate, openAddEventDialog }: CalendarEventsListProps) => {
  const eventsForSelectedDate = selectedDate
    ? events.filter((event) => isSameDay(event.date, selectedDate))
    : [];

  return (
    <>
      {eventsForSelectedDate.length > 0 ? (
        <div className="space-y-4">
          {eventsForSelectedDate.map((event) => (
            <div 
              key={event.id} 
              className="p-4 rounded-lg border transition-all hover:shadow-luxury-hover"
              style={{ backgroundColor: `${event.color}30` /* 30% opacity */ }}
            >
              <div className="flex justify-between items-start">
                <h3 className="font-futura text-lg font-medium">{event.title}</h3>
                {event.time && (
                  <span className="text-sm font-medium px-2 py-1 rounded-md bg-white">
                    {event.time}
                  </span>
                )}
              </div>
              <p className="text-loro-navy font-futura mt-1">{event.description}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-loro-navy font-futura font-italic">
            Aucun événement prévu pour cette date.
          </p>
          <button 
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-futura font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-10 px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground mt-4"
            onClick={openAddEventDialog}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
            Ajouter un événement
          </button>
        </div>
      )}
    </>
  );
};

export default CalendarEventsList;
