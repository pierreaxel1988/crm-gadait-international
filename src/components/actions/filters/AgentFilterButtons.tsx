
import React from 'react';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';

// Same specific agents as the other components
const SPECIFIC_AGENTS = [
  { id: "jade-diouane", name: "Jade Diouane" },
  { id: "jean-marc-perrissol", name: "Jean Marc Perrissol" },
  { id: "jacques-charles", name: "Jacques Charles" },
  { id: "ophelie-durand", name: "Ophelie Durand" },
  { id: "pierre-axel-gadait", name: "Pierre-Axel Gadait" },
  { id: "sharon-ramdiane", name: "Sharon Ramdiane" }
];

interface AgentFilterButtonsProps {
  agentFilter: string | null;
  setAgentFilter: (agentId: string | null) => void;
  teamMembers: { id: string; name: string }[];
}

const AgentFilterButtons: React.FC<AgentFilterButtonsProps> = ({ 
  agentFilter, 
  setAgentFilter, 
  teamMembers 
}) => {
  // Combine and deduplicate agents
  const combinedAgents = [
    ...SPECIFIC_AGENTS,
    ...teamMembers.filter(
      member => !SPECIFIC_AGENTS.some(specificAgent => specificAgent.id === member.id)
    )
  ];

  return (
    <div>
      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
        <User className="h-4 w-4" /> Agent
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Button
          variant={agentFilter === null ? "default" : "outline"}
          size="sm"
          className="text-xs"
          onClick={() => setAgentFilter(null)}
        >
          Tous
        </Button>
        {combinedAgents.map(member => (
          <Button
            key={member.id}
            variant={agentFilter === member.id ? "default" : "outline"}
            size="sm"
            className="text-xs whitespace-normal h-auto py-1.5"
            onClick={() => setAgentFilter(member.id)}
          >
            {member.name}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default AgentFilterButtons;
