
import React from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectLabel, SelectItem } from '@/components/ui/select';
import { User } from 'lucide-react';

interface AgentFilterProps {
  assignedTo: string | null;
  onAssignedToChange: (agentId: string | null) => void;
  assignedToOptions: {
    id: string;
    name: string;
  }[];
}

const AgentFilter = ({
  assignedTo,
  onAssignedToChange,
  assignedToOptions
}: AgentFilterProps) => {
  return (
    <div className="space-y-2">
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
            {assignedToOptions.map((agent) => (
              <SelectItem key={agent.id} value={agent.id}>
                {agent.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default AgentFilter;
