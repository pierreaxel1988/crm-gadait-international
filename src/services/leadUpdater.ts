import { supabase } from "@/integrations/supabase/client";
import { LeadDetailed } from "@/types/lead";
import { mapToLeadDetailed, mapToSupabaseFormat } from "./utils/leadMappers";

/**
 * Updates an existing lead in the database
 */
export const updateLead = async (leadData: LeadDetailed): Promise<LeadDetailed | null> => {
  try {
    console.log("Updating lead with data:", leadData);
    
    const supabaseLeadData = mapToSupabaseFormat(leadData);
    
    // Ensure critical fields are present and log them
    console.log("Budget is:", supabaseLeadData.budget);
    console.log("Desired location is:", supabaseLeadData.desired_location);
    
    console.log("Mapped Supabase lead data:", supabaseLeadData);
    
    const { data, error } = await supabase
      .from('leads')
      .update(supabaseLeadData)
      .eq('id', leadData.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating lead:", error);
      throw new Error(`Failed to update lead: ${error.message}`);
    }

    console.log("Lead update successful, response data:", data);
    
    if (data) {
      return mapToLeadDetailed(data);
    }

    return null;
  } catch (error) {
    console.error("Error in updateLead:", error);
    throw error;
  }
};

/**
 * Deletes a lead from the database
 */
export const deleteLead = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting lead:", error);
      throw new Error(`Failed to delete lead: ${error.message}`);
    }

    return true;
  } catch (error) {
    console.error("Error in deleteLead:", error);
    throw error;
  }
};
