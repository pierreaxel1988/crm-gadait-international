import React from 'react';
import { Globe } from 'lucide-react';
import { COUNTRIES } from '@/utils/countries';
import SmartSearch from '@/components/common/SmartSearch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CountryFilterProps {
  country: string;
  onCountryChange: (country: string) => void;
}

const CountryFilter = ({ country, onCountryChange }: CountryFilterProps) => {
  // Get filtered countries based on search term
  const getFilteredCountries = (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 1) {
      // Show top 10 most popular countries when no search term
      return COUNTRIES.slice(0, 10);
    }
    
    return COUNTRIES
      .filter(countryName => 
        countryName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .includes(searchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
      )
      .slice(0, 15); // Show more results when searching
  };

  const handleCountrySelect = (selectedCountry: string) => {
    onCountryChange(selectedCountry);
  };

  const renderCountryItem = (countryName: string) => (
    <div className="text-sm py-1">{countryName}</div>
  );
  return (
    <div>
      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
        <Globe className="h-4 w-4" /> Pays
      </h4>
      <div className="relative">
        <SmartSearch
          placeholder="Rechercher un pays..."
          value={country || ''}
          onChange={(value) => onCountryChange(value)}
          onSelect={handleCountrySelect}
          results={getFilteredCountries(country || '')}
          renderItem={renderCountryItem}
          className="w-full"
          inputClassName="h-8 text-sm"
          minChars={0}
          searchIcon={true}
          clearButton={true}
        />
      </div>
    </div>
  );
};

export default CountryFilter;