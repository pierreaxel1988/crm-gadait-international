import React from 'react';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Liste des pays où vous vendez (harmonisée avec la base de données)
const AVAILABLE_COUNTRIES = [
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

interface CountryFilterProps {
  country: string;
  onCountryChange: (country: string) => void;
}

const CountryFilter = ({ country, onCountryChange }: CountryFilterProps) => {
  const handleCountrySelect = (selectedCountry: string) => {
    // Si le pays est déjà sélectionné, le désélectionner
    if (country === selectedCountry) {
      onCountryChange('');
    } else {
      onCountryChange(selectedCountry);
    }
  };

  return (
    <div>
      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
        <Globe className="h-4 w-4" /> Pays
        {country && (
          <span className="ml-1 text-primary font-medium">: {country}</span>
        )}
      </h4>
      <div className="flex flex-wrap gap-1.5">
        <Button
          variant={!country ? "default" : "outline"}
          size="sm"
          className="text-xs h-7 px-3 min-w-0 whitespace-nowrap"
          onClick={() => onCountryChange('')}
        >
          Tous
        </Button>
        {AVAILABLE_COUNTRIES.map((countryOption) => (
          <Button
            key={countryOption}
            variant={country === countryOption ? "default" : "outline"}
            size="sm"
            className="text-xs h-7 px-3 min-w-0 whitespace-nowrap"
            onClick={() => handleCountrySelect(countryOption)}
          >
            {countryOption}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default CountryFilter;