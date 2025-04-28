
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';

export const useSelectedAgent = () => {
  const { isAdmin, teamMemberId } = useAuth();
  
  // Si c'est un commercial, on force l'utilisation de son propre ID
  const [selectedAgent, setSelectedAgent] = useState<string | null>(
    isAdmin ? null : teamMemberId
  );
  
  // Effet pour s'assurer que les commerciaux ne peuvent pas changer leur agent
  useEffect(() => {
    if (!isAdmin && teamMemberId && selectedAgent !== teamMemberId) {
      console.log("Commercial utilisateur: forcer l'agent sélectionné à être lui-même");
      setSelectedAgent(teamMemberId);
    }
  }, [isAdmin, teamMemberId, selectedAgent]);

  const handleAgentChange = useCallback((agentId: string | null) => {
    // Si c'est un commercial, il ne peut pas changer d'agent
    if (!isAdmin && teamMemberId) {
      console.log("Les commerciaux ne peuvent pas changer d'agent");
      return;
    }
    
    setSelectedAgent(agentId);
    
    // Émettre un événement pour la synchronisation globale
    window.dispatchEvent(new CustomEvent('agent-selection-changed', {
      detail: { selectedAgent: agentId }
    }));
  }, [isAdmin, teamMemberId]);

  return {
    selectedAgent,
    handleAgentChange
  };
};
