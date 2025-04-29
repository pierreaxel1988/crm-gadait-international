
import React from 'react';
import { Label } from '@/components/ui/label';
import SmartSearch from '@/components/common/SmartSearch';
import { COUNTRIES } from '@/utils/countries';
import { getAllLocations, getLocationsByCountry } from '@/utils/locationsByCountry';
import { MapPin } from 'lucide-react';
import { countryMatchesSearch } from '@/components/chat/utils/nationalityUtils';

interface LocationSearchSectionProps {
  country: string;
  desiredLocation: string;
  onCountryChange: (value: string) => void;
  onLocationChange: (value: string) => void;
}

const LocationSearchSection: React.FC<LocationSearchSectionProps> = ({
  country,
  desiredLocation,
  onCountryChange,
  onLocationChange,
}) => {
  const getFilteredLocations = (searchTerm: string) => {
    if (!country) {
      return getAllLocations()
        .filter(loc => loc.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
          .includes(searchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")))
        .slice(0, 10);
    }
    
    // Handle special case for USA aliases
    const lookupCountry = country === 'USA' || country === 'États-Unis' || country === 'Etats-Unis' 
      ? 'United States' 
      : country;
      
    return getLocationsByCountry(lookupCountry)
      .filter(loc => loc.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .includes(searchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")))
      .slice(0, 10);
  };

  const getFilteredCountries = (searchTerm: string) => {
    if (!searchTerm) return COUNTRIES.slice(0, 10);
    
    // Normalize the search term to handle accents
    const normalizedSearchTerm = searchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    // Special case for USA/United States search
    if (normalizedSearchTerm === 'usa' || 
        normalizedSearchTerm === 'us' || 
        normalizedSearchTerm === 'united' || 
        normalizedSearchTerm === 'etats' || 
        normalizedSearchTerm === 'états' || 
        normalizedSearchTerm === 'unis') {
      return COUNTRIES.filter(c => 
        c === 'USA' || 
        c === 'United States' || 
        c === 'États-Unis' || 
        c === 'Etats-Unis'
      );
    }
    
    return COUNTRIES.filter(c => {
      const normalizedCountry = c.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return normalizedCountry.includes(normalizedSearchTerm) || countryMatchesSearch(c, searchTerm);
    }).slice(0, 10);
  };

  const handleLocationSelect = (location: string) => {
    onLocationChange(location);
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
          results={getFilteredCountries(country)}
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
          <MapPin className="h-4 w-4" /> Localisation
        </Label>
        <SmartSearch
          placeholder="Ville, région..."
          value={desiredLocation}
          onChange={onLocationChange}
          onSelect={handleLocationSelect}
          results={getFilteredLocations(desiredLocation)}
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

export default LocationSearchSection;
