
import React, { useState, useEffect } from 'react';
import { LeadDetailed, Owner } from '@/types/lead';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
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
  const [ownerData, setOwnerData] = useState<Owner | null>(null);
  const [loading, setLoading] = useState(false);

  // Récupérer les données du propriétaire associé au lead
  useEffect(() => {
    const fetchOwnerData = async () => {
      if (lead.pipelineType !== 'owners' || !lead.id) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('owners')
          .select('*')
          .eq('id', lead.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching owner data:', error);
          return;
        }

        if (data) {
          // Type cast the data properly to match Owner interface
          setOwnerData(data as Owner);
        }
      } catch (error) {
        console.error('Error in fetchOwnerData:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOwnerData();
  }, [lead.id, lead.pipelineType]);

  // Mettre à jour les données du propriétaire
  const updateOwnerData = async (updates: Partial<Owner>) => {
    if (!lead.id || lead.pipelineType !== 'owners') return;

    try {
      const { error } = await supabase
        .from('owners')
        .update(updates)
        .eq('id', lead.id);

      if (error) {
        console.error('Error updating owner data:', error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de mettre à jour les données de localisation."
        });
        return;
      }

      setOwnerData(prev => prev ? { ...prev, ...updates } : null);
      toast({
        title: "Succès",
        description: "Données de localisation mises à jour."
      });
    } catch (error) {
      console.error('Error in updateOwnerData:', error);
    }
  };

  const handleLocationChange = (location: string) => {
    updateOwnerData({ desired_location: location });
  };
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="country" className="text-sm">Pays</Label>
        <StyledSelect
          id="country"
          value={ownerData?.country || ''}
          onChange={e => updateOwnerData({ country: e.target.value })}
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
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <LocationFilter 
          location={ownerData?.desired_location || ''} 
          onLocationChange={handleLocationChange}
          country={ownerData?.country}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location" className="text-sm">Adresse</Label>
        <Input 
          id="location" 
          value={ownerData?.location || ''} 
          onChange={e => updateOwnerData({ location: e.target.value })} 
          placeholder="Ex : 123 Avenue des Champs-Élysées" 
          className="w-full font-futura"
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Pin Location
        </Label>
        <Input
          name="mapCoordinates"
          value={ownerData?.map_coordinates || ''}
          onChange={e => updateOwnerData({ map_coordinates: e.target.value })}
          placeholder="Collez le lien Google Maps ici"
          className="w-full font-futura"
          disabled={loading}
        />
        <p className="text-xs text-muted-foreground">
          Copiez-collez le lien Google Maps de la propriété
        </p>
      </div>
    </div>
  );
};

export default OwnerLocationSection;
