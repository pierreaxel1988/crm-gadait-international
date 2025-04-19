
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
  
  // Sync the local filter state with the global selected agent
  useEffect(() => {
    if (selectedAgent !== assignedTo) {
      onAssignedToChange(selectedAgent);
    }
  }, [selectedAgent, assignedTo, onAssignedToChange]);
  
  // Handle local changes and propagate them to the global state
  const handleLocalChange = (agentId: string | null) => {
    onAssignedToChange(agentId);
    handleAgentChange(agentId);
  };

  return (
    <div>
      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
        <User className="h-4 w-4" /> Agent assigné
      </h4>
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant={assignedTo === null ? "default" : "outline"}
          size="sm"
          className="text-xs"
          onClick={() => handleLocalChange(null)}
        >
          Tous
        </Button>
        {assignedToOptions.map((member) => (
          <Button
            key={member.id}
            variant={assignedTo === member.id ? "default" : "outline"}
            size="sm"
            className="text-xs"
            onClick={() => handleLocalChange(member.id)}
          >
            {member.name}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default AgentFilter;
