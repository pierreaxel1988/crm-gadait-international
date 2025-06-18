
import React from 'react';
import { LeadDetailed } from '@/types/lead';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Home, Bed, Bath, Square, Calendar, FileText } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import StyledSelect from './StyledSelect';

interface OwnerPropertySectionProps {
  lead: LeadDetailed;
  onDataChange: (data: Partial<LeadDetailed>) => void;
}

const OwnerPropertySection: React.FC<OwnerPropertySectionProps> = ({
  lead,
  onDataChange
}) => {
  const PROPERTY_TYPES = [
    'Appartement', 'Villa', 'Maison', 'Studio', 'Penthouse', 'Duplex', 
    'Triplex', 'Loft', 'Terrain', 'Commercial', 'Bureau', 'Entrepôt'
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="property_type" className="text-sm flex items-center gap-2">
          <Home className="h-4 w-4 text-muted-foreground" />
          Type de bien
        </Label>
        <StyledSelect
          id="property_type"
          value={lead.propertyType || ''}
          onChange={e => onDataChange({ propertyType: e.target.value })}
          placeholder="Sélectionner un type"
          options={PROPERTY_TYPES.map(type => ({ value: type, label: type }))}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="bedrooms" className="text-sm flex items-center gap-2">
            <Bed className="h-4 w-4 text-muted-foreground" />
            Chambres
          </Label>
          <Input 
            id="bedrooms" 
            type="number"
            value={lead.bedrooms || ''} 
            onChange={e => onDataChange({ bedrooms: parseInt(e.target.value) || 0 })} 
            placeholder="Ex: 3" 
            className="w-full font-futura"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bathrooms" className="text-sm flex items-center gap-2">
            <Bath className="h-4 w-4 text-muted-foreground" />
            Salles de bain
          </Label>
          <Input 
            id="bathrooms" 
            type="number"
            value={lead.bathrooms || ''} 
            onChange={e => onDataChange({ bathrooms: parseInt(e.target.value) || 0 })} 
            placeholder="Ex: 2" 
            className="w-full font-futura"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="surface_area" className="text-sm flex items-center gap-2">
          <Square className="h-4 w-4 text-muted-foreground" />
          Surface (m²)
        </Label>
        <Input 
          id="surface_area" 
          type="number"
          value={lead.surfaceArea || ''} 
          onChange={e => onDataChange({ surfaceArea: parseInt(e.target.value) || 0 })} 
          placeholder="Ex: 120" 
          className="w-full font-futura"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="construction_year" className="text-sm flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          Année de construction
        </Label>
        <Input 
          id="construction_year" 
          value={lead.construction_year || ''} 
          onChange={e => onDataChange({ construction_year: e.target.value })} 
          placeholder="Ex: 2020" 
          className="w-full font-futura"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="property_description" className="text-sm flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          Description du bien
        </Label>
        <Textarea 
          id="property_description" 
          value={lead.property_description || ''} 
          onChange={e => onDataChange({ property_description: e.target.value })} 
          placeholder="Description détaillée du bien..." 
          rows={3}
          className="w-full font-futura resize-none"
        />
      </div>
    </div>
  );
};

export default OwnerPropertySection;
