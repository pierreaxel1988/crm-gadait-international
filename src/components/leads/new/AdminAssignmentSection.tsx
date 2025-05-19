
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PipelineType, LeadStatus } from '@/types/lead';
import TeamMemberSelect from '@/components/leads/TeamMemberSelect';

interface AdminAssignmentSectionProps {
  pipelineType: PipelineType;
  leadStatus: LeadStatus;
  assignedAgent: string | undefined;
  availableStatuses: LeadStatus[];
  onPipelineTypeChange: (value: PipelineType) => void;
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
    <div className="bg-white rounded-md shadow-md p-6">
      <h2 className="text-lg font-futura mb-4 text-loro-navy">Options administrateur</h2>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-futura">Type de pipeline</label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={`px-4 py-2 rounded-md font-futura text-sm ${
                pipelineType === 'purchase' 
                  ? 'bg-loro-navy text-white' 
                  : 'bg-white text-loro-navy border border-loro-pearl'
              }`}
              onClick={() => onPipelineTypeChange('purchase')}
            >
              Achat
            </button>
            <button
              type="button"
              className={`px-4 py-2 rounded-md font-futura text-sm ${
                pipelineType === 'rental' 
                  ? 'bg-loro-navy text-white' 
                  : 'bg-white text-loro-navy border border-loro-pearl'
              }`}
              onClick={() => onPipelineTypeChange('rental')}
            >
              Location
            </button>
            <button
              type="button"
              className={`px-4 py-2 rounded-md font-futura text-sm ${
                pipelineType === 'seller' 
                  ? 'bg-loro-navy text-white' 
                  : 'bg-white text-loro-navy border border-loro-pearl'
              }`}
              onClick={() => onPipelineTypeChange('seller')}
            >
              Propriétaires
            </button>
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-futura">Statut du lead</label>
          <Select value={leadStatus} onValueChange={onStatusChange}>
            <SelectTrigger className="w-full font-futura">
              <SelectValue placeholder="Sélectionner un statut" />
            </SelectTrigger>
            <SelectContent>
              {availableStatuses.map(status => (
                <SelectItem key={status} value={status} className="font-futura">
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-futura">Attribuer à un agent</label>
          <TeamMemberSelect
            selectedMemberId={assignedAgent}
            onSelectMember={onAgentChange}
            placeholder="Sélectionner un agent"
          />
        </div>
      </div>
    </div>
  );
};

export default AdminAssignmentSection;
