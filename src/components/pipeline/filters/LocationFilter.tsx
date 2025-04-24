
import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';
import { getAllLocations } from '@/utils/locationsByCountry';
import SmartSearch from '@/components/common/SmartSearch';

interface LocationFilterProps {
  location: string;
  onLocationChange: (location: string) => void;
}

const LocationFilter = ({ location, onLocationChange }: LocationFilterProps) => {
  const [searchTerm, setSearchTerm] = useState(location);
  const [filteredLocations, setFilteredLocations] = useState<string[]>([]);
  
  // Get all available locations
  const allLocations = getAllLocations();

  useEffect(() => {
    // Update filtered locations when search term changes
    if (searchTerm) {
      const normalizedSearchTerm = searchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const filtered = allLocations.filter(loc => {
        const normalizedLoc = loc.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return normalizedLoc.includes(normalizedSearchTerm);
      }).slice(0, 10); // Limit to 10 suggestions
      setFilteredLocations(filtered);
    } else {
      setFilteredLocations([]);
    }
  }, [searchTerm, allLocations]);

  const handleLocationSelect = (location: string) => {
    onLocationChange(location);
  };

  const renderLocationItem = (location: string) => (
    <div className="text-sm py-1">{location}</div>
  );

  return (
    <div>
      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
        <MapPin className="h-4 w-4" /> Localisation
      </h4>
      <div className="relative">
        <SmartSearch
          placeholder="Ville, région, pays..."
          value={searchTerm}
          onChange={(value) => {
            setSearchTerm(value);
            // Update filter value directly when typing
            onLocationChange(value);
          }}
          onSelect={handleLocationSelect}
          results={filteredLocations}
          renderItem={renderLocationItem}
          className="w-full"
          inputClassName="h-8 text-sm"
          minChars={1}
          searchIcon={true}
          clearButton={true}
        />
      </div>
    </div>
  );
};

export default LocationFilter;
