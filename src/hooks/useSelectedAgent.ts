
import { useState, useEffect } from 'react';

export const useSelectedAgent = () => {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(() => {
    // Récupérer la valeur depuis le localStorage au démarrage
    const saved = localStorage.getItem('selectedAgent');
    return saved ? saved : null;
  });

  // Sauvegarder dans localStorage à chaque changement
  useEffect(() => {
    if (selectedAgent) {
      localStorage.setItem('selectedAgent', selectedAgent);
    } else {
      localStorage.removeItem('selectedAgent');
    }
    
    // Émettre un événement personnalisé pour la synchronisation
    window.dispatchEvent(new CustomEvent('agent-selection-changed', {
      detail: { selectedAgent }
    }));
  }, [selectedAgent]);

  // Écouter les changements d'autres composants
  useEffect(() => {
    const handleAgentChange = (e: CustomEvent) => {
      const newAgent = e.detail.selectedAgent;
      if (newAgent !== selectedAgent) {
        setSelectedAgent(newAgent);
      }
    };

    window.addEventListener('agent-selection-changed', handleAgentChange as EventListener);
    return () => {
      window.removeEventListener('agent-selection-changed', handleAgentChange as EventListener);
    };
  }, [selectedAgent]);

  const handleAgentChange = (agentId: string | null) => {
    setSelectedAgent(agentId);
  };

  return { selectedAgent, handleAgentChange };
};
