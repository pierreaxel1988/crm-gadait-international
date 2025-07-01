import React from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TeamMemberSelect from '@/components/leads/TeamMemberSelect';
import { LeadStatus, PipelineType } from '@/types/lead';
import { getStatusesForPipeline } from '@/utils/pipelineUtils';

interface AdminAssignmentSectionProps {
  pipelineType: PipelineType;
  leadStatus: LeadStatus;
  assignedAgent?: string;
  availableStatuses: LeadStatus[];
  onPipelineTypeChange: (type: PipelineType) => void;
  onStatusChange: (status: LeadStatus) => void;
  onAgentChange: (agentId: string | undefined) => void;
}

const AdminAssignmentSection: React.FC<AdminAssignmentSectionProps> = ({
  pipelineType,
  leadStatus,
  assignedAgent,
  onPipelineTypeChange,
  onStatusChange,
  onAgentChange
}) => {
  // Get the correct statuses based on the current pipeline type
  const availableStatuses = getStatusesForPipeline(pipelineType);

  // Status label mapping based on pipeline type
  const statusLabels: Record<LeadStatus, string> = {
    'New': 'Nouveau',
    'Contacted': 'Contacté',
    'Qualified': 'Qualifié',
    'Proposal': 'Proposition',
    'Visit': 'Visite',
    'Offre': 'Offre',
    'Deposit': 'Dépôt',
    'Signed': 'Signé',
    'Gagné': 'Gagné',
    'Perdu': 'Perdu',
    'Deleted': 'Supprimé'
  };

  const getStatusLabel = (status: LeadStatus): string => {
    if (pipelineType === 'owners') {
      return statusLabels[status] || status;
    }
    return status;
  };

  return (
    <div className="space-y-4 bg-white border rounded-lg p-4">
      <div className="space-y-2">
        <Label>Type de pipeline</Label>
        <RadioGroup 
          value={pipelineType} 
          onValueChange={(value: PipelineType) => onPipelineTypeChange(value)}
          className="flex space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="purchase" id="purchase" />
            <Label htmlFor="purchase" className="cursor-pointer">Achat</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="rental" id="rental" />
            <Label htmlFor="rental" className="cursor-pointer">Location</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="owners" id="owners" />
            <Label htmlFor="owners" className="cursor-pointer">Propriétaires</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label>Statut du lead</Label>
        <Select 
          value={leadStatus} 
          onValueChange={(value: LeadStatus) => onStatusChange(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un statut" />
          </SelectTrigger>
          <SelectContent>
            {availableStatuses.map(status => (
              <SelectItem key={status} value={status}>
                {getStatusLabel(status)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Attribuer à un agent</Label>
        <TeamMemberSelect
          value={assignedAgent}
          onChange={onAgentChange}
        />
      </div>
    </div>
  );
};

export default AdminAssignmentSection;
