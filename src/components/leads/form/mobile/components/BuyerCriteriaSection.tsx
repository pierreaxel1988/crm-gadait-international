
import React from 'react';
import { LeadDetailed, ViewType, Amenity } from '@/types/lead';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Eye, Star, MapPin, TreePine, Home } from 'lucide-react';
import MultiSelectButtons from '../../MultiSelectButtons';

interface BuyerCriteriaSectionProps {
  lead: LeadDetailed;
  onDataChange: (data: Partial<LeadDetailed>) => void;
}

const BuyerCriteriaSection: React.FC<BuyerCriteriaSectionProps> = ({
  lead,
  onDataChange
}) => {
  const viewTypes: ViewType[] = ['Mer', 'Montagne', 'Golf', 'Autres'];
  const amenities: Amenity[] = [
    'Piscine', 'Terrasse', 'Balcon', 'Jardin', 'Parking',
    'Ascenseur', 'Sécurité', 'Climatisation', 'Garage'
  ];

  const handleViewToggle = (view: ViewType) => {
    const currentViews = lead.views || [];
    const newViews = currentViews.includes(view)
      ? currentViews.filter(v => v !== view)
      : [...currentViews, view];
    onDataChange({ views: newViews });
  };

  const handleAmenityToggle = (amenity: Amenity) => {
    const currentAmenities = lead.amenities || [];
    const newAmenities = currentAmenities.includes(amenity)
      ? currentAmenities.filter(a => a !== amenity)
      : [...currentAmenities, amenity];
    onDataChange({ amenities: newAmenities });
  };

  return (
    <div className="space-y-6">
      {/* Localisation souhaitée */}
      <div className="space-y-2">
        <Label className="text-sm flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Localisation souhaitée
        </Label>
        <Input
          value={lead.desiredLocation || ''}
          onChange={(e) => onDataChange({ desiredLocation: e.target.value })}
          placeholder="Ex: Côte d'Azur, Paris..."
          className="w-full font-futura"
        />
      </div>

      {/* Surface habitable */}
      <div className="space-y-2">
        <Label className="text-sm flex items-center gap-2">
          <Home className="h-4 w-4" />
          Surface habitable (m²)
        </Label>
        <Input
          value={lead.livingArea || ''}
          onChange={(e) => onDataChange({ livingArea: e.target.value })}
          placeholder="Ex: 120"
          className="w-full font-futura"
        />
      </div>

      {/* Terrain */}
      <div className="space-y-2">
        <Label className="text-sm flex items-center gap-2">
          <TreePine className="h-4 w-4" />
          Terrain (m²)
        </Label>
        <Input
          value={lead.landArea || ''}
          onChange={(e) => onDataChange({ landArea: e.target.value })}
          placeholder="Ex: 500"
          className="w-full font-futura"
        />
      </div>

      {/* Vue souhaitée */}
      <div className="space-y-3">
        <Label className="text-sm flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Vue souhaitée
        </Label>
        <MultiSelectButtons
          options={viewTypes}
          selectedValues={lead.views || []}
          onToggle={handleViewToggle}
        />
      </div>

      {/* Commodités souhaitées */}
      <div className="space-y-3">
        <Label className="text-sm flex items-center gap-2">
          <Star className="h-4 w-4" />
          Commodités souhaitées
        </Label>
        <MultiSelectButtons
          options={amenities}
          selectedValues={lead.amenities || []}
          onToggle={handleAmenityToggle}
        />
      </div>
    </div>
  );
};

export default BuyerCriteriaSection;
