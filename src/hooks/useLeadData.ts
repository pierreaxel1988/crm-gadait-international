
import { useState, useEffect } from 'react';
import { LeadDetailed } from '@/types/lead';
import { getLead } from '@/services/leadService';
import { toast } from '@/hooks/use-toast';

export const useLeadData = (id: string | undefined) => {
  const [lead, setLead] = useState<LeadDetailed | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      try {
        const leadData = getLead(id);
        setLead(leadData);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les informations du lead."
        });
      } finally {
        setIsLoading(false);
      }
    }
  }, [id]);

  return { lead, setLead, isLoading };
};
