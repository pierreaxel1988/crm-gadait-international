import React from 'react';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';
import { MauritiusRegion } from '@/types/lead';

interface RegionsFilterProps {
  selectedRegions: MauritiusRegion[];
  onRegionsChange: (regions: MauritiusRegion[]) => void;
}

const mauritiusRegions: MauritiusRegion[] = [
  'North',
  'South', 
  'West',
  'East'
];

const RegionsFilter: React.FC<RegionsFilterProps> = ({
  selectedRegions,
  onRegionsChange
}) => {
  const toggleRegion = (region: MauritiusRegion) => {
    if (selectedRegions.includes(region)) {
      onRegionsChange(selectedRegions.filter(r => r !== region));
    } else {
      onRegionsChange([...selectedRegions, region]);
    }
  };

  const clearRegions = () => {
    onRegionsChange([]);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-futura font-medium text-loro-navy flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Régions Maurice
          {selectedRegions.length > 0 && (
            <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
              {selectedRegions.length}
            </span>
          )}
        </h4>
        {selectedRegions.length > 0 && (
          <button
            onClick={clearRegions}
            className="text-xs text-loro-navy/60 hover:text-loro-navy font-futura"
          >
            Effacer
          </button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {mauritiusRegions.map((region) => (
          <Badge
            key={region}
            variant={selectedRegions.includes(region) ? "default" : "outline"}
            className={`cursor-pointer font-futura transition-all duration-200 ${
              selectedRegions.includes(region)
                ? 'bg-loro-sand text-loro-navy hover:bg-loro-sand/90'
                : 'border-loro-pearl text-loro-navy/70 hover:bg-loro-white hover:border-loro-sand'
            }`}
            onClick={() => toggleRegion(region)}
          >
            {region}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default RegionsFilter;