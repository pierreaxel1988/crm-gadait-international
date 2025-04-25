
import React from 'react';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';
import { PurchaseTimeframe } from '@/types/lead';
import FilterGroup from './FilterGroup';

interface TimeframeFilterProps {
  purchaseTimeframe: PurchaseTimeframe | null;
  onTimeframeChange: (timeframe: PurchaseTimeframe | null) => void;
  className?: string;
}

const TimeframeFilter = ({ 
  purchaseTimeframe, 
  onTimeframeChange,
  className
}: TimeframeFilterProps) => {
  const timeframes: (PurchaseTimeframe | null)[] = [
    null, 'Moins de trois mois', 'Plus de trois mois'
  ];

  const getTimeframeLabel = (timeframe: PurchaseTimeframe | null): string => {
    if (!timeframe) return 'Tous';
    return timeframe === 'Moins de trois mois' ? '< 3 mois' : '> 3 mois';
  };

  return (
    <FilterGroup className={className}>
      <div className="flex items-center gap-2 text-sm">
        <Clock className="h-4 w-4" />
        <span className="font-medium">Délai d'achat</span>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        {timeframes.map((timeframe) => (
          <Button
            key={timeframe || 'all'}
            variant={purchaseTimeframe === timeframe ? "default" : "outline"}
            size="sm"
            className="text-xs"
            onClick={() => onTimeframeChange(timeframe)}
          >
            {getTimeframeLabel(timeframe)}
          </Button>
        ))}
      </div>
    </FilterGroup>
  );
};

export default TimeframeFilter;
