
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { countryToFlag } from '@/utils/countryUtils';

interface PropertyCountryFilterProps {
  selectedCountries: string[];
  onCountriesChange: (countries: string[]) => void;
}

const availableCountries = [
  'Croatia',
  'France', 
  'Grèce',
  'Maldives',
  'Mauritius',
  'Portugal',
  'Seychelles',
  'Spain',
  'Switzerland',
  'UAE',
  'United Kingdom',
  'United States'
];

const PropertyCountryFilter: React.FC<PropertyCountryFilterProps> = ({
  selectedCountries,
  onCountriesChange
}) => {
  const toggleCountry = (country: string) => {
    if (selectedCountries.includes(country)) {
      onCountriesChange(selectedCountries.filter(c => c !== country));
    } else {
      onCountriesChange([...selectedCountries, country]);
    }
  };

  return (
    <div>
      <h4 className="font-futura font-medium text-loro-navy mb-3">Pays</h4>
      <div className="flex flex-wrap gap-2">
        {availableCountries.map((country) => (
          <Badge
            key={country}
            variant={selectedCountries.includes(country) ? "default" : "outline"}
            className={`cursor-pointer font-futura transition-all duration-200 ${
              selectedCountries.includes(country)
                ? 'bg-loro-sand text-loro-navy hover:bg-loro-sand/90'
                : 'border-loro-pearl text-loro-navy/70 hover:bg-loro-white hover:border-loro-sand'
            }`}
            onClick={() => toggleCountry(country)}
          >
            {countryToFlag(country)} {country}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default PropertyCountryFilter;
