
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

const AgentFilterSelect = ({ 
  assignedTo, 
  onAssignedToChange, 
  assignedToOptions,
  className
}: AgentFilterSelectProps) => {
  return (
    <FilterGroup className={className}>
      <div className="flex items-center gap-2 text-sm">
        <User className="h-4 w-4" />
        <span className="font-medium">Agent assigné</span>
      </div>
      <Select
        value={assignedTo || ""}
        onValueChange={(value) => onAssignedToChange(value || null)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Tous les agents" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="">Tous les agents</SelectItem>
            {assignedToOptions.map((agent) => (
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
