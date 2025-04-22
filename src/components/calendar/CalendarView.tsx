import React, { useEffect } from 'react';
import { isSameDay, startOfWeek, endOfWeek, addDays } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Event } from '@/contexts/CalendarContext';
import { TaskType } from '@/types/actionHistory';

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
  const filteredEvents = activeFilters.length > 0 ? events.filter(event => event.category && activeFilters.includes(event.category)) : events;

  const renderDayContent = (day: Date) => {
    const eventsOnDay = filteredEvents.filter(event => isSameDay(event.date, day));
    if (eventsOnDay.length === 0) return null;
    return <div className="flex justify-center mt-1 space-x-0.5">
        {eventsOnDay.slice(0, 3).map((event, i) => <div key={i} className="h-1.5 w-1.5 rounded-full" style={{
        backgroundColor: event.color
      }} />)}
        {eventsOnDay.length > 3 && <div className="h-1.5 w-1.5 rounded-full bg-gray-400" />}
      </div>;
  };

  const getWeekRange = () => {
    if (!selectedDate) return undefined;
    const start = startOfWeek(selectedDate, {
      weekStartsOn: 1
    });
    const end = endOfWeek(selectedDate, {
      weekStartsOn: 1
    });
    return {
      from: start,
      to: end
    };
  };

  useEffect(() => {
    if (view === 'week' && selectedDate) {
      const start = startOfWeek(selectedDate, {
        weekStartsOn: 1
      });
      setSelectedDate(start);
    }
  }, [view, setSelectedDate]);

  const calendarProps = view === 'week' ? {
    mode: "single" as const,
    selected: selectedDate,
    onSelect: setSelectedDate,
    className: "border-0",
    weekStartsOn: 1 as const,
    numberOfMonths: 1,
    disabled: [{
      before: getWeekRange()?.from
    }, {
      after: getWeekRange()?.to
    }],
    fromDate: getWeekRange()?.from,
    toDate: getWeekRange()?.to,
    components: {
      DayContent: ({
        date
      }: {
        date: Date;
      }) => <>
              {date.getDate()}
              {renderDayContent(date)}
            </>
    },
    modifiers: {
      hasEvent: (date: Date) => filteredEvents.some(event => isSameDay(event.date, date))
    },
    modifiersClassNames: {
      hasEvent: "font-medium text-loro-navy"
    }
  } : {
    mode: "single" as const,
    selected: selectedDate,
    onSelect: setSelectedDate,
    className: "border-0",
    weekStartsOn: 1 as const,
    numberOfMonths: 1,
    components: {
      DayContent: ({
        date
      }: {
        date: Date;
      }) => <>
              {date.getDate()}
              {renderDayContent(date)}
            </>
    },
    modifiers: {
      hasEvent: (date: Date) => filteredEvents.some(event => isSameDay(event.date, date))
    },
    modifiersClassNames: {
      hasEvent: "font-medium text-loro-navy"
    }
  };

  const weekDays = selectedDate && view === 'week' ? Array.from({
    length: 7
  }, (_, i) => addDays(startOfWeek(selectedDate, {
    weekStartsOn: 1
  }), i)) : [];
  return <Card className="bg-white shadow-luxury">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="font-futuraLight text-loro-terracotta text-base font-normal">Calendrier</CardTitle>
          <Tabs defaultValue={view} onValueChange={v => setView(v as 'month' | 'week')}>
            <TabsList className="bg-loro-sand/20">
              <TabsTrigger value="month" className="data-[state=active]:bg-loro-terracotta data-[state=active]:text-white">
                Mois
              </TabsTrigger>
              <TabsTrigger value="week" className="data-[state=active]:bg-loro-terracotta data-[state=active]:text-white transition-all duration-300">
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
        {view === 'week' && <div className="mb-2 animate-fade-in">
            <div className="flex justify-between text-xs text-gray-500 px-2">
              {weekDays.map((day, index) => <div key={index} className={`text-center w-9 py-1 rounded-md ${isSameDay(day, new Date()) ? 'bg-loro-sand/30 font-medium' : ''}`}>
                  {day.getDate()}
                </div>)}
            </div>
          </div>}
        <Calendar {...calendarProps} />
      </CardContent>
    </Card>;
};

export default CalendarView;
