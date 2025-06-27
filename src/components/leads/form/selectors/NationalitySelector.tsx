
import React, { useState, useEffect } from 'react';
import { Search, X, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { countryToFlag } from '@/utils/countryUtils';
import { COUNTRIES } from '@/utils/countries';
import { deriveNationalityFromCountry } from '@/components/chat/utils/nationalityUtils';

interface NationalitySelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (nationality: string) => void;
  selectedNationality?: string;
  title: string;
  searchPlaceholder: string;
}

const NationalitySelector: React.FC<NationalitySelectorProps> = ({
  isOpen,
  onClose,
  onSelect,
  selectedNationality,
  title,
  searchPlaceholder
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredNationalities, setFilteredNationalities] = useState<Array<{country: string, nationality: string}>>([]);

  useEffect(() => {
    const nationalitiesList = COUNTRIES.map(country => ({
      country,
      nationality: deriveNationalityFromCountry(country) || country
    }));

    if (searchTerm) {
      const filtered = nationalitiesList.filter(item =>
        item.nationality.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.country.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredNationalities(filtered);
    } else {
      setFilteredNationalities(nationalitiesList);
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

  const handleSelect = (nationality: string) => {
    onSelect(nationality);
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

        {/* Nationality List */}
        <div className="flex-1 overflow-auto">
          {filteredNationalities.length > 0 ? (
            <div className="p-2">
              {filteredNationalities.map(item => (
                <div
                  key={`${item.country}-${item.nationality}`}
                  className="flex items-center justify-between p-3 hover:bg-accent rounded-lg cursor-pointer transition-colors"
                  onClick={() => handleSelect(item.nationality)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{countryToFlag(item.country)}</span>
                    <span className="font-futura">{item.nationality}</span>
                  </div>
                  {selectedNationality === item.nationality && (
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

export default NationalitySelector;
