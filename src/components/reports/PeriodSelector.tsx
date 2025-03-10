
import React from 'react';
import { Check, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type PeriodType = 'semaine' | 'mois' | 'annee';

interface PeriodSelectorProps {
  period: PeriodType;
  setPeriod: (period: PeriodType) => void;
}

const PeriodSelector = ({ period, setPeriod }: PeriodSelectorProps) => {
  // Texte à afficher pour la période
  const periodLabels = {
    semaine: "Cette semaine",
    mois: "Ce mois",
    annee: "Cette année"
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-[160px] justify-between border-gray-200 focus:ring-blue-200">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{periodLabels[period]}</span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="end">
        <div className="rounded-md overflow-hidden">
          {Object.entries(periodLabels).map(([key, label]) => (
            <div 
              key={key}
              className={cn(
                "px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-100",
                period === key && "bg-gray-100"
              )}
              onClick={() => {
                setPeriod(key as PeriodType);
              }}
            >
              <span className="text-gray-800">{label}</span>
              {period === key && <Check className="h-4 w-4 text-blue-600" />}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default PeriodSelector;
