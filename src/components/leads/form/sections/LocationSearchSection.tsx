
import React from 'react';
import { Label } from '@/components/ui/label';
import SmartSearch from '@/components/common/SmartSearch';
import { COUNTRIES } from '@/utils/countries';
import { getAllLocations, getLocationsByCountry } from '@/utils/locationsByCountry';
import { MapPin } from 'lucide-react';

interface LocationSearchSectionProps {
  country: string;
  desiredLocation: string;
  onCountryChange: (country: string) => void;
  onLocationChange: (location: string) => void;
}

const LocationSearchSection: React.FC<LocationSearchSectionProps> = ({
  country,
  desiredLocation,
  onCountryChange,
  onLocationChange,
}) => {
  // Filter locations based on selected country
  const getFilteredLocations = (searchTerm: string) => {
    if (!country) {
      return getAllLocations()
        .filter(loc => loc.toLowerCase().includes(searchTerm.toLowerCase()))
        .slice(0, 10);
    }
    return getLocationsByCountry(country)
      .filter(loc => loc.toLowerCase().includes(searchTerm.toLowerCase()))
      .slice(0, 10);
  };

  const renderLocationItem = (location: string) => (
    <div className="text-sm py-1">{location}</div>
  );

  return (
    <div className="space-y-6">
      {/* Country Selection */}
      <div className="space-y-2">
        <Label className="text-sm">Pays</Label>
        <SmartSearch
          placeholder="Sélectionner un pays..."
          value={country}
          onChange={onCountryChange}
          onSelect={onCountryChange}
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

      {/* Location Selection */}
      <div className="space-y-2">
        <Label className="text-sm font-medium mb-2 flex items-center gap-2">
          <MapPin className="h-4 w-4" /> Localisation
        </Label>
        <SmartSearch
          placeholder="Ville, région..."
          value={desiredLocation}
          onChange={onLocationChange}
          onSelect={onLocationChange}
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
