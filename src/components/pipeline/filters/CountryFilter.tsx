import React from 'react';
import { Globe } from 'lucide-react';
import { LOCATIONS_BY_COUNTRY } from '@/utils/locationsByCountry';
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
  // Extract only the countries where we sell properties
  const availableCountries = Object.keys(LOCATIONS_BY_COUNTRY).filter(countryName => 
    // Remove duplicates (USA, Etats-Unis, Greece/Grèce)
    !['USA', 'Etats-Unis', 'Grèce'].includes(countryName)
  ).sort();
  return (
    <div>
      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
        <Globe className="h-4 w-4" /> Pays
      </h4>
      <Select value={country || "all"} onValueChange={(value) => onCountryChange(value === "all" ? "" : value)}>
        <SelectTrigger className="h-8 text-sm">
          <SelectValue placeholder="Sélectionner un pays" />
        </SelectTrigger>
        <SelectContent className="max-h-48 overflow-y-auto">
          <SelectItem value="all">Tous les pays</SelectItem>
          {availableCountries.map((countryName) => (
            <SelectItem key={countryName} value={countryName}>
              {countryName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CountryFilter;