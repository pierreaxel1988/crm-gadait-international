
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
  // Chercher Pierre Axel Gadait quand le composant est monté
  // Mais seulement si aucun agent n'est déjà sélectionné
  useEffect(() => {
    const findPierreAxel = async () => {
      if (assignedTo === null && assignedToOptions.length > 0) {
        const pierreAxel = assignedToOptions.find(member => 
          member.name.toLowerCase().includes('pierre axel gadait'));
        
        if (pierreAxel) {
          onAssignedToChange(pierreAxel.id);
        }
      }
    };
    
    findPierreAxel();
  }, [assignedToOptions, assignedTo, onAssignedToChange]);

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
        {assignedToOptions.map((member) => (
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
