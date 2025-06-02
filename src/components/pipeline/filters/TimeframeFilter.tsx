
import React from 'react';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';
import { PurchaseTimeframe } from '@/types/lead';

interface TimeframeFilterProps {
  purchaseTimeframe: PurchaseTimeframe | null;
  onTimeframeChange: (timeframe: PurchaseTimeframe | null) => void;
}

const TimeframeFilter = ({ purchaseTimeframe, onTimeframeChange }: TimeframeFilterProps) => {
  const timeframes: (PurchaseTimeframe | null)[] = [
    null, 'Moins de trois mois', 'Plus de trois mois'
  ];

  return (
    <div>
      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
        <Clock className="h-4 w-4" /> Délai d'achat
      </h4>
      <div className="grid grid-cols-3 gap-2">
        {timeframes.map((timeframe) => (
          <Button
            key={timeframe || 'all'}
            variant={purchaseTimeframe === timeframe ? "default" : "outline"}
            size="sm"
            className="text-xs"
            onClick={() => onTimeframeChange(timeframe)}
          >
            {timeframe ? (timeframe === 'Moins de trois mois' ? '< 3 mois' : '> 3 mois') : 'Tous'}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default TimeframeFilter;
