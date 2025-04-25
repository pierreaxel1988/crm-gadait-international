
import React from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from '@/components/ui/select';
import { User } from 'lucide-react';
import FilterGroup from './FilterGroup';
import { SPECIFIC_AGENTS } from '@/components/actions/filters/AgentFilterButtons';

interface AgentFilterSelectProps {
  assignedTo: string | null;
  onAssignedToChange: (agentId: string | null) => void;
  className?: string;
  assignedToOptions?: { id: string; name: string }[];
}

const AgentFilterSelect = ({ 
  assignedTo, 
  onAssignedToChange, 
  className 
}: AgentFilterSelectProps) => {
  return (
    <FilterGroup className={className}>
      <div className="flex items-center gap-2 text-sm">
        <User className="h-4 w-4" />
        <span className="font-medium">Responsable du suivi</span>
      </div>
      <Select
        value={assignedTo || "all"}
        onValueChange={(value) => {
          console.log("Agent sélectionné:", value);
          onAssignedToChange(value === "all" ? null : value);
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Tous les agents" />
        </SelectTrigger>
        <SelectContent searchable>
          <SelectGroup>
            <SelectItem value="all">Tous les agents</SelectItem>
            {SPECIFIC_AGENTS.map((agent) => (
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
