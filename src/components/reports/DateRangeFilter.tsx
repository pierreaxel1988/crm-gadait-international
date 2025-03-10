
import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DateRangeFilterProps {
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  setDateRange: (range: {
    from: Date | undefined;
    to: Date | undefined;
  }) => void;
}

const DateRangeFilter = ({ dateRange, setDateRange }: DateRangeFilterProps) => {
  return (
    <div className="flex items-center space-x-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-[300px] justify-start border-dashed text-left font-normal"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, 'PPP', { locale: fr })} -{' '}
                  {format(dateRange.to, 'PPP', { locale: fr })}
                </>
              ) : (
                format(dateRange.from, 'PPP', { locale: fr })
              )
            ) : (
              <span>Sélectionnez une période</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange.from}
            selected={{
              from: dateRange.from,
              to: dateRange.to,
            }}
            onSelect={(range) => {
              setDateRange({
                from: range?.from,
                to: range?.to,
              });
            }}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DateRangeFilter;
