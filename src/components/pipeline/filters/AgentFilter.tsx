
import React from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from '@/components/ui/select';
import { User } from 'lucide-react';
import { SPECIFIC_AGENTS } from '@/components/actions/filters/AgentFilterButtons';

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
}: AgentFilterProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm">
        <User className="h-4 w-4" />
        <span className="font-medium">Responsable du suivi</span>
      </div>
      <Select
        value={assignedTo || "all"}
        onValueChange={(value) => {
          console.log("Agent filter changed to:", value);
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
    </div>
  );
};

export default AgentFilter;
