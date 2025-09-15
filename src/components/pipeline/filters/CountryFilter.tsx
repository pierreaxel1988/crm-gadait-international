import React from 'react';
import { Globe } from 'lucide-react';
import { COUNTRIES } from '@/utils/countries';
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
          {COUNTRIES.map((countryName) => (
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