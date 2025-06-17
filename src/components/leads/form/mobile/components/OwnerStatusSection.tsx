
import React, { useState, useEffect } from 'react';
import { LeadDetailed, Owner } from '@/types/lead';
import { TaskType } from '@/components/kanban/KanbanCard';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import StyledSelect from './StyledSelect';
import TeamMemberSelect from '@/components/leads/TeamMemberSelect';

interface OwnerStatusSectionProps {
  lead: LeadDetailed;
  onDataChange: (data: Partial<LeadDetailed>) => void;
}

const OwnerStatusSection: React.FC<OwnerStatusSectionProps> = ({
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
          description: "Impossible de mettre à jour le statut."
        });
        return;
      }

      setOwnerData(prev => prev ? { ...prev, ...updates } : null);
      toast({
        title: "Succès",
        description: "Statut mis à jour."
      });
    } catch (error) {
      console.error('Error in updateOwnerData:', error);
    }
  };

  const ownerStatuses = [
    { value: "Nouveau contact", label: "Nouveau contact" },
    { value: "Rendez-vous programmé", label: "Rendez-vous programmé" },
    { value: "Visite effectuée", label: "Visite effectuée" },
    { value: "Mandat en négociation", label: "Mandat en négociation" },
    { value: "Mandat signé", label: "Mandat signé" },
    { value: "Bien en commercialisation", label: "Bien en commercialisation" },
    { value: "Offre reçue", label: "Offre reçue" },
    { value: "Compromis signé", label: "Compromis signé" },
    { value: "Vente finalisée", label: "Vente finalisée" },
    { value: "Perdu/Annulé", label: "Perdu/Annulé" }
  ];

  const taskTypes: TaskType[] = [
    "Call", "Email", "Meeting", "Visit", "Follow-up", "Document", "Other"
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="status" className="text-sm">Statut du propriétaire</Label>
        <StyledSelect
          id="status"
          value={ownerData?.status || 'Nouveau contact'}
          onChange={e => updateOwnerData({ status: e.target.value })}
          options={ownerStatuses}
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="assigned_to" className="text-sm">Responsable du suivi</Label>
        <TeamMemberSelect
          value={ownerData?.assigned_to}
          onChange={(value) => updateOwnerData({ assigned_to: value })}
          label=""
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="task_type" className="text-sm">Type de tâche</Label>
        <StyledSelect
          id="task_type"
          value={ownerData?.task_type || ''}
          onChange={e => updateOwnerData({ task_type: e.target.value as TaskType })}
          placeholder="Sélectionner un type de tâche"
          options={taskTypes.map(type => ({ value: type, label: type }))}
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="next_follow_up_date" className="text-sm">Prochain suivi</Label>
        <Input 
          id="next_follow_up_date" 
          type="date"
          value={ownerData?.next_follow_up_date || ''} 
          onChange={e => updateOwnerData({ next_follow_up_date: e.target.value })} 
          className="w-full font-futura"
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm">Dernière interaction</Label>
        <div className="p-3 bg-gray-50 rounded-md border text-sm text-gray-700">
          {ownerData?.last_contacted_at 
            ? new Date(ownerData.last_contacted_at).toLocaleDateString('fr-FR', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
              })
            : 'Aucune interaction enregistrée'}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="relationship_status" className="text-sm">Statut de la relation</Label>
        <StyledSelect
          id="relationship_status"
          value={ownerData?.relationship_status || 'Nouveau contact'}
          onChange={e => updateOwnerData({ relationship_status: e.target.value })}
          options={[
            { value: "Nouveau contact", label: "Nouveau contact" },
            { value: "Contact établi", label: "Contact établi" },
            { value: "Relation de confiance", label: "Relation de confiance" },
            { value: "Client fidèle", label: "Client fidèle" },
            { value: "Relation difficile", label: "Relation difficile" }
          ]}
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="mandate_type" className="text-sm">Type de mandat</Label>
        <StyledSelect
          id="mandate_type"
          value={ownerData?.mandate_type || ''}
          onChange={e => updateOwnerData({ mandate_type: e.target.value })}
          placeholder="Sélectionner un type de mandat"
          options={[
            { value: "Simple", label: "Mandat simple" },
            { value: "Semi-exclusif", label: "Mandat semi-exclusif" },
            { value: "Exclusif", label: "Mandat exclusif" }
          ]}
          disabled={loading}
        />
      </div>
    </div>
  );
};

export default OwnerStatusSection;
