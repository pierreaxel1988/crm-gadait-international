
import React from 'react';
import { MapPin } from 'lucide-react';
import { getAllLocations, getLocationsByCountry } from '@/utils/locationsByCountry';
import SmartSearch from '@/components/common/SmartSearch';
import FilterGroup from './FilterGroup';

interface LocationSearchFilterProps {
  location: string;
  onLocationChange: (location: string) => void;
  country?: string;
  className?: string;
}

const LocationSearchFilter = ({ 
  location, 
  onLocationChange, 
  country,
  className
}: LocationSearchFilterProps) => {
  // Get locations based on selected country
  const getFilteredLocations = (searchTerm: string) => {
    // If a country is selected, only show locations from that country
    const locations = country ? getLocationsByCountry(country) : getAllLocations();
    
    // Helper function to normalize text for comparison
    const normalize = (text: string) => 
      text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    // Filter and limit results
    return locations
      .filter(loc => normalize(loc).includes(normalize(searchTerm)))
      .slice(0, 10); // Limit to 10 suggestions
  };

  const renderLocationItem = (location: string) => (
    <div className="text-sm py-1">{location}</div>
  );

  return (
    <FilterGroup className={className}>
      <div className="flex items-center gap-2 text-sm">
        <MapPin className="h-4 w-4" />
        <span className="font-medium">Localisation</span>
      </div>
      
      <SmartSearch
        placeholder="Ville, région..."
        value={location}
        onChange={onLocationChange}
        onSelect={onLocationChange}
        results={getFilteredLocations(location)}
        renderItem={renderLocationItem}
        className="w-full"
        inputClassName="h-8 text-sm"
        minChars={1}
        searchIcon={true}
        clearButton={true}
      />
    </FilterGroup>
  );
};

export default LocationSearchFilter;
