
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { useSelectedAgent } from '@/hooks/useSelectedAgent';

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
  const { selectedAgent, handleAgentChange } = useSelectedAgent();

  // Synchroniser avec le système global d'agent sélectionné
  useEffect(() => {
    if (selectedAgent !== assignedTo) {
      // Déclenchement d'un événement personnalisé pour signaler la source
      window.dispatchEvent(new CustomEvent('agent-selection-changed', {
        detail: { selectedAgent: assignedTo, source: 'filter' }
      }));
    }
  }, [selectedAgent, assignedTo]);

  const handleAgentSelect = (agentId: string | null) => {
    // Mettre à jour à la fois le filtre local et le système global
    onAssignedToChange(agentId);
    
    // Aucun besoin d'appeler handleAgentChange ici, car l'événement custom
    // sera déclenché et capturé par le useEffect ci-dessus
  };

  // Trouver le nom du commercial actuellement sélectionné
  const selectedAgentName = assignedTo 
    ? assignedToOptions.find(member => member.id === assignedTo)?.name || 'Inconnu'
    : null;

  return (
    <div>
      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
        <User className="h-4 w-4" /> Agent assigné
        {selectedAgentName && (
          <span className="ml-1 text-primary font-medium">: {selectedAgentName}</span>
        )}
      </h4>
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant={assignedTo === null ? "default" : "outline"}
          size="sm"
          className="text-xs"
          onClick={() => handleAgentSelect(null)}
        >
          Tous
        </Button>
        {assignedToOptions.map((member) => (
          <Button
            key={member.id}
            variant={assignedTo === member.id ? "default" : "outline"}
            size="sm"
            className="text-xs"
            onClick={() => handleAgentSelect(member.id)}
          >
            {member.name}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default AgentFilter;
