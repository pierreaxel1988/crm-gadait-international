
import React from 'react';
import { isSameDay } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Event } from '@/pages/Calendar';

interface CalendarViewProps {
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  events: Event[];
  view: 'month' | 'week';
  setView: (view: 'month' | 'week') => void;
  activeFilters: string[];
}

const CalendarView = ({ 
  selectedDate, 
  setSelectedDate, 
  events,
  view,
  setView,
  activeFilters 
}: CalendarViewProps) => {
  // Filter events based on active category filters
  const filteredEvents = activeFilters.length > 0 
    ? events.filter(event => event.category && activeFilters.includes(event.category))
    : events;

  // Function to generate day content - small dots for events
  const renderDayContent = (day: Date) => {
    const eventsOnDay = filteredEvents.filter((event) => isSameDay(event.date, day));
    
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
        <div className="flex items-center justify-between">
          <CardTitle className="font-times text-2xl text-loro-terracotta">Calendrier</CardTitle>
          <Tabs defaultValue={view} onValueChange={(v) => setView(v as 'month' | 'week')}>
            <TabsList className="bg-loro-sand/20">
              <TabsTrigger 
                value="month" 
                className="data-[state=active]:bg-loro-terracotta data-[state=active]:text-white"
              >
                Mois
              </TabsTrigger>
              <TabsTrigger 
                value="week" 
                className="data-[state=active]:bg-loro-terracotta data-[state=active]:text-white"
              >
                Semaine
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
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
          weekStartsOn={1} // Start week on Monday
          numberOfMonths={1}
          numberOfRows={view === 'week' ? 1 : undefined} // Show only 1 row for week view
          components={{
            DayContent: ({ date }) => (
              <>
                {date.getDate()}
                {renderDayContent(date)}
              </>
            ),
          }}
          modifiers={{
            hasEvent: (date) => filteredEvents.some(event => isSameDay(event.date, date)),
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
