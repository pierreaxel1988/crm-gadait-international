
import React from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from '@/components/ui/select';
import { User } from 'lucide-react';
import FilterGroup from './FilterGroup';

interface AgentFilterSelectProps {
  assignedTo: string | null;
  onAssignedToChange: (agentId: string | null) => void;
  assignedToOptions: {
    id: string;
    name: string;
  }[];
  className?: string;
}

const SPECIFIC_AGENTS = [
  { id: "jade-diouane", name: "Jade Diouane" },
  { id: "jean-marc-perrissol", name: "Jean Marc Perrissol" },
  { id: "jacques-charles", name: "Jacques Charles" },
  { id: "sharon-ramdiane", name: "Sharon Ramdiane" },
  { id: "ophelie-durand", name: "Ophelie Durand" },
  { id: "pierre-axel-gadait", name: "Pierre-Axel Gadait" }
];

const AgentFilterSelect = ({ 
  assignedTo, 
  onAssignedToChange, 
  assignedToOptions = [], 
  className 
}: AgentFilterSelectProps) => {
  // Combine and deduplicate agents
  const combinedAgents = [
    ...SPECIFIC_AGENTS,
    ...assignedToOptions.filter(
      agent => !SPECIFIC_AGENTS.some(specificAgent => specificAgent.name === agent.name)
    )
  ];

  return (
    <FilterGroup className={className}>
      <div className="flex items-center gap-2 text-sm">
        <User className="h-4 w-4" />
        <span className="font-medium">Agent assigné</span>
      </div>
      <Select
        value={assignedTo || "all"}
        onValueChange={(value) => onAssignedToChange(value === "all" ? null : value)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Tous les agents" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="all">Tous les agents</SelectItem>
            {combinedAgents.map((agent) => (
              <SelectItem key={agent.id} value={agent.id}>
                {agent.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </FilterGroup>
  );
};

export default AgentFilterSelect;
