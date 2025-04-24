
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

// IDs importants à ne jamais oublier
const JACQUES_ID = "e59037a6-218d-4504-a3ad-d2c399784dc7";
const PIERRE_AXEL_ID = "ccbc635f-0282-427b-b130-82c1f0fbdbf9";
const JADE_ID = "acab847b-7ace-4681-989d-86f78549aa69"; // Ajout de l'ID correct de Jade

// Liste des membres garantis
const GUARANTEED_MEMBERS: Record<string, {name: string}> = {
  [JACQUES_ID]: { name: 'Jacques Charles' },
  [PIERRE_AXEL_ID]: { name: 'Pierre-Axel Gadait' },
  [JADE_ID]: { name: 'Jade Diouane' }, // Utilisation de l'ID correct
  "chloe-valentin": { name: 'Chloe Valentin' },
  "christelle-gadait": { name: 'Christelle Gadait' },
  "christine-francoise": { name: 'Christine Francoise' },
  "jean-marc-perrissol": { name: 'Jean Marc Perrissol' },
  "sharon-ramdiane": { name: 'Sharon Ramdiane' },
  "ophelie-durand": { name: 'Ophelie Durand' }
};

const AgentFilter = ({ assignedTo, onAssignedToChange, assignedToOptions }: AgentFilterProps) => {
  const { selectedAgent, handleAgentChange } = useSelectedAgent();

  // Synchroniser avec le système global d'agent sélectionné
  useEffect(() => {
    if (selectedAgent !== assignedTo) {
      onAssignedToChange(selectedAgent);
    }
  }, [selectedAgent, assignedTo, onAssignedToChange]);

  // Synchroniser le système global avec le filtre local
  useEffect(() => {
    if (assignedTo !== selectedAgent) {
      handleAgentChange(assignedTo);
    }
  }, [assignedTo, selectedAgent, handleAgentChange]);

  const handleAgentSelect = (agentId: string | null) => {
    // Mettre à jour à la fois le filtre local et le système global
    onAssignedToChange(agentId);
    handleAgentChange(agentId);
    
    console.log(`Agent sélectionné: ${agentId}`);
    
    // Déclencher un événement de changement d'agent pour la synchronisation globale
    window.dispatchEvent(new CustomEvent('agent-selection-changed', {
      detail: { selectedAgent: agentId }
    }));
  };

  // S'assurer que tous les membres garantis sont présents dans les options
  const allMembers = [...assignedToOptions];
  Object.entries(GUARANTEED_MEMBERS).forEach(([id, member]) => {
    const memberExists = allMembers.some(m => m.id === id);
    if (!memberExists) {
      allMembers.push({
        id: id,
        name: member.name
      });
    }
  });

  // Trier les membres par ordre alphabétique
  allMembers.sort((a, b) => a.name.localeCompare(b.name));

  // Trouver le nom du commercial actuellement sélectionné
  const selectedAgentName = assignedTo 
    ? allMembers.find(member => member.id === assignedTo)?.name || 'Inconnu'
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
        {allMembers.map((member) => (
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
