
import React from 'react';
import { MapPin, X } from 'lucide-react';
import SmartSearch from '@/components/common/SmartSearch';
import { Badge } from '@/components/ui/badge';
import { usePropertyLocations } from '@/hooks/usePropertyLocations';
import { Loader2 } from 'lucide-react';

interface LocationFilterProps {
  location: string | string[];
  onLocationChange: (location: string | string[]) => void;
  country?: string;
}

const LocationFilter = ({ location, onLocationChange, country }: LocationFilterProps) => {
  const [searchValue, setSearchValue] = React.useState('');
  
  // Fetch locations dynamically from DatoCMS
  const { data: availableLocations, isLoading } = usePropertyLocations(country);
  
  // Convert location to array if it's a string
  const locationArray = Array.isArray(location) 
    ? location 
    : location ? [location] : [];
    
  // Get locations based on selected country
  const getFilteredLocations = (searchTerm: string) => {
    const locations = availableLocations || [];
    
    // Ensure searchTerm is a string and not undefined
    const term = String(searchTerm || '');
    
    if (!term || term.length < 1) {
      // Show top 10 most popular locations when no search term
      return locations.slice(0, 10);
    }
    
    return locations
      .filter(loc => 
        loc.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .includes(term.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
      )
      .slice(0, 15); // Show more results when searching
  };

  const handleLocationSelect = (selectedLocation: string) => {
    if (!locationArray.includes(selectedLocation)) {
      onLocationChange([...locationArray, selectedLocation]);
      setSearchValue('');
    }
  };

  const handleLocationRemove = (loc: string) => {
    onLocationChange(locationArray.filter(l => l !== loc));
  };

  const handleClear = () => {
    onLocationChange([]);
    setSearchValue('');
  };

  const renderLocationItem = (location: string) => (
    <div className="text-sm py-1">{location}</div>
  );

  return (
    <div>
      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
        <MapPin className="h-4 w-4" /> Localisation
        {country && <span className="text-xs text-muted-foreground">({country})</span>}
      </h4>
      
      {/* Selected locations */}
      {locationArray.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {locationArray.map((loc) => (
            <Badge 
              key={loc} 
              variant="secondary"
              className="gap-1.5 px-2.5"
            >
              {loc}
              <X 
                className="h-3 w-3 cursor-pointer hover:text-destructive" 
                onClick={() => handleLocationRemove(loc)}
              />
            </Badge>
          ))}
        </div>
      )}
      
      <div className="relative">
        {isLoading ? (
          <div className="flex items-center justify-center py-2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Chargement des localisations...</span>
          </div>
        ) : (
          <SmartSearch
            placeholder={country ? `Ville, région dans ${country}...` : "Ville, région..."}
            value={searchValue}
            onChange={setSearchValue}
            onSelect={handleLocationSelect}
            onClear={handleClear}
            results={getFilteredLocations(searchValue)}
            renderItem={renderLocationItem}
            className="w-full"
            inputClassName="h-8 text-sm"
            minChars={0}
            searchIcon={true}
            clearButton={true}
          />
        )}
      </div>
    </div>
  );
};

export default LocationFilter;
