
import React from 'react';
import { isSameDay } from 'date-fns';
import { Event } from '@/contexts/CalendarContext';
import { Check, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CalendarEventsListProps {
  events: Event[];
  selectedDate: Date | undefined;
  openAddEventDialog: () => void;
  onMarkComplete: (eventId: string) => Promise<void>;
}

const CalendarEventsList = ({ 
  events, 
  selectedDate, 
  openAddEventDialog,
  onMarkComplete
}: CalendarEventsListProps) => {
  // Filter events for the selected date
  const eventsForSelectedDate = selectedDate
    ? events.filter((event) => {
        const isSameDayResult = isSameDay(event.date, selectedDate);
        if (!isSameDayResult) {
          // For debugging: Only log some of the mismatches to avoid console spam
          if (Math.random() < 0.2) {
            console.log(
              `Event date mismatch - Event: ${event.title}, ` +
              `Event date: ${event.date.toISOString()}, ` +
              `Selected date: ${selectedDate.toISOString()}`
            );
          }
        }
        return isSameDayResult;
      })
    : [];

  console.log(`Displaying ${eventsForSelectedDate.length} events for selected date:`, selectedDate);
  if (eventsForSelectedDate.length > 0) {
    console.log("Events for this date:", eventsForSelectedDate);
  }
  
  // Determine if date is in the past
  const isDatePast = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate < today;
  };
  
  return (
    <>
      {eventsForSelectedDate.length > 0 ? (
        <div className="space-y-3">
          {eventsForSelectedDate.map((event) => {
            // Determine if event is overdue (past date and not completed)
            const isOverdue = isDatePast(event.date) && !event.isCompleted;
            
            return (
              <div 
                key={event.id} 
                className={`p-3 rounded-lg border transition-all ${
                  event.isCompleted 
                    ? 'bg-gray-50/80 border-gray-200 opacity-80' 
                    : isOverdue
                      ? 'bg-[#FFDEE2]/30 border-pink-200 hover:shadow-luxury-hover'
                      : 'bg-[#F2FCE2]/40 border-green-100 hover:shadow-luxury-hover'
                }`}
                style={{ 
                  backgroundColor: event.isCompleted 
                    ? '#F1F0FB' // Soft gray for completed events
                    : isOverdue 
                      ? 'rgba(255, 222, 226, 0.3)' // Soft pink for overdue
                      : 'rgba(242, 252, 226, 0.4)', // Soft green for upcoming
                  borderColor: event.isCompleted
                    ? '#e2e2e2'
                    : isOverdue
                      ? '#f9c6ce'
                      : '#d1e7c5'
                }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className={`font-futura text-sm font-medium ${event.isCompleted ? 'text-gray-600' : ''}`}>
                      {event.title}
                    </h3>
                    {event.leadName && (
                      <div className="text-xs italic text-gray-600 mt-1">Lead: {event.leadName}</div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {event.time && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-white">
                        {event.time}
                      </span>
                    )}
                    {event.actionId && !event.isCompleted && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-7 px-2 text-xs text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                        onClick={() => onMarkComplete(event.id)}
                      >
                        <Check className="h-3 w-3 mr-1" /> Terminer
                      </Button>
                    )}
                    {event.isCompleted && (
                      <span className="text-xs py-0.5 px-2 bg-green-100 text-green-700 rounded-md flex items-center">
                        <Check className="h-3 w-3 mr-1" /> Terminé
                      </span>
                    )}
                  </div>
                </div>
                {event.description && (
                  <p className={`font-futura text-xs mt-1 p-2 rounded ${
                    event.isCompleted 
                      ? 'text-gray-500 bg-white/80' 
                      : isOverdue
                        ? 'text-rose-800 bg-[#FFF0F2]'
                        : 'text-green-800 bg-[#F7FEF1]'
                  }`}>
                    {event.description}
                  </p>
                )}
                {event.assignedToName && (
                  <div className="flex items-center mt-2 text-xs text-gray-600">
                    <User className="h-3 w-3 mr-1" /> 
                    <span>Assigné à: {event.assignedToName}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 border rounded-md bg-gray-50 animate-[fade-in_0.3s_ease-out]">
          <p className="text-muted-foreground text-xs font-futuraLight italic">
            Aucun événement prévu pour cette date.
          </p>
          <button 
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-xs font-futura font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-8 px-3 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground mt-3"
            onClick={openAddEventDialog}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5 h-3 w-3"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
            Ajouter un événement
          </button>
        </div>
      )}
    </>
  );
};

export default CalendarEventsList;
