
import React from 'react';
import { LeadStatus } from '@/components/common/StatusBadge';
import TeamMemberSelect from '@/components/leads/TeamMemberSelect';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AdminAssignmentSectionProps {
  pipelineType: 'purchase' | 'rental';
  leadStatus: LeadStatus;
  assignedAgent: string | undefined;
  availableStatuses: LeadStatus[];
  onPipelineTypeChange: (value: 'purchase' | 'rental') => void;
  onStatusChange: (value: LeadStatus) => void;
  onAgentChange: (value: string | undefined) => void;
}

const AdminAssignmentSection: React.FC<AdminAssignmentSectionProps> = ({
  pipelineType,
  leadStatus,
  assignedAgent,
  availableStatuses,
  onPipelineTypeChange,
  onStatusChange,
  onAgentChange
}) => {
  return (
    <div className="luxury-card p-4 border-loro-sand">
      <h2 className="text-lg font-medium mb-4">Attribution du lead</h2>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Type de pipeline</label>
          <Select
            value={pipelineType}
            onValueChange={(value: 'purchase' | 'rental') => onPipelineTypeChange(value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sélectionner un pipeline" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="purchase">Achat</SelectItem>
              <SelectItem value="rental">Location</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm font-medium mb-1 block">Statut initial</label>
          <Select
            value={leadStatus}
            onValueChange={(value: LeadStatus) => onStatusChange(value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sélectionner un statut" />
            </SelectTrigger>
            <SelectContent>
              {availableStatuses.map(status => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <TeamMemberSelect
          value={assignedAgent}
          onChange={onAgentChange}
          label="Attribuer ce lead à"
          autoSelectPierreAxel={true}
        />
      </div>
    </div>
  );
};

export default AdminAssignmentSection;
