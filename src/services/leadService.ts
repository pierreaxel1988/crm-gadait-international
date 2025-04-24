
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
import { supabase } from "@/integrations/supabase/client";

export const createLead = async (leadData: Omit<LeadDetailed, "id" | "createdAt">): Promise<LeadDetailed | null> => {
  try {
    console.log("leadService: Starting lead creation process");
    
    // Ensure pipelineType is properly set
    if (!leadData.pipelineType) {
      leadData.pipelineType = 'purchase';
    }
    
    // Always set pipeline_type (for database compatibility) to ensure it matches pipelineType
    leadData.pipeline_type = leadData.pipelineType;
    
    console.log("leadService: Pipeline types set:", { 
      pipelineType: leadData.pipelineType, 
      pipeline_type: leadData.pipeline_type,
      status: leadData.status
    });
    
    // Vérifier l'utilisateur actuel et son rôle
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;
    
    if (!user) {
      throw new Error("Vous devez être connecté pour créer un lead.");
    }
    
    // Vérifier si l'utilisateur est admin
    const { data: currentUserData, error: userError } = await supabase
      .from('team_members')
      .select('id, name, is_admin')
      .eq('email', user.email)
      .single();
      
    if (userError) {
      console.error("Erreur lors de la récupération des informations utilisateur:", userError);
      throw new Error("Impossible de vérifier vos permissions.");
    }
    
    const isAdmin = currentUserData?.is_admin === true;
    console.log("User is admin:", isAdmin, "Current user ID:", currentUserData?.id);
    
    // Si c'est un commercial (non admin), s'assurer que le lead est assigné à lui-même
    // conformément aux politiques RLS
    if (!isAdmin) {
      if (!leadData.assignedTo || leadData.assignedTo !== currentUserData.id) {
        console.log("Non-admin user creating lead, auto-assigning to self:", currentUserData.name);
        leadData.assignedTo = currentUserData.id;
        
        toast({
          title: "Information",
          description: "En tant que commercial, le lead est automatiquement assigné à vous-même.",
        });
      }
    }
    
    // Si un admin crée un lead sans assigner d'agent, on le lui signale
    if (isAdmin && !leadData.assignedTo) {
      console.log("Admin creating lead without assignment");
      toast({
        title: "Information",
        description: "Le lead sera créé sans être assigné à un agent.",
      });
    }
    
    console.log("Final assignedTo value:", leadData.assignedTo);
    
    console.log("leadService: Creating lead with processed data:", leadData);
    
    // Continue with the creation of the lead
    const result = await createLeadCore(leadData);
    console.log("Lead creation result:", result);
    
    if (result) {
      let successMessage = "Lead créé avec succès";
      
      if (result.assignedTo) {
        const { data: agentData } = await supabase
          .from("team_members")
          .select("name")
          .eq("id", result.assignedTo)
          .single();
            
        if (agentData) {
          successMessage = `Le lead a été créé et attribué à ${agentData.name} avec succès.`;
        }
      }
      
      toast({
        title: "Lead créé",
        description: successMessage,
      });

      // Vérifier si le lead est en statut "New" et a un agent assigné
      if (result.status === "New" && result.assignedTo) {
        // Ajouter une action de type "Call" pour qualifier le lead
        const qualificationAction = {
          actionType: "Call",
          scheduledDate: new Date().toISOString(),
          notes: "Qualification du lead : appeler le client pour comprendre ses besoins précis."
        };
        
        console.log("Creating qualification action for new lead:", qualificationAction);
        
        try {
          const updatedLead = await addActionToLead(result.id, qualificationAction);
          if (updatedLead) {
            console.log("Qualification action created successfully");
            toast({
              title: "Action créée",
              description: "Une action de qualification a été créée pour ce lead.",
            });
          }
        } catch (actionError) {
          console.error("Error creating qualification action:", actionError);
          toast({
            variant: "destructive",
            title: "Attention",
            description: "Le lead a été créé mais l'action de qualification n'a pas pu être ajoutée.",
          });
        }
      }
    }
    
    return result;
  } catch (error) {
    console.error("Error in leadService.createLead:", error);
    
    // Gestion spécifique des erreurs RLS
    if (error instanceof Error && 
        (error.message.includes("violates row-level security") || 
         error.message.includes("new row violates"))) {
      toast({
        variant: "destructive",
        title: "Erreur d'autorisation",
        description: "Vous n'avez pas les droits nécessaires pour créer ce lead avec cette assignation. Si vous êtes commercial, vous devez vous assigner le lead à vous-même.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Erreur lors de la création du lead",
        description: error instanceof Error ? error.message : "Une erreur inconnue est survenue",
      });
    }
    
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
