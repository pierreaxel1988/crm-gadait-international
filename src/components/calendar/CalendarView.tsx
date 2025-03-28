
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { fr } from 'date-fns/locale';
import { format, isEqual, isSameDay, isSameMonth, add, sub, startOfMonth, endOfMonth, eachDayOfInterval, addDays, startOfWeek, endOfWeek } from 'date-fns';
import { Event } from '@/contexts/CalendarContext';
import { TaskType } from '@/components/kanban/KanbanCard';

interface CalendarViewProps {
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  events: Event[];
  view: 'month' | 'week' | 'day';
  setView: (view: 'month' | 'week' | 'day') => void;
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
  const [month, setMonth] = React.useState<Date>(selectedDate || new Date());
  
  // Filter events based on active filters
  const filteredEvents = activeFilters.length > 0
    ? events.filter(event => event.category && activeFilters.includes(event.category))
    : events;

  // Handle navigation
  const handlePrevious = () => {
    if (view === 'month') {
      setMonth(sub(month, { months: 1 }));
    } else if (view === 'week') {
      setMonth(sub(month, { weeks: 1 }));
      if (selectedDate) {
        setSelectedDate(sub(selectedDate, { weeks: 1 }));
      }
    } else if (view === 'day' && selectedDate) {
      const newDate = sub(selectedDate, { days: 1 });
      setSelectedDate(newDate);
      setMonth(newDate);
    }
  };

  const handleNext = () => {
    if (view === 'month') {
      setMonth(add(month, { months: 1 }));
    } else if (view === 'week') {
      setMonth(add(month, { weeks: 1 }));
      if (selectedDate) {
        setSelectedDate(add(selectedDate, { weeks: 1 }));
      }
    } else if (view === 'day' && selectedDate) {
      const newDate = add(selectedDate, { days: 1 });
      setSelectedDate(newDate);
      setMonth(newDate);
    }
  };

