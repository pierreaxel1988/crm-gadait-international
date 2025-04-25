
import React from 'react';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';

// Specific team members with their correct UUIDs
export const SPECIFIC_AGENTS = [
  { id: "2d8bae00-a935-439d-8685-0adf238a612e", name: "Ophelie Durand" },
  { id: "acab847b-7ace-4681-989d-86f78549aa69", name: "Jade Diouane" },
  { id: "af8e053c-8fae-4424-abaa-d79029fd8a11", name: "Jean Marc Perrissol" },
  { id: "e564a874-2520-4167-bfa8-26d39f119470", name: "Sharon Ramdiane" },
  { id: "e59037a6-218d-4504-a3ad-d2c399784dc7", name: "Jacques Charles" },
  { id: "ccbc635f-0282-427b-b130-82c1f0fbbdf9", name: "Pierre-Axel Gadait" }
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
  // Only add team members that aren't in SPECIFIC_AGENTS
  const combinedAgents = [
    ...SPECIFIC_AGENTS,
    ...teamMembers.filter(
      member => !SPECIFIC_AGENTS.some(agent => agent.id === member.id)
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
