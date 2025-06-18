
import React from 'react';
import { LeadDetailed } from '@/types/lead';
import { LeadStatus } from '@/components/common/StatusBadge';
import { TaskType } from '@/components/kanban/KanbanCard';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
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
  const ownerStatuses: { value: LeadStatus; label: string }[] = [
    { value: "New", label: "Nouveau contact" },
    { value: "Contacted", label: "Rendez-vous programmé" },
    { value: "Qualified", label: "Visite effectuée" },
    { value: "Proposal", label: "Mandat en négociation" },
    { value: "Visit", label: "Mandat signé" },
    { value: "Offre", label: "Bien en commercialisation" },
    { value: "Deposit", label: "Offre reçue" },
    { value: "Signed", label: "Compromis signé" },
    { value: "Gagné", label: "Vente finalisée" },
    { value: "Perdu", label: "Perdu/Annulé" }
  ];

  const taskTypes: { value: TaskType; label: string }[] = [
    { value: "Call", label: "Call" },
    { value: "Visites", label: "Visites" },
    { value: "Compromis", label: "Compromis" },
    { value: "Acte de vente", label: "Acte de vente" },
    { value: "Contrat de Location", label: "Contrat de Location" },
    { value: "Propositions", label: "Propositions" },
    { value: "Follow up", label: "Follow up" },
    { value: "Estimation", label: "Estimation" },
    { value: "Prospection", label: "Prospection" },
    { value: "Admin", label: "Admin" }
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="status" className="text-sm">Statut du propriétaire</Label>
        <StyledSelect
          id="status"
          value={lead.status || 'New'}
          onChange={e => onDataChange({ status: e.target.value as LeadStatus })}
          options={ownerStatuses}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="assigned_to" className="text-sm">Responsable du suivi</Label>
        <TeamMemberSelect
          value={lead.assignedTo}
          onChange={(value) => onDataChange({ assignedTo: value })}
          label=""
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="task_type" className="text-sm">Type de tâche</Label>
        <StyledSelect
          id="task_type"
          value={lead.taskType || ''}
          onChange={e => onDataChange({ taskType: e.target.value as TaskType })}
          placeholder="Sélectionner un type de tâche"
          options={taskTypes}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="next_follow_up_date" className="text-sm">Prochain suivi</Label>
        <Input 
          id="next_follow_up_date" 
          type="date"
          value={lead.nextFollowUpDate || ''} 
          onChange={e => onDataChange({ nextFollowUpDate: e.target.value })} 
          className="w-full font-futura"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm">Dernière interaction</Label>
        <div className="p-3 bg-gray-50 rounded-md border text-sm text-gray-700">
          {lead.lastContactedAt 
            ? new Date(lead.lastContactedAt).toLocaleDateString('fr-FR', { 
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
          value={lead.relationship_status || 'Nouveau contact'}
          onChange={e => onDataChange({ relationship_status: e.target.value })}
          options={[
            { value: "Nouveau contact", label: "Nouveau contact" },
            { value: "Contact établi", label: "Contact établi" },
            { value: "Relation de confiance", label: "Relation de confiance" },
            { value: "Client fidèle", label: "Client fidèle" },
            { value: "Relation difficile", label: "Relation difficile" }
          ]}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="mandate_type" className="text-sm">Type de mandat</Label>
        <StyledSelect
          id="mandate_type"
          value={lead.mandate_type || ''}
          onChange={e => onDataChange({ mandate_type: e.target.value })}
          placeholder="Sélectionner un type de mandat"
          options={[
            { value: "Simple", label: "Mandat simple" },
            { value: "Semi-exclusif", label: "Mandat semi-exclusif" },
            { value: "Exclusif", label: "Mandat exclusif" }
          ]}
        />
      </div>
    </div>
  );
};

export default OwnerStatusSection;
