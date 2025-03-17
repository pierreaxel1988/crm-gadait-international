
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
    
    // Prepare lead data for Supabase insertion
    const supabaseLeadData = mapToSupabaseFormat(leadData);
    supabaseLeadData.imported_at = new Date().toISOString(); // Always include the imported_at field for new leads

    console.log("Prepared Supabase lead data:", supabaseLeadData);
    
    // First, try to create the lead in Supabase
    const { data, error } = await supabase
      .from('leads')
      .insert([supabaseLeadData])
      .select()
      .single();
      
    if (error) {
      console.error("Error creating lead in Supabase:", error);
      throw new Error(`Failed to create lead: ${error.message}`);
    }
    
    if (data) {
      console.log("Lead created successfully:", data);
      // Map the Supabase response to LeadDetailed
      return mapToLeadDetailed(data);
    }
    
    // If Supabase insertion fails, fall back to local storage
    const leads = await getLeads();
    const newLead = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...leadData };
    leads.push(newLead);
    localStorage.setItem('leads', JSON.stringify(leads));

    return newLead as LeadDetailed;
  } catch (error) {
    console.error("Error in createLead:", error);
    throw error;
  }
};
