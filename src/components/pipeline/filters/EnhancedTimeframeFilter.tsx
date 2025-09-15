import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Zap, Calendar } from 'lucide-react';
import { PurchaseTimeframe } from '@/types/lead';

interface EnhancedTimeframeFilterProps {
  purchaseTimeframe: PurchaseTimeframe | null;
  onTimeframeChange: (timeframe: PurchaseTimeframe | null) => void;
}

const EnhancedTimeframeFilter = ({ purchaseTimeframe, onTimeframeChange }: EnhancedTimeframeFilterProps) => {
  const timeframes: Array<{ value: PurchaseTimeframe | null; label: string; description: string; icon: React.ComponentType<{ className?: string }> }> = [
    { 
      value: null, 
      label: 'Tous les délais', 
      description: 'Tous les clients', 
      icon: Clock 
    },
    { 
      value: 'Moins de trois mois', 
      label: 'Urgent', 
      description: '< 3 mois', 
      icon: Zap 
    },
    { 
      value: 'Plus de trois mois', 
      label: 'À long terme', 
      description: '> 3 mois', 
      icon: Calendar 
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="h-5 w-5 text-primary" />
        <h4 className="font-medium text-foreground">Délai d'achat</h4>
        {purchaseTimeframe && (
          <Badge variant="secondary" className="text-xs">
            {purchaseTimeframe === 'Moins de trois mois' ? 'Urgent' : 'À long terme'}
          </Badge>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {timeframes.map((timeframe) => {
          const Icon = timeframe.icon;
          const isSelected = purchaseTimeframe === timeframe.value;
          
          return (
            <Button
              key={timeframe.value || 'all'}
              variant={isSelected ? "default" : "outline"}
              size="lg"
              className={`h-auto p-4 flex flex-col items-center gap-2 transition-all duration-200 ${
                isSelected 
                  ? 'shadow-md border-primary/50' 
                  : 'hover:border-primary/30 hover:shadow-sm'
              }`}
              onClick={() => onTimeframeChange(timeframe.value)}
            >
              <Icon className={`h-5 w-5 ${isSelected ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
              <div className="text-center">
                <div className={`text-sm font-medium ${isSelected ? 'text-primary-foreground' : 'text-foreground'}`}>
                  {timeframe.label}
                </div>
                <div className={`text-xs ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                  {timeframe.description}
                </div>
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default EnhancedTimeframeFilter;