  // Custom day render for month view
  const renderDay = (day: Date) => {
    const dayEvents = filteredEvents.filter(event => 
      isSameDay(event.date, day)
    );

    return (
      <div className="relative">
        <div className={`text-center ${isSameDay(day, selectedDate) ? 'font-bold' : ''}`}>
          {format(day, 'd')}
        </div>
        {dayEvents.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 flex justify-center">
            <div className="flex space-x-0.5">
              {dayEvents.length <= 3 ? (
                dayEvents.map((event, i) => (
                  <div
                    key={i}
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: event.color }}
                  />
                ))
              ) : (
                <>
                  {dayEvents.slice(0, 2).map((event, i) => (
                    <div
                      key={i}
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: event.color }}
                    />
                  ))}
                  <div className="h-1.5 w-1.5 rounded-full bg-gray-400 text-xs flex items-center justify-center">
                    <span className="sr-only">+{dayEvents.length - 2} événements</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render week view
  const renderWeekView = () => {
    const startDay = selectedDate 
      ? startOfWeek(selectedDate, { weekStartsOn: 1 }) 
      : startOfWeek(new Date(), { weekStartsOn: 1 });
    const endDay = endOfWeek(startDay, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: startDay, end: endDay });

    return (
      <div className="space-y-2">
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-loro-navy/70 font-futura">
          {days.map((day) => (
            <div key={day.toString()}>
              {format(day, 'EEEEEE', { locale: fr })}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 h-10">
          {days.map((day) => {
            const dayEvents = filteredEvents.filter(event => 
              isSameDay(event.date, day)
            );
            const isSelected = selectedDate && isSameDay(day, selectedDate);

            return (
              <Button
                key={day.toString()}
                variant={isSelected ? "default" : "outline"}
                className={`h-10 p-0 ${isSelected ? 'bg-loro-navy text-white' : 'hover:bg-loro-pearl/20'}`}
                onClick={() => setSelectedDate(day)}
              >
                <div className="flex flex-col items-center justify-center w-full">
                  <span className="text-xs">{format(day, 'd')}</span>
                  {dayEvents.length > 0 && (
                    <div className="flex space-x-0.5 mt-0.5">
                      {dayEvents.length <= 3 ? (
                        dayEvents.map((event, i) => (
                          <div
                            key={i}
                            className="h-1 w-1 rounded-full"
                            style={{ backgroundColor: isSelected ? 'white' : event.color }}
                          />
                        ))
                      ) : (
                        <>
                          <div className="h-1 w-1 rounded-full bg-loro-navy/60" />
                          <span className="text-[8px]">+{dayEvents.length}</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </Button>
            );
          })}
        </div>
      </div>
    );
  };

  // Render day view
  const renderDayView = () => {
    if (!selectedDate) return null;

    const dayEvents = filteredEvents.filter(event => 
      isSameDay(event.date, selectedDate)
    );

    // Sort events by time
    const sortedEvents = [...dayEvents].sort((a, b) => {
      const [aHour, aMinute] = a.time.split(':').map(Number);
      const [bHour, bMinute] = b.time.split(':').map(Number);
      
      if (aHour !== bHour) return aHour - bHour;
      return aMinute - bMinute;
    });

    // Group events by hour
    const hourlyEvents: { [hour: string]: Event[] } = {};
    
    // Initialize hours
    for (let i = 0; i < 24; i++) {
      const hour = `${i.toString().padStart(2, '0')}:00`;
      hourlyEvents[hour] = [];
    }
    
    // Assign events
    sortedEvents.forEach(event => {
      const hour = event.time.substring(0, 2) + ":00";
      hourlyEvents[hour].push(event);
    });

    return (
      <div className="space-y-0.5 overflow-y-auto max-h-[300px] pr-2 -mr-2">
        {Object.entries(hourlyEvents).map(([hour, hourEvents]) => (
          <div key={hour} className="flex min-h-[40px]">
            <div className="w-12 text-xs text-gray-500 pt-2">
              {hour}
            </div>
            <div className="flex-1 border-l border-gray-200 pl-2 flex flex-col space-y-1">
              {hourEvents.map(event => (
                <div 
                  key={event.id}
                  className="rounded px-2 py-1 text-xs truncate"
                  style={{ backgroundColor: `${event.color}20`, borderLeft: `2px solid ${event.color}` }}
                >
                  <span className="font-medium">{event.time}</span> {event.title}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="border border-gray-200 shadow-sm">
      <div className="p-4 space-y-4">
        {/* Calendar Header */}
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handlePrevious}
              className="h-7 w-7 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Mois précédent</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleNext}
              className="h-7 w-7 p-0"
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Mois suivant</span>
            </Button>
            <h2 className="text-base font-medium text-zinc-900">
              {view === 'month' && format(month, 'MMMM yyyy', { locale: fr })}
              {view === 'week' && selectedDate && 
                `${format(startOfWeek(selectedDate, { weekStartsOn: 1 }), 'd', { locale: fr })} - ${format(endOfWeek(selectedDate, { weekStartsOn: 1 }), 'd MMM yyyy', { locale: fr })}`
              }
              {view === 'day' && selectedDate && format(selectedDate, 'd MMMM yyyy', { locale: fr })}
            </h2>
          </div>
          
          <div className="flex space-x-1">
            <Button 
              variant={view === 'month' ? "default" : "outline"} 
              size="sm" 
              onClick={() => setView('month')}
              className="text-xs h-7"
            >
              Mois
            </Button>
            <Button 
              variant={view === 'week' ? "default" : "outline"} 
              size="sm" 
              onClick={() => setView('week')}
              className="text-xs h-7"
            >
              Semaine
            </Button>
            <Button 
              variant={view === 'day' ? "default" : "outline"} 
              size="sm" 
              onClick={() => setView('day')}
              className="text-xs h-7"
            >
              Jour
            </Button>
          </div>
        </div>
        
        {/* Calendar Content */}
        {view === 'month' && (
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            month={month}
            onMonthChange={setMonth}
            locale={fr}
            weekStartsOn={1}
            components={{
              Day: ({ date, activeModifiers }) => renderDay(date),
            }}
            modifiersClassNames={{
              selected: 'bg-loro-navy text-white',
              today: 'border border-loro-navy',
            }}
            className="font-futura"
            showOutsideDays
          />
        )}
        
        {view === 'week' && renderWeekView()}
        
        {view === 'day' && renderDayView()}
      </div>
    </Card>
  );
};

export default CalendarView;
