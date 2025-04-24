
import React from 'react';
import { MapPin } from 'lucide-react';
import { getAllLocations, getLocationsByCountry } from '@/utils/locationsByCountry';
import SmartSearch from '@/components/common/SmartSearch';

interface LocationFilterProps {
  location: string;
  onLocationChange: (location: string) => void;
  country?: string;
}

const LocationFilter = ({ location, onLocationChange, country }: LocationFilterProps) => {
  // Get locations based on selected country
  const getFilteredLocations = (searchTerm: string) => {
    // If a country is selected, only show locations from that country
    const locations = country ? getLocationsByCountry(country) : getAllLocations();
    
    return locations
      .filter(loc => 
        loc.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .includes(searchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
      )
      .slice(0, 10); // Limit to 10 suggestions
  };

  const handleLocationSelect = (selectedLocation: string) => {
    onLocationChange(selectedLocation);
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
          placeholder="Ville, région..."
          value={location}
          onChange={onLocationChange}
          onSelect={handleLocationSelect}
          results={getFilteredLocations(location)}
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
