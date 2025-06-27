
import React, { useState, useEffect } from 'react';
import { Search, X, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { countryToFlag } from '@/utils/countryUtils';
import { COUNTRIES } from '@/utils/countries';

interface CountrySelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (country: string) => void;
  selectedCountry?: string;
  title: string;
  searchPlaceholder: string;
}

const CountrySelector: React.FC<CountrySelectorProps> = ({
  isOpen,
  onClose,
  onSelect,
  selectedCountry,
  title,
  searchPlaceholder
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCountries, setFilteredCountries] = useState(COUNTRIES);

  useEffect(() => {
    if (searchTerm) {
      const filtered = COUNTRIES.filter(country =>
        country.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCountries(filtered);
    } else {
      setFilteredCountries(COUNTRIES);
    }
  }, [searchTerm]);

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSelect = (country: string) => {
    onSelect(country);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-background">
          <h2 className="text-lg font-semibold font-futura">{title}</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="p-4 border-b bg-background">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              className="pl-10 font-futura"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
            {searchTerm && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={() => setSearchTerm('')}
              >
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Country List */}
        <div className="flex-1 overflow-auto">
          {filteredCountries.length > 0 ? (
            <div className="p-2">
              {filteredCountries.map(country => (
                <div
                  key={country}
                  className="flex items-center justify-between p-3 hover:bg-accent rounded-lg cursor-pointer transition-colors"
                  onClick={() => handleSelect(country)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{countryToFlag(country)}</span>
                    <span className="font-futura">{country}</span>
                  </div>
                  {selectedCountry === country && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32">
              <p className="text-muted-foreground font-futura">Aucun résultat trouvé</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CountrySelector;
