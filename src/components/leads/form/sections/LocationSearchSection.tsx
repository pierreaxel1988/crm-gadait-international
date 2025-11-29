
import React from 'react';
import { Label } from '@/components/ui/label';
import SmartSearch from '@/components/common/SmartSearch';
import { COUNTRIES } from '@/utils/countries';
import { MapPin, X, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { usePropertyLocations } from '@/hooks/usePropertyLocations';

interface LocationSearchSectionProps {
  country: string;
  desiredLocation: string | string[];
  onCountryChange: (value: string) => void;
  onLocationChange: (value: string | string[]) => void;
}

const LocationSearchSection: React.FC<LocationSearchSectionProps> = ({
  country,
  desiredLocation,
  onCountryChange,
  onLocationChange,
}) => {
  const [searchValue, setSearchValue] = React.useState('');
  
  // Fetch locations dynamically from DatoCMS
  const { data: availableLocations, isLoading } = usePropertyLocations(country);
  
  // Convert desiredLocation to array if it's a string
  const locationArray = Array.isArray(desiredLocation) 
    ? desiredLocation 
    : desiredLocation ? [desiredLocation] : [];

  const getFilteredLocations = (searchTerm: string) => {
    const locations = availableLocations || [];
    
    if (!searchTerm || searchTerm.length < 1) {
      return locations.slice(0, 10);
    }
    
    return locations
      .filter(loc => 
        loc.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .includes(searchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
      )
      .slice(0, 15);
  };

  const handleLocationSelect = (location: string) => {
    if (!locationArray.includes(location)) {
      onLocationChange([...locationArray, location]);
      setSearchValue('');
    }
  };

  const handleLocationRemove = (location: string) => {
    onLocationChange(locationArray.filter(loc => loc !== location));
  };

  const handleCountrySelect = (country: string) => {
    onCountryChange(country);
  };

  const renderLocationItem = (location: string) => (
    <div className="text-sm py-1">{location}</div>
  );

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-sm">Pays</Label>
        <SmartSearch
          placeholder="Sélectionner un pays..."
          value={country}
          onChange={onCountryChange}
          onSelect={handleCountrySelect}
          results={COUNTRIES.filter(c => 
            c.toLowerCase().includes(country.toLowerCase())
          ).slice(0, 10)}
          renderItem={renderLocationItem}
          className="w-full"
          inputClassName="h-8 text-sm"
          minChars={1}
          searchIcon={true}
          clearButton={true}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium mb-2 flex items-center gap-2">
          <MapPin className="h-4 w-4" /> Localisations (plusieurs possibles)
        </Label>
        
      {/* Selected locations */}
      {locationArray.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {locationArray.map((location) => (
            <Badge 
              key={location} 
              variant="secondary"
              className="gap-1.5 px-2.5"
            >
              {location}
              <X 
                className="h-3 w-3 cursor-pointer hover:text-destructive" 
                onClick={() => handleLocationRemove(location)}
              />
            </Badge>
          ))}
        </div>
      )}
        
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
            onClear={() => setSearchValue('')}
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

export default LocationSearchSection;
