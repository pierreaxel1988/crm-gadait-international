
import React from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from '@/components/ui/select';
import { User } from 'lucide-react';
import FilterGroup from './FilterGroup';
import { SPECIFIC_AGENTS } from '@/components/actions/filters/AgentFilterButtons';

interface AgentFilterSelectProps {
  assignedTo: string | null;
  onAssignedToChange: (agentId: string | null) => void;
  assignedToOptions: {
    id: string;
    name: string;
  }[];
  className?: string;
}

const AgentFilterSelect = ({ 
  assignedTo, 
  onAssignedToChange, 
  assignedToOptions = [], 
  className 
}: AgentFilterSelectProps) => {
  // Only add team members that aren't in SPECIFIC_AGENTS
  const combinedAgents = [
    ...SPECIFIC_AGENTS,
    ...assignedToOptions.filter(
      agent => !SPECIFIC_AGENTS.some(specificAgent => specificAgent.id === agent.id)
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
