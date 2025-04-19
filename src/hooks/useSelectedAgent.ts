
import { useState, useEffect } from 'react';

export const useSelectedAgent = () => {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(() => {
    const saved = localStorage.getItem('selectedAgent');
    return saved ? saved : null;
  });

  useEffect(() => {
    if (selectedAgent) {
      localStorage.setItem('selectedAgent', selectedAgent);
    } else {
      localStorage.removeItem('selectedAgent');
    }
  }, [selectedAgent]);

  const handleAgentChange = (agentId: string | null) => {
    setSelectedAgent(agentId);
  };

  return { selectedAgent, handleAgentChange };
};
