import React, { useState } from 'react';
import { Globe } from 'lucide-react';
import SmartSearch from '@/components/common/SmartSearch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Liste des pays où vous vendez
const AVAILABLE_COUNTRIES = [
  'Croatia',
  'France', 
  'Greece',
  'Maldives',
  'Mauritius',
  'Portugal',
  'Seychelles',
  'Spain',
  'Switzerland',
  'United Arab Emirates',
  'United Kingdom',
  'United States'
];

interface CountryFilterProps {
  country: string;
  onCountryChange: (country: string) => void;
}

const CountryFilter = ({ country, onCountryChange }: CountryFilterProps) => {
  const [searchValue, setSearchValue] = useState('');

  // Get filtered countries based on search term
  const getFilteredCountries = (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 1) {
      // Show all available countries when no search term
      return AVAILABLE_COUNTRIES;
    }
    
    return AVAILABLE_COUNTRIES
      .filter(countryName => 
        countryName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .includes(searchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
      );
  };

  const handleCountrySelect = (selectedCountry: string) => {
    // Only update filter if the selected country is in our available list
    if (AVAILABLE_COUNTRIES.includes(selectedCountry)) {
      onCountryChange(selectedCountry);
      setSearchValue(''); // Clear search after selection
    }
  };

  const handleClear = () => {
    onCountryChange('');
    setSearchValue('');
  };

  const handleInputChange = (value: string) => {
    setSearchValue(value);
    // Don't update the filter on input change, only on selection
  };

  const renderCountryItem = (countryName: string) => (
    <div className="text-sm py-1">{countryName}</div>
  );

  // Show selected country or search value
  const displayValue = country || searchValue;

  return (
    <div>
      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
        <Globe className="h-4 w-4" /> Pays
      </h4>
      <div className="relative">
        <SmartSearch
          placeholder="Rechercher un pays..."
          value={displayValue}
          onChange={handleInputChange}
          onSelect={handleCountrySelect}
          onClear={handleClear}
          results={getFilteredCountries(searchValue)}
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