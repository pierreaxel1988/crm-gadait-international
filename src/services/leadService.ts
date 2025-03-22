
import { LeadDetailed } from "@/types/lead";
import { createLead as createLeadCore } from "./leadCore";

export const createLead = async (leadData: Omit<LeadDetailed, "id" | "createdAt">): Promise<LeadDetailed | null> => {
  // Si un agent n'est pas déjà assigné, chercher l'ID de Pierre Axel Gadait
  if (!leadData.assignedTo) {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data } = await supabase
        .from('team_members')
        .select('id')
        .ilike('name', '%pierre axel gadait%')
        .single();
        
      if (data && data.id) {
        leadData.assignedTo = data.id;
      }
    } catch (error) {
      console.error('Error fetching Pierre Axel ID:', error);
    }
  }

  // Continuer avec la création du lead
  return createLeadCore(leadData);
};
