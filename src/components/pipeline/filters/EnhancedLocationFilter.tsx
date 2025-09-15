import React from 'react';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';
import { getAllLocations, getLocationsByCountry } from '@/utils/locationsByCountry';
import SmartSearch from '@/components/common/SmartSearch';

interface EnhancedLocationFilterProps {
  location: string;
  onLocationChange: (location: string) => void;
  country?: string;
}

const EnhancedLocationFilter = ({ location, onLocationChange, country }: EnhancedLocationFilterProps) => {
  const getFilteredLocations = (searchTerm: string) => {
    const locations = country ? getLocationsByCountry(country) : getAllLocations();
    
    return locations
      .filter(loc => 
        loc.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .includes(searchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
      )
      .slice(0, 10);
  };

  const handleLocationSelect = (selectedLocation: string) => {
    onLocationChange(selectedLocation);
  };

  const renderLocationItem = (locationItem: string) => (
    <div className="text-sm py-2 px-1 hover:bg-accent rounded flex items-center gap-2">
      <MapPin className="h-3 w-3 text-muted-foreground" />
      {locationItem}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="h-5 w-5 text-primary" />
        <h4 className="font-medium text-foreground">Localisation</h4>
        {location && (
          <Badge variant="secondary" className="text-xs">
            {location}
          </Badge>
        )}
      </div>
      
      <div className="space-y-3">
        <div className="relative">
          <SmartSearch
            placeholder="Rechercher une ville, région..."
            value={location}
            onChange={onLocationChange}
            onSelect={handleLocationSelect}
            results={getFilteredLocations(location)}
            renderItem={renderLocationItem}
            className="w-full"
            inputClassName="h-12 text-base pl-10"
            minChars={1}
            searchIcon={true}
            clearButton={true}
          />
        </div>

        {location && (
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">
              Localisation sélectionnée :
            </span>
            <span className="text-sm font-medium">{location}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedLocationFilter;