
import { supabase } from "@/integrations/supabase/client";
import { LeadDetailed } from "@/types/lead";
import { mapToLeadDetailed, mapToSupabaseFormat } from "./utils/leadMappers";
import { getLeads } from "./leadReader";

/**
 * Creates a new lead in the database
 */
export const createLead = async (leadData: Omit<LeadDetailed, "id" | "createdAt">): Promise<LeadDetailed | null> => {
  try {
    console.log("Creating lead with data:", leadData);
    
    // Ensure pipelineType is set
    if (!leadData.pipelineType) {
      leadData.pipelineType = 'purchase';
    }

    // Ensure pipeline_type is also set for database compatibility
    if (!leadData.pipeline_type) {
      leadData.pipeline_type = leadData.pipelineType;
    }
    
    // Prepare lead data for Supabase insertion
    const supabaseLeadData = mapToSupabaseFormat(leadData);
    
    // We need to explicitly set imported_at date for new leads
    const dataWithImportedDate = {
      ...supabaseLeadData,
      imported_at: new Date().toISOString(),
      pipeline_type: leadData.pipelineType, // Make sure pipeline_type is explicitly set
      assigned_to: leadData.assignedTo || null // Ensure assignment is preserved
    };

    console.log("Prepared Supabase lead data:", dataWithImportedDate);
    
    // Get current auth session to verify user is authenticated
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.error("No authenticated session found.");
      throw new Error("Vous devez être connecté pour créer un lead.");
    }
    
    // Create the lead in Supabase using maybeSingle
    const { data, error } = await supabase
      .from('leads')
      .insert(dataWithImportedDate)
      .select('*')
      .maybeSingle();
      
    if (error) {
      console.error("Error creating lead in Supabase:", error);
      throw new Error(`Échec de création du lead: ${error.message}`);
    }
    
    if (data) {
      console.log("Lead created successfully:", data);
      return mapToLeadDetailed(data);
    }
    
    // Fallback to local storage if needed
    console.log("No data returned from Supabase, using fallback storage");
    const leads = await getLeads();
    const newLead = { 
      id: crypto.randomUUID(), 
      createdAt: new Date().toISOString(), 
      ...leadData,
      pipelineType: leadData.pipelineType || 'purchase',
      pipeline_type: leadData.pipelineType || 'purchase'
    };
    leads.push(newLead);
    localStorage.setItem('leads', JSON.stringify(leads));

    return newLead as LeadDetailed;
  } catch (error) {
    console.error("Error in createLead:", error);
    throw error;
  }
};
