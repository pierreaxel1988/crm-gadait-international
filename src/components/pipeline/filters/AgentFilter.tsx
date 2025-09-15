import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { useSelectedAgent } from '@/hooks/useSelectedAgent';
import { GUARANTEED_TEAM_MEMBERS } from '@/services/teamMemberService';

interface TeamMember {
  id: string;
  name: string;
}

interface AgentFilterProps {
  assignedTo: string | null;
  onAssignedToChange: (assignedTo: string | null) => void;
  assignedToOptions: TeamMember[];
}

const AgentFilter = ({ assignedTo, onAssignedToChange, assignedToOptions }: AgentFilterProps) => {
  const { selectedAgent, handleAgentChange } = useSelectedAgent();

  // Synchroniser avec le système global d'agent sélectionné
  useEffect(() => {
    if (selectedAgent !== assignedTo) {
      onAssignedToChange(selectedAgent);
    }
  }, [selectedAgent, assignedTo, onAssignedToChange]);

  // Synchroniser le système global avec le filtre local
  useEffect(() => {
    if (assignedTo !== selectedAgent) {
      handleAgentChange(assignedTo);
    }
  }, [assignedTo, selectedAgent, handleAgentChange]);

  const handleAgentSelect = (agentId: string | null) => {
    // Mettre à jour à la fois le filtre local et le système global
    onAssignedToChange(agentId);
    handleAgentChange(agentId);
    
    console.log(`Agent sélectionné: ${agentId}`);
    
    // Déclencher un événement de changement d'agent pour la synchronisation globale
    window.dispatchEvent(new CustomEvent('agent-selection-changed', {
      detail: { selectedAgent: agentId }
    }));
  };

  // S'assurer que tous les membres garantis sont présents dans les options
  const allMembers = [...GUARANTEED_TEAM_MEMBERS]
    .sort((a, b) => a.name.localeCompare(b.name));

  // Trouver le nom du commercial actuellement sélectionné
  const selectedAgentName = assignedTo 
    ? allMembers.find(member => member.id === assignedTo)?.name || 'Inconnu'
    : null;

  return (
    <div>
      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
        <User className="h-4 w-4" /> Agent assigné
        {selectedAgentName && (
          <span className="ml-1 text-primary font-medium">: {selectedAgentName}</span>
        )}
      </h4>
      <div className="flex flex-wrap gap-1">
        <Button
          variant={assignedTo === null ? "default" : "outline"}
          size="sm"
          className="text-xs px-2 py-1 h-auto"
          onClick={() => handleAgentSelect(null)}
        >
          Tous
        </Button>
        {allMembers.map((member) => (
          <Button
            key={member.id}
            variant={assignedTo === member.id ? "default" : "outline"}
            size="sm"
            className="text-xs px-2 py-1 h-auto"
            onClick={() => handleAgentSelect(member.id)}
          >
            {member.name}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default AgentFilter;
