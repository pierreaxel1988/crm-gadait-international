
import React from 'react';
import { LeadDetailed } from '@/types/lead';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';
import LocationFilter from '@/components/pipeline/filters/LocationFilter';
import StyledSelect from './StyledSelect';

interface OwnerLocationSectionProps {
  lead: LeadDetailed;
  onDataChange: (data: Partial<LeadDetailed>) => void;
}

const OwnerLocationSection: React.FC<OwnerLocationSectionProps> = ({
  lead,
  onDataChange
}) => {
  const handleLocationChange = (location: string) => {
    onDataChange({ desiredLocation: location });
  };
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="country" className="text-sm">Pays</Label>
        <StyledSelect
          id="country"
          value={lead.country || ''}
          onChange={e => onDataChange({ country: e.target.value })}
          placeholder="Sélectionner un pays"
          options={[
            { value: "France", label: "France" },
            { value: "Spain", label: "Espagne" },
            { value: "Portugal", label: "Portugal" },
            { value: "Italy", label: "Italie" },
            { value: "Switzerland", label: "Suisse" },
            { value: "Monaco", label: "Monaco" },
            { value: "Mauritius", label: "Île Maurice" },
            { value: "United States", label: "United States" },
            { value: "Etats-Unis", label: "Etats-Unis" },
            { value: "Grèce", label: "Grèce" },
            { value: "UAE", label: "Émirats Arabes Unis" }
          ]}
          icon={<MapPin className="h-4 w-4" />}
        />
      </div>

      <div className="space-y-2">
        <LocationFilter 
          location={lead.desiredLocation || ''} 
          onLocationChange={handleLocationChange}
          country={lead.country}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location" className="text-sm">Adresse</Label>
        <Input 
          id="location" 
          value={lead.location || ''} 
          onChange={e => onDataChange({ location: e.target.value })} 
          placeholder="Ex : 123 Avenue des Champs-Élysées" 
          className="w-full font-futura"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Pin Location
        </Label>
        <Input
          name="mapCoordinates"
          value={lead.mapCoordinates || ''}
          onChange={e => onDataChange({ mapCoordinates: e.target.value })}
          placeholder="Collez le lien Google Maps ici"
          className="w-full font-futura"
        />
        <p className="text-xs text-muted-foreground">
          Copiez-collez le lien Google Maps de la propriété
        </p>
      </div>
    </div>
  );
};

export default OwnerLocationSection;
