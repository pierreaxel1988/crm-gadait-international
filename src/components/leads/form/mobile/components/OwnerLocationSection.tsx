
import React from 'react';
import { LeadDetailed, Country, MauritiusRegion } from '@/types/lead';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ExternalLink, Hash, Globe, MapPin, Map } from 'lucide-react';
import StyledSelect from './StyledSelect';
import MultiSelectButtons from '../../MultiSelectButtons';

interface OwnerLocationSectionProps {
  lead: LeadDetailed;
  onDataChange: (data: Partial<LeadDetailed>) => void;
}

const OwnerLocationSection: React.FC<OwnerLocationSectionProps> = ({
  lead,
  onDataChange
}) => {
  const COUNTRIES: Country[] = [
    "France", "Monaco", "Switzerland", "Italy", "Spain", "Portugal", 
    "United Kingdom", "Germany", "Belgium", "Mauritius", "Dubai", "USA"
  ];

  const MAURITIUS_REGIONS: MauritiusRegion[] = ['North', 'South', 'West', 'East'];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="property_reference" className="text-sm flex items-center gap-2">
          <Hash className="h-4 w-4 text-muted-foreground" />
          Référence du bien
        </Label>
        <Input 
          id="property_reference" 
          value={lead.propertyReference || ''} 
          onChange={e => onDataChange({ propertyReference: e.target.value })} 
          placeholder="Ex : REF-2024-001" 
          className="w-full font-futura"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="url" className="text-sm flex items-center gap-2">
          <ExternalLink className="h-4 w-4 text-muted-foreground" />
          URL du bien
        </Label>
        <Input 
          id="url" 
          type="url"
          value={lead.url || ''} 
          onChange={e => onDataChange({ url: e.target.value })} 
          placeholder="https://..." 
          className="w-full font-futura"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="google_drive_link" className="text-sm flex items-center gap-2">
          <ExternalLink className="h-4 w-4 text-muted-foreground" />
          Dossier Google Drive
        </Label>
        <Input
          id="google_drive_link"
          value={lead.google_drive_link || ''}
          onChange={e => onDataChange({ google_drive_link: e.target.value })}
          placeholder="Coller le lien Google Drive du dossier complet"
          className="font-futura"
        />
        <p className="text-xs text-muted-foreground">
          Lien vers le dossier Google Drive contenant tous les documents du propriétaire
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="country" className="text-sm flex items-center gap-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          Pays
        </Label>
        <StyledSelect
          id="country"
          value={lead.country || ''}
          onChange={e => onDataChange({ country: e.target.value as Country })}
          placeholder="Sélectionner un pays"
          options={COUNTRIES.map(country => ({ value: country, label: country }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location" className="text-sm flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          Localisation
        </Label>
        <Input 
          id="location" 
          value={lead.location || ''} 
          onChange={e => onDataChange({ location: e.target.value })} 
          placeholder="Ville, région..." 
          className="w-full font-futura"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm flex items-center gap-2">
          <Map className="h-4 w-4 text-muted-foreground" />
          Régions (Île Maurice)
        </Label>
        <MultiSelectButtons
          options={MAURITIUS_REGIONS}
          selectedValues={lead.regions || []}
          onToggle={(region) => {
            const currentRegions = lead.regions || [];
            const updatedRegions = currentRegions.includes(region as MauritiusRegion)
              ? currentRegions.filter(r => r !== region)
              : [...currentRegions, region as MauritiusRegion];
            onDataChange({ regions: updatedRegions });
          }}
        />
      </div>
    </div>
  );
};

export default OwnerLocationSection;
