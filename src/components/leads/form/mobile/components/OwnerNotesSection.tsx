
import React, { useState, useEffect } from 'react';
import { LeadDetailed, Owner } from '@/types/lead';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface OwnerNotesSectionProps {
  lead: LeadDetailed;
  onDataChange: (data: Partial<LeadDetailed>) => void;
}

const OwnerNotesSection: React.FC<OwnerNotesSectionProps> = ({
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
          description: "Impossible de mettre à jour les notes."
        });
        return;
      }

      setOwnerData(prev => prev ? { ...prev, ...updates } : null);
      toast({
        title: "Succès",
        description: "Notes mises à jour."
      });
    } catch (error) {
      console.error('Error in updateOwnerData:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="notes" className="text-sm">Notes générales</Label>
        <Textarea
          id="notes"
          value={ownerData?.notes || ''}
          onChange={(e) => updateOwnerData({ notes: e.target.value })}
          placeholder="Ajouter des notes concernant ce propriétaire..."
          className="min-h-[200px] font-futura"
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="internal_notes" className="text-sm">Notes internes</Label>
        <Textarea
          id="internal_notes"
          value={ownerData?.internal_notes || ''}
          onChange={(e) => updateOwnerData({ internal_notes: e.target.value })}
          placeholder="Notes internes (non visibles par le client)..."
          className="min-h-[150px] font-futura"
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="specific_needs" className="text-sm">Besoins spécifiques</Label>
        <Textarea
          id="specific_needs"
          value={ownerData?.specific_needs || ''}
          onChange={(e) => updateOwnerData({ specific_needs: e.target.value })}
          placeholder="Détaillez les besoins spécifiques du propriétaire..."
          className="min-h-[100px] font-futura"
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="attention_points" className="text-sm">Points d'attention</Label>
        <Textarea
          id="attention_points"
          value={ownerData?.attention_points || ''}
          onChange={(e) => updateOwnerData({ attention_points: e.target.value })}
          placeholder="Points importants à retenir..."
          className="min-h-[100px] font-futura"
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="relationship_details" className="text-sm">Détails de la relation</Label>
        <Textarea
          id="relationship_details"
          value={ownerData?.relationship_details || ''}
          onChange={(e) => updateOwnerData({ relationship_details: e.target.value })}
          placeholder="Historique et détails de la relation client..."
          className="min-h-[100px] font-futura"
          disabled={loading}
        />
      </div>
    </div>
  );
};

export default OwnerNotesSection;
