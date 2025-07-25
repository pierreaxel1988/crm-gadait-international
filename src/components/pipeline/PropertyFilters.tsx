
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Filter, SlidersHorizontal, X } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import PropertyCountryFilter from './PropertyCountryFilter';
import LocationFilter from './filters/LocationFilter';

interface PropertyFiltersProps {
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  selectedTypes: string[];
  onTypesChange: (types: string[]) => void;
  selectedLocations: string[];
  onLocationsChange: (locations: string[]) => void;
  selectedCountries: string[];
  onCountriesChange: (countries: string[]) => void;
  transactionType: 'all' | 'buy' | 'rent';
  onTransactionTypeChange: (type: 'all' | 'buy' | 'rent') => void;
  minBedrooms: number;
  onMinBedroomsChange: (min: number) => void;
  isOpen: boolean;
  onToggle: () => void;
  onClearFilters: () => void;
}

const propertyTypes = [
  'Villa', 'Appartement', 'Penthouse', 'Chalet', 'Maison', 'Duplex', 'Terrain', 'Manoir', 'Maison de ville', 'Château', 'Local commercial'
];

const PropertyFilters: React.FC<PropertyFiltersProps> = ({
  priceRange,
  onPriceRangeChange,
  selectedTypes,
  onTypesChange,
  selectedLocations,
  onLocationsChange,
  selectedCountries,
  onCountriesChange,
  transactionType,
  onTransactionTypeChange,
  minBedrooms,
  onMinBedroomsChange,
  isOpen,
  onToggle,
  onClearFilters
}) => {
  const activeFiltersCount = selectedTypes.length + selectedLocations.length + selectedCountries.length +
    (priceRange[0] > 0 || priceRange[1] < 10000000 ? 1 : 0) +
    (transactionType !== 'all' ? 1 : 0) +
    (minBedrooms > 0 ? 1 : 0);

  const toggleType = (type: string) => {
    if (selectedTypes.includes(type)) {
      onTypesChange(selectedTypes.filter(t => t !== type));
    } else {
      onTypesChange([...selectedTypes, type]);
    }
  };

  const handleLocationSelect = (location: string) => {
    if (!selectedLocations.includes(location)) {
      onLocationsChange([...selectedLocations, location]);
    }
  };

  const removeLocation = (location: string) => {
    onLocationsChange(selectedLocations.filter(l => l !== location));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={onToggle}
          className="relative h-10 px-4 font-futura border-loro-pearl hover:bg-loro-white"
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filtres
          {activeFiltersCount > 0 && (
            <Badge className="ml-2 h-5 w-5 flex items-center justify-center p-0 bg-loro-sand text-loro-navy text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
        
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-loro-navy/70 hover:text-loro-navy hover:bg-loro-white"
          >
            <X className="h-4 w-4 mr-1" />
            Effacer tout
          </Button>
        )}
      </div>

      {isOpen && (
        <Card className="border-loro-pearl shadow-luxury">
          <CardContent className="p-6 space-y-6">
            {/* Transaction Type Filter */}
            <div>
              <h4 className="font-futura font-medium text-loro-navy mb-3">Type de transaction</h4>
              <ToggleGroup 
                type="single" 
                value={transactionType} 
                onValueChange={(value) => onTransactionTypeChange(value as 'all' | 'buy' | 'rent' || 'all')}
                className="justify-start"
              >
                <ToggleGroupItem 
                  value="all" 
                  className="font-futura data-[state=on]:bg-loro-sand data-[state=on]:text-loro-navy border-loro-pearl"
                >
                  Tout
                </ToggleGroupItem>
                <ToggleGroupItem 
                  value="buy" 
                  className="font-futura data-[state=on]:bg-loro-sand data-[state=on]:text-loro-navy border-loro-pearl"
                >
                  Achat
                </ToggleGroupItem>
                <ToggleGroupItem 
                  value="rent" 
                  className="font-futura data-[state=on]:bg-loro-sand data-[state=on]:text-loro-navy border-loro-pearl"
                >
                  Location
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            {/* Types de propriété */}
            <div>
              <h4 className="font-futura font-medium text-loro-navy mb-3">Type de propriété</h4>
              <div className="flex flex-wrap gap-2">
                {propertyTypes.map((type) => (
                  <Badge
                    key={type}
                    variant={selectedTypes.includes(type) ? "default" : "outline"}
                    className={`cursor-pointer font-futura transition-all duration-200 ${
                      selectedTypes.includes(type)
                        ? 'bg-loro-sand text-loro-navy hover:bg-loro-sand/90'
                        : 'border-loro-pearl text-loro-navy/70 hover:bg-loro-white hover:border-loro-sand'
                    }`}
                    onClick={() => toggleType(type)}
                  >
                    {type}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Pays */}
            <PropertyCountryFilter
              selectedCountries={selectedCountries}
              onCountriesChange={onCountriesChange}
            />

            {/* Localisation avec recherche intelligente */}
            <div>
              <h4 className="font-futura font-medium text-loro-navy mb-3">Localisation</h4>
              
              {/* Barre de recherche */}
              <div className="mb-3">
                <LocationFilter
                  location=""
                  onLocationChange={handleLocationSelect}
                  country={selectedCountries.length === 1 ? selectedCountries[0] : undefined}
                />
              </div>

              {/* Affichage des localisations sélectionnées */}
              {selectedLocations.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedLocations.map((location) => (
                    <Badge
                      key={location}
                      variant="default"
                      className="bg-loro-sand text-loro-navy hover:bg-loro-sand/90 font-futura cursor-pointer"
                      onClick={() => removeLocation(location)}
                    >
                      {location}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Nombre minimum de chambres */}
            <div>
              <h4 className="font-futura font-medium text-loro-navy mb-3">Nombre minimum de chambres</h4>
              <div className="flex flex-wrap gap-2">
                {[0, 1, 2, 3, 4, 5].map((bedroom) => (
                  <Button
                    key={bedroom}
                    variant={minBedrooms === bedroom ? "default" : "outline"}
                    size="sm"
                    className={`font-futura transition-all duration-200 ${
                      minBedrooms === bedroom
                        ? 'bg-loro-sand text-loro-navy hover:bg-loro-sand/90'
                        : 'border-loro-pearl text-loro-navy/70 hover:bg-loro-white hover:border-loro-sand'
                    }`}
                    onClick={() => onMinBedroomsChange(bedroom)}
                  >
                    {bedroom === 0 ? 'Toutes' : `${bedroom}+`}
                  </Button>
                ))}
              </div>
            </div>

            {/* Gamme de prix */}
            <div>
              <h4 className="font-futura font-medium text-loro-navy mb-3">Gamme de prix</h4>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: '< 500K', max: 500000 },
                  { label: '500K - 1M', min: 500000, max: 1000000 },
                  { label: '1M - 5M', min: 1000000, max: 5000000 },
                  { label: '5M - 10M', min: 5000000, max: 10000000 },
                  { label: '> 10M', min: 10000000 },
                ].map((range) => (
                  <Button
                    key={range.label}
                    variant="outline"
                    size="sm"
                    className="font-futura border-loro-pearl hover:bg-loro-white hover:border-loro-sand"
                    onClick={() => onPriceRangeChange([range.min || 0, range.max || 999999999])}
                  >
                    {range.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PropertyFilters;
