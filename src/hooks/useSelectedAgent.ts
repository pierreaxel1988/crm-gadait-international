
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Ce hook permet de synchroniser la sélection d'agent entre les différentes parties de l'application
export const useSelectedAgent = () => {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [agentName, setAgentName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Effet pour récupérer les informations de l'agent sélectionné
  useEffect(() => {
    if (!selectedAgent) {
      setAgentName(null);
      return;
    }
    
    const fetchAgentDetails = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('team_members')
          .select('name')
          .eq('id', selectedAgent)
          .single();
          
        if (error) {
          console.error('Erreur lors de la récupération des détails de l\'agent:', error);
          return;
        }
        
        if (data) {
          setAgentName(data.name);
        }
      } catch (error) {
        console.error('Erreur inattendue:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAgentDetails();
  }, [selectedAgent]);
  
  const handleAgentChange = (agentId: string | null) => {
    console.log("useSelectedAgent: Mise à jour de l'agent sélectionné:", agentId);
    setSelectedAgent(agentId);
    
    // Option: Stocker dans localStorage pour conserver la sélection entre les rechargements de page
    if (agentId) {
      localStorage.setItem('selectedAgent', agentId);
    } else {
      localStorage.removeItem('selectedAgent');
    }
  };
  
  // Charger l'agent précédemment sélectionné depuis le localStorage lors de l'initialisation
  useEffect(() => {
    const savedAgent = localStorage.getItem('selectedAgent');
    if (savedAgent) {
      setSelectedAgent(savedAgent);
    }
  }, []);
  
  return {
    selectedAgent,
    agentName,
    isLoading,
    handleAgentChange
  };
};

export default useSelectedAgent;
