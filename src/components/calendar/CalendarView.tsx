
import React, { useEffect } from 'react';
import { isSameDay, startOfWeek, endOfWeek, addDays } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Event } from '@/contexts/CalendarContext';
import { TaskType } from '@/components/kanban/KanbanCard';

interface CalendarViewProps {
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  events: Event[];
  view: 'month' | 'week';
  setView: (view: 'month' | 'week') => void;
  activeFilters: TaskType[];
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

  // For week view, calculate the current week's date range
  const getWeekRange = () => {
    if (!selectedDate) return undefined;
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Week starts on Monday
    const end = endOfWeek(selectedDate, { weekStartsOn: 1 });
    return { from: start, to: end };
  };

  // Effect to handle view change - when switching to week view, reset the visible dates
  useEffect(() => {
    if (view === 'week' && selectedDate) {
      // Reset date to the first day of the current week when switching to week view
      const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
      setSelectedDate(start);
    }
  }, [view, setSelectedDate]);

  // Different calendar props for month and week views
  const calendarProps = view === 'week' 
    ? {
        mode: "single" as const,
        selected: selectedDate,
        onSelect: setSelectedDate,
        className: "border-0",
        weekStartsOn: 1 as const, // Start week on Monday
        numberOfMonths: 1,
        disabled: [
          { before: getWeekRange()?.from },
          { after: getWeekRange()?.to }
        ],
        fromDate: getWeekRange()?.from,
        toDate: getWeekRange()?.to,
        components: {
          DayContent: ({ date }: { date: Date }) => (
            <>
              {date.getDate()}
              {renderDayContent(date)}
            </>
          ),
        },
        modifiers: {
          hasEvent: (date: Date) => filteredEvents.some(event => isSameDay(event.date, date)),
        },
        modifiersClassNames: {
          hasEvent: "font-medium text-loro-navy",
        }
      }
    : {
        mode: "single" as const,
        selected: selectedDate,
        onSelect: setSelectedDate,
        className: "border-0",
        weekStartsOn: 1 as const, // Start week on Monday
        numberOfMonths: 1,
        components: {
          DayContent: ({ date }: { date: Date }) => (
            <>
              {date.getDate()}
              {renderDayContent(date)}
            </>
          ),
        },
        modifiers: {
          hasEvent: (date: Date) => filteredEvents.some(event => isSameDay(event.date, date)),
        },
        modifiersClassNames: {
          hasEvent: "font-medium text-loro-navy",
        }
      };

  // Generate array of weekdays for week view
  const weekDays = selectedDate && view === 'week' 
    ? Array.from({ length: 7 }, (_, i) => 
        addDays(startOfWeek(selectedDate, { weekStartsOn: 1 }), i)
      )
    : [];

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
                className="data-[state=active]:bg-loro-terracotta data-[state=active]:text-white transition-all duration-300"
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
        {view === 'week' && (
          <div className="mb-2 animate-fade-in">
            <div className="flex justify-between text-xs text-gray-500 px-2">
              {weekDays.map((day, index) => (
                <div 
                  key={index} 
                  className={`text-center w-9 py-1 rounded-md ${
                    isSameDay(day, new Date()) ? 'bg-loro-sand/30 font-medium' : ''
                  }`}
                >
                  {day.getDate()}
                </div>
              ))}
            </div>
          </div>
        )}
        <Calendar
          {...calendarProps}
        />
      </CardContent>
    </Card>
  );
};

export default CalendarView;
