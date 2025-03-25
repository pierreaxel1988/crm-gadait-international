
import React, { useState, useEffect } from 'react';
import { LeadStatus } from '@/components/common/StatusBadge';
import TeamMemberSelect from '@/components/leads/TeamMemberSelect';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

interface AdminAssignmentSectionProps {
  pipelineType: 'purchase' | 'rental';
  leadStatus: LeadStatus;
  assignedAgent: string | undefined;
  availableStatuses: LeadStatus[];
  onPipelineTypeChange: (value: 'purchase' | 'rental') => void;
  onStatusChange: (value: LeadStatus) => void;
  onAgentChange: (value: string | undefined) => void;
}

interface TeamMember {
  id: string;
  name: string;
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
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [agentName, setAgentName] = useState<string>('');

  // Fetch team members for display name
  useEffect(() => {
    if (assignedAgent) {
      const fetchAgentName = async () => {
        try {
          const { data } = await supabase
            .from('team_members')
            .select('name')
            .eq('id', assignedAgent)
            .single();
            
          if (data) {
            setAgentName(data.name);
          }
        } catch (error) {
          console.error('Error fetching agent name:', error);
        }
      };
      
      fetchAgentName();
    }
  }, [assignedAgent]);

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
                  {status === 'New' ? 'Nouveaux' : 
                   status === 'Contacted' ? 'Contactés' :
                   status === 'Qualified' ? 'Qualifiés' :
                   status === 'Proposal' ? 'Propositions' :
                   status === 'Visit' ? 'Visites en cours' :
                   status === 'Offer' ? 'Offre en cours' :
                   status === 'Offre' ? 'Offre en cours' :
                   status === 'Deposit' ? 'Dépôt reçu' :
                   status === 'Signed' ? 'Signature finale' :
                   status === 'Gagné' ? 'Conclus' :
                   status === 'Perdu' ? 'Perdu' : 
                   status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <TeamMemberSelect
          value={assignedAgent}
          onChange={onAgentChange}
          label="Attribuer ce lead à"
          autoSelectPierreAxel={false}
        />
        
        {assignedAgent && agentName && (
          <div className="text-sm text-green-600 font-medium">
            Lead sera attribué à: {agentName}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAssignmentSection;
