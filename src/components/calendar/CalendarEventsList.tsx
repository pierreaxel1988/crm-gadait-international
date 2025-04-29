
import React from 'react';
import { isSameDay } from 'date-fns';
import { Event, eventCategories } from '@/contexts/CalendarContext';
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
        return isSameDayResult;
      })
    : [];
  
  // Determine if date is in the past
  const isDatePast = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate < today;
  };
  
  // Get proper category color
  const getCategoryColor = (categoryValue?: string): string => {
    if (!categoryValue) return '#9BA3AD'; // Default gray
    const category = eventCategories.find(cat => cat.value === categoryValue);
    return category?.color || '#9BA3AD';
  };
  
  // Get text color based on background color
  const getTextColor = (categoryValue?: string): string => {
    switch (categoryValue) {
      case 'Call': return '#221F26'; // Dark text for light green
      case 'Compromis': return '#221F26'; // Dark text for gold
      default: return '#FFFFFF';  // White text for other categories
    }
  };
  
  return (
    <>
      {eventsForSelectedDate.length > 0 ? (
        <div className="space-y-3">
          {eventsForSelectedDate.map((event) => {
            // Determine if event is overdue (past date and not completed)
            const isOverdue = isDatePast(event.date) && !event.isCompleted;
            const categoryColor = getCategoryColor(event.category);
            const textColor = getTextColor(event.category);
            
            return (
              <div 
                key={event.id} 
                className={`p-3 rounded-lg transition-all ${
                  event.isCompleted 
                    ? 'opacity-80' 
                    : 'hover:shadow-luxury-hover'
                }`}
                style={{ 
                  backgroundColor: event.isCompleted 
                    ? '#F1F0FB' // Soft gray for completed events
                    : isOverdue 
                      ? '#FFDEE240' // Soft pink for overdue with transparency
                      : `${categoryColor}30` // Light version of category color
                }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2 flex-shrink-0" 
                      style={{ backgroundColor: categoryColor }}
                    ></div>
                    <h3 className={`font-futura text-sm font-medium ${event.isCompleted ? 'text-gray-600' : ''}`}>
                      {event.title}
                    </h3>
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
                        ? 'text-rose-800 bg-white/60'
                        : 'text-gray-800 bg-white/60'
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
                {event.leadName && !event.title.includes(event.leadName) && (
                  <div className="text-xs mt-1 text-gray-600">
                    Lead: {event.leadName}
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
