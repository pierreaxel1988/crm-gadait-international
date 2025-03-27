
import React from 'react';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';

interface AgentFilterProps {
  assignedTo: string | null;
  onAssignedToChange: (assignedTo: string | null) => void;
  agents: { id: string; name: string }[];
}

const AgentFilter = ({ assignedTo, onAssignedToChange, agents }: AgentFilterProps) => {
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
          onClick={() => onAssignedToChange(null)}
        >
          Tous
        </Button>
        {agents.map((member) => (
          <Button
            key={member.id}
            variant={assignedTo === member.id ? "default" : "outline"}
            size="sm"
            className="text-xs"
            onClick={() => onAssignedToChange(member.id)}
          >
            {member.name}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default AgentFilter;
