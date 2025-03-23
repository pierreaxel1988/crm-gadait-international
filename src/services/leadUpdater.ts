
import { supabase } from "@/integrations/supabase/client";
import { LeadDetailed } from "@/types/lead";
import { mapToLeadDetailed, mapToSupabaseFormat } from "./utils/leadMappers";

/**
 * Updates an existing lead in the database
 */
export const updateLead = async (leadData: LeadDetailed): Promise<LeadDetailed | null> => {
  try {
    console.log("Updating lead with data:", leadData);
    
    // Ensure actionHistory is always an array
    if (!leadData.actionHistory) {
      leadData.actionHistory = [];
    }
    
    const supabaseLeadData = mapToSupabaseFormat(leadData);
    
    // Ensure all critical fields are present and log them for debugging
    console.log("Complete Supabase lead data for update:", supabaseLeadData);
    console.log("Action history for update:", supabaseLeadData.action_history);
    
    // Validate the action_history before sending to Supabase
    if (!Array.isArray(supabaseLeadData.action_history)) {
      console.warn("action_history is not an array, setting to empty array");
      supabaseLeadData.action_history = [];
    }
    
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
      // Safe extraction of action_history from the response
      const actionHistory = data['action_history'] || [];
      console.log("Action history after update:", actionHistory);
      
      // Convert from Supabase format to our app format
      const mappedLead = mapToLeadDetailed(data);
      console.log("Mapped lead after update:", mappedLead);
      return mappedLead;
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
