
import { useState, useEffect, useCallback } from 'react';

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
      detail: { selectedAgent, source: 'hook' }
    }));
  }, [selectedAgent]);

  // Écouter les changements d'autres composants
  useEffect(() => {
    const handleAgentChange = (e: CustomEvent) => {
      // Éviter les boucles infinies en ignorant les événements générés par ce même hook
      if (e.detail.source === 'hook') return;
      
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

  const handleAgentChange = useCallback((agentId: string | null) => {
    if (agentId !== selectedAgent) {
      setSelectedAgent(agentId);
    }
  }, [selectedAgent]);

  // Fonction pour effacer l'agent sélectionné
  const clearSelectedAgent = useCallback(() => {
    setSelectedAgent(null);
  }, []);

  return { selectedAgent, handleAgentChange, clearSelectedAgent };
};
