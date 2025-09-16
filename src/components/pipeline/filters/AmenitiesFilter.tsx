import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Home, Search } from 'lucide-react';

interface AmenitiesFilterProps {
  selectedAmenities: string[];
  onAmenitiesChange: (amenities: string[]) => void;
}

const commonAmenities = [
  'Piscine',
  'Ascenseur',
  'Garage & Parking',
  'Climatisation',
  'Salle de réception',
  'Dépendances',
  'Loge gardien',
  'Spa',
  'Terrasse',
  'Jardin',
  'Meublé',
  'Cheminée',
  'Maison d\'amis',
  'Bâtiments agricoles',
  'Chambre de bonne',
  'Accessible aux handicapés',
  'Vue mer',
  'Vue panoramique',
  'Bord de mer',
  'Front de mer',
  'Court de tennis',
  'Proche golf',
  'Proche aéroport'
];

const AmenitiesFilter: React.FC<AmenitiesFilterProps> = ({
  selectedAmenities,
  onAmenitiesChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAmenities = commonAmenities.filter(amenity =>
    amenity.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      onAmenitiesChange(selectedAmenities.filter(a => a !== amenity));
    } else {
      onAmenitiesChange([...selectedAmenities, amenity]);
    }
  };

  const clearAmenities = () => {
    onAmenitiesChange([]);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-futura font-medium text-loro-navy flex items-center gap-2">
          <Home className="h-4 w-4" />
          Équipements
          {selectedAmenities.length > 0 && (
            <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
              {selectedAmenities.length}
            </span>
          )}
        </h4>
        {selectedAmenities.length > 0 && (
          <button
            onClick={clearAmenities}
            className="text-xs text-loro-navy/60 hover:text-loro-navy font-futura"
          >
            Effacer
          </button>
        )}
      </div>

      {/* Search input */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un équipement..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-8"
        />
      </div>
      
      <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
        {filteredAmenities.map((amenity) => (
          <Badge
            key={amenity}
            variant={selectedAmenities.includes(amenity) ? "default" : "outline"}
            className={`cursor-pointer font-futura transition-all duration-200 text-xs ${
              selectedAmenities.includes(amenity)
                ? 'bg-loro-sand text-loro-navy hover:bg-loro-sand/90'
                : 'border-loro-pearl text-loro-navy/70 hover:bg-loro-white hover:border-loro-sand'
            }`}
            onClick={() => toggleAmenity(amenity)}
          >
            {amenity}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default AmenitiesFilter;