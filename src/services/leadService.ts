
import { LeadDetailed } from "@/types/lead";
import { 
  createLead as createLeadCore,
  getLeads,
  getLead,
  updateLead,
  deleteLead,
  convertToSimpleLead
} from "./leadCore";
import { addActionToLead } from "./leadActions";

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

// Re-export all the necessary functions from leadCore and leadActions
export { 
  getLeads, 
  getLead, 
  updateLead, 
  deleteLead, 
  convertToSimpleLead,
  addActionToLead
};

// Export the LeadDetailed type for convenience
export type { LeadDetailed };
// Export ActionHistory type
export type { ActionHistory } from "@/types/actionHistory";
