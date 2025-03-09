
import React from 'react';
import { isSameDay } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Event } from '@/pages/Calendar';

interface CalendarViewProps {
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  events: Event[];
}

const CalendarView = ({ selectedDate, setSelectedDate, events }: CalendarViewProps) => {
  // Function to generate day content - small dots for events
  const renderDayContent = (day: Date) => {
    const eventsOnDay = events.filter((event) => isSameDay(event.date, day));
    
    if (eventsOnDay.length === 0) return null;
    
    return (
      <div className="flex justify-center mt-1 space-x-0.5">
        {eventsOnDay.slice(0, 3).map((event, i) => (
          <div 
            key={i} 
            className="h-1.5 w-1.5 rounded-full" 
            style={{ backgroundColor: event.color }}
          />
        ))}
        {eventsOnDay.length > 3 && (
          <div className="h-1.5 w-1.5 rounded-full bg-gray-400" />
        )}
      </div>
    );
  };

  return (
    <Card className="bg-white shadow-luxury">
      <CardHeader className="pb-2">
        <CardTitle className="font-times text-2xl text-loro-terracotta">Calendrier</CardTitle>
        <CardDescription className="font-times text-chocolate-dark">
          Suivi de vos rendez-vous et événements
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="border-0"
          components={{
            DayContent: ({ date }) => (
              <>
                {date.getDate()}
                {renderDayContent(date)}
              </>
            ),
          }}
          modifiers={{
            hasEvent: (date) => events.some(event => isSameDay(event.date, date)),
          }}
          modifiersClassNames={{
            hasEvent: "font-medium text-loro-navy",
          }}
        />
      </CardContent>
    </Card>
  );
};

export default CalendarView;
