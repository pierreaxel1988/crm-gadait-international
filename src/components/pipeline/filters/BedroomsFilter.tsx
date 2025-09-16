import React from 'react';
import { Button } from '@/components/ui/button';
import { Bed } from 'lucide-react';

interface BedroomsFilterProps {
  minBedrooms: number | null;
  maxBedrooms: number | null;
  onBedroomsChange: (min: number | null, max: number | null) => void;
}

const bedroomOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const BedroomsFilter: React.FC<BedroomsFilterProps> = ({
  minBedrooms,
  maxBedrooms,
  onBedroomsChange
}) => {
  const handleMinChange = (value: number) => {
    if (minBedrooms === value) {
      onBedroomsChange(null, maxBedrooms);
    } else {
      onBedroomsChange(value, maxBedrooms);
    }
  };

  const handleMaxChange = (value: number) => {
    if (maxBedrooms === value) {
      onBedroomsChange(minBedrooms, null);
    } else {
      onBedroomsChange(minBedrooms, value);
    }
  };

  const clearFilter = () => {
    onBedroomsChange(null, null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <Bed className="h-4 w-4" /> Chambres
          {(minBedrooms || maxBedrooms) && (
            <span className="ml-1 text-primary font-medium">
              : {minBedrooms || 0}
              {maxBedrooms && maxBedrooms !== minBedrooms && ` - ${maxBedrooms}`}
              {!maxBedrooms && minBedrooms && '+'}
            </span>
          )}
        </h4>
        {(minBedrooms || maxBedrooms) && (
          <button
            onClick={clearFilter}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Effacer
          </button>
        )}
      </div>
      
      <div className="space-y-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Minimum</label>
          <div className="flex flex-wrap gap-1.5">
            {bedroomOptions.map((value) => (
              <Button
                key={`min-${value}`}
                variant={minBedrooms === value ? "default" : "outline"}
                size="sm"
                className="text-xs h-7 px-2 min-w-[32px]"
                onClick={() => handleMinChange(value)}
              >
                {value}
              </Button>
            ))}
          </div>
        </div>
        
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Maximum</label>
          <div className="flex flex-wrap gap-1.5">
            {bedroomOptions.map((value) => (
              <Button
                key={`max-${value}`}
                variant={maxBedrooms === value ? "default" : "outline"}
                size="sm"
                className="text-xs h-7 px-2 min-w-[32px]"
                onClick={() => handleMaxChange(value)}
              >
                {value}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BedroomsFilter;