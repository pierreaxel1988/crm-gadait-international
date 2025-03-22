
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
  try {
    // Ensure pipelineType is properly set
    if (!leadData.pipelineType) {
      leadData.pipelineType = 'purchase';
    }
    
    // If pipeline_type is not set (for database compatibility), set it the same as pipelineType
    if (!leadData.pipeline_type) {
      leadData.pipeline_type = leadData.pipelineType;
    }
    
    // If no agent is assigned and the user isn't already assigned, find Pierre Axel Gadait
    if (!leadData.assignedTo) {
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        
        const { data } = await supabase
          .from('team_members')
          .select('id')
          .ilike('name', '%pierre axel gadait%')
          .maybeSingle();
          
        if (data && data.id) {
          leadData.assignedTo = data.id;
        }
      } catch (error) {
        console.error('Error fetching Pierre Axel ID:', error);
      }
    }

    console.log("leadService: Creating lead with processed data:", leadData);
    
    // Continue with the creation of the lead
    return await createLeadCore(leadData);
  } catch (error) {
    console.error("Error in leadService.createLead:", error);
    throw error; // Re-throw to allow handling by the caller
  }
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
