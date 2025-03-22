
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
import { toast } from "@/hooks/use-toast";

export const createLead = async (leadData: Omit<LeadDetailed, "id" | "createdAt">): Promise<LeadDetailed | null> => {
  try {
    console.log("leadService: Starting lead creation process");
    
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
        console.log("No assignedTo value, looking for Pierre Axel");
        const { supabase } = await import('@/integrations/supabase/client');
        
        const { data, error } = await supabase
          .from('team_members')
          .select('id')
          .ilike('name', '%pierre axel gadait%')
          .maybeSingle();
          
        if (error) {
          console.error("Error fetching Pierre Axel:", error);
        }
          
        if (data && data.id) {
          console.log("Found Pierre Axel, assigning lead to:", data.id);
          leadData.assignedTo = data.id;
        } else {
          console.log("Pierre Axel not found in team members");
        }
      } catch (error) {
        console.error('Error fetching Pierre Axel ID:', error);
      }
    }

    console.log("leadService: Creating lead with processed data:", leadData);
    
    // Continue with the creation of the lead
    const result = await createLeadCore(leadData);
    console.log("Lead creation result:", result);
    
    if (result) {
      toast({
        title: "Lead créé avec succès",
        description: "Le nouveau lead a été ajouté à la base de données.",
      });
    }
    
    return result;
  } catch (error) {
    console.error("Error in leadService.createLead:", error);
    toast({
      variant: "destructive",
      title: "Erreur lors de la création du lead",
      description: error instanceof Error ? error.message : "Une erreur inconnue est survenue",
    });
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
