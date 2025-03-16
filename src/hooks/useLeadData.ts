
import { useState, useEffect } from 'react';
import { LeadDetailed } from '@/types/lead';
import { getLead } from '@/services/leadCore';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useLeadData = (id: string | undefined) => {
  const [lead, setLead] = useState<LeadDetailed | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeadData = async () => {
      if (!id) {
        setIsLoading(false);
        return;
      }

      try {
        // Récupérer les données du lead
        const leadData = await getLead(id);
        
        // Si le lead n'est pas assigné, chercher l'ID de Pierre Axel Gadait
        // Mais uniquement si le lead n'a pas déjà été assigné lors de l'importation
        if (leadData && !leadData.assignedTo) {
          const { data: pierreAxelData, error } = await supabase
            .from('team_members')
            .select('id')
            .ilike('name', '%pierre axel gadait%')
            .single();
          
          if (!error && pierreAxelData) {
            // Assigner automatiquement le lead à Pierre Axel
            leadData.assignedTo = pierreAxelData.id;
          }
        }
        
        setLead(leadData);
      } catch (error) {
        console.error("Erreur lors du chargement du lead:", error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les informations du lead."
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeadData();
  }, [id]);

  return { lead, setLead, isLoading };
};
