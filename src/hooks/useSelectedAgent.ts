
import { useState, useEffect, useCallback } from 'react';

export const useSelectedAgent = () => {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(() => {
    // Récupérer la valeur depuis le localStorage au démarrage
    const saved = localStorage.getItem('selectedAgent');
    return saved ? saved : null;
  });
  
  // Flag pour éviter les boucles infinies lors de la synchronisation
  const [isSyncingEvents, setIsSyncingEvents] = useState(false);

  // Sauvegarder dans localStorage à chaque changement
  useEffect(() => {
    if (selectedAgent) {
      localStorage.setItem('selectedAgent', selectedAgent);
    } else {
      localStorage.removeItem('selectedAgent');
    }
    
    // Émettre un événement personnalisé pour la synchronisation
    // uniquement si on n'est pas déjà en train de traiter un événement
    if (!isSyncingEvents) {
      setIsSyncingEvents(true);
      window.dispatchEvent(new CustomEvent('agent-selection-changed', {
        detail: { selectedAgent, source: 'hook' }
      }));
      setTimeout(() => setIsSyncingEvents(false), 50);
    }
  }, [selectedAgent, isSyncingEvents]);

  // Écouter les changements d'autres composants
  useEffect(() => {
    const handleAgentChange = (e: CustomEvent) => {
      // Éviter les boucles infinies en ignorant les événements générés par ce même hook
      if (e.detail.source === 'hook') return;
      
      const newAgent = e.detail.selectedAgent;
      if (newAgent !== selectedAgent && !isSyncingEvents) {
        setIsSyncingEvents(true);
        setSelectedAgent(newAgent);
        setTimeout(() => setIsSyncingEvents(false), 50);
      }
    };

    window.addEventListener('agent-selection-changed', handleAgentChange as EventListener);
    return () => {
      window.removeEventListener('agent-selection-changed', handleAgentChange as EventListener);
    };
  }, [selectedAgent, isSyncingEvents]);

  const handleAgentChange = useCallback((agentId: string | null) => {
    if (agentId !== selectedAgent && !isSyncingEvents) {
      setSelectedAgent(agentId);
    }
  }, [selectedAgent, isSyncingEvents]);

  // Fonction pour effacer l'agent sélectionné
  const clearSelectedAgent = useCallback(() => {
    if (selectedAgent !== null && !isSyncingEvents) {
      setSelectedAgent(null);
    }
  }, [selectedAgent, isSyncingEvents]);

  return { selectedAgent, handleAgentChange, clearSelectedAgent };
};
