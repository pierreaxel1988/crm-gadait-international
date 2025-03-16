
import React from 'react';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';

interface LocationFilterProps {
  location: string;
  onLocationChange: (location: string) => void;
}

const LocationFilter = ({ location, onLocationChange }: LocationFilterProps) => {
  return (
    <div>
      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
        <MapPin className="h-4 w-4" /> Localisation
      </h4>
      <Input
        type="text"
        value={location}
        onChange={(e) => onLocationChange(e.target.value)}
        placeholder="Ville, région, pays..."
        className="h-8 text-sm"
      />
    </div>
  );
};

export default LocationFilter;
