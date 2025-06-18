
import React from 'react';
import { LeadDetailed } from '@/types/lead';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface OwnerNotesSectionProps {
  lead: LeadDetailed;
  onDataChange: (data: Partial<LeadDetailed>) => void;
}

const OwnerNotesSection: React.FC<OwnerNotesSectionProps> = ({
  lead,
  onDataChange
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="notes" className="text-sm">Notes générales</Label>
        <Textarea
          id="notes"
          value={lead.notes || ''}
          onChange={(e) => onDataChange({ notes: e.target.value })}
          placeholder="Ajouter des notes concernant ce propriétaire..."
          className="min-h-[200px] font-futura"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="internal_notes" className="text-sm">Notes internes</Label>
        <Textarea
          id="internal_notes"
          value={lead.internal_notes || ''}
          onChange={(e) => onDataChange({ internal_notes: e.target.value })}
          placeholder="Notes internes (non visibles par le client)..."
          className="min-h-[150px] font-futura"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="specific_needs" className="text-sm">Besoins spécifiques</Label>
        <Textarea
          id="specific_needs"
          value={lead.specific_needs || ''}
          onChange={(e) => onDataChange({ specific_needs: e.target.value })}
          placeholder="Détaillez les besoins spécifiques du propriétaire..."
          className="min-h-[100px] font-futura"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="attention_points" className="text-sm">Points d'attention</Label>
        <Textarea
          id="attention_points"
          value={lead.attention_points || ''}
          onChange={(e) => onDataChange({ attention_points: e.target.value })}
          placeholder="Points importants à retenir..."
          className="min-h-[100px] font-futura"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="relationship_details" className="text-sm">Détails de la relation</Label>
        <Textarea
          id="relationship_details"
          value={lead.relationship_details || ''}
          onChange={(e) => onDataChange({ relationship_details: e.target.value })}
          placeholder="Historique et détails de la relation client..."
          className="min-h-[100px] font-futura"
        />
      </div>
    </div>
  );
};

export default OwnerNotesSection;
