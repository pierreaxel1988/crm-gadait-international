
import React, { useState } from 'react';
import { Check, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DateRangePicker } from './DateRangePicker';
import { Separator } from "@/components/ui/separator";

export type PeriodType = 'semaine' | 'mois' | 'annee' | 'custom';

export interface Period {
  type: PeriodType;
  dateRange?: {
    from: Date | undefined;
    to: Date | undefined;
  };
}

interface PeriodSelectorProps {
  period: Period;
  setPeriod: (period: Period) => void;
}

const PeriodSelector = ({ period, setPeriod }: PeriodSelectorProps) => {
  const [dateRange, setDateRange] = useState(period.dateRange);

  const periodLabels = {
    semaine: "Cette semaine",
    mois: "Ce mois",
    annee: "Cette année"
  };

  const handleDateRangeChange = (range: { from: Date | undefined; to: Date | undefined }) => {
    setDateRange(range);
    if (range.from && range.to) {
      setPeriod({ type: 'custom', dateRange: range });
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-[160px] justify-between border-gray-200 focus:ring-blue-200">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>
              {period.type === 'custom' && period.dateRange 
                ? 'Période personnalisée'
                : periodLabels[period.type as keyof typeof periodLabels]}
            </span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="end">
        <div className="rounded-md overflow-hidden">
          {Object.entries(periodLabels).map(([key, label]) => (
            <div 
              key={key}
              className={cn(
                "px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-100",
                period.type === key && "bg-gray-100"
              )}
              onClick={() => setPeriod({ type: key as PeriodType })}
            >
              <span className="text-gray-800">{label}</span>
              {period.type === key && <Check className="h-4 w-4 text-blue-600" />}
            </div>
          ))}
          <Separator className="my-2" />
          <div className="p-4">
            <DateRangePicker 
              dateRange={dateRange || { from: undefined, to: undefined }}
              onDateRangeChange={handleDateRangeChange}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default PeriodSelector;
