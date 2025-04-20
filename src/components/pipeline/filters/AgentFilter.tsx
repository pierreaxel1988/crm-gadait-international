
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { useSelectedAgent } from '@/hooks/useSelectedAgent';

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

  const handleAgentSelect = (agentId: string | null) => {
    // Mettre à jour le filtre local
    onAssignedToChange(agentId);
    
    // Propager la sélection au système global via un événement custom
    window.dispatchEvent(new CustomEvent('agent-selection-changed', {
      detail: { selectedAgent: agentId, source: 'filter' }
    }));
  };

  // Trouver le nom du commercial actuellement sélectionné
  const selectedAgentName = assignedTo 
    ? assignedToOptions.find(member => member.id === assignedTo)?.name || 'Inconnu'
    : null;

  return (
    <div>
      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
        <User className="h-4 w-4" /> Agent assigné
        {selectedAgentName && (
          <span className="ml-1 text-primary font-medium">: {selectedAgentName}</span>
        )}
      </h4>
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant={assignedTo === null ? "default" : "outline"}
          size="sm"
          className="text-xs"
          onClick={() => handleAgentSelect(null)}
        >
          Tous
        </Button>
        {assignedToOptions.map((member) => (
          <Button
            key={member.id}
            variant={assignedTo === member.id ? "default" : "outline"}
            size="sm"
            className="text-xs"
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
