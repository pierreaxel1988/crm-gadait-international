
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
    
    // Log the data for debugging
    console.log("Preparing lead data for update:", supabaseLeadData);
    
    // Remove actionHistory from the data before sending to Supabase
    // since this column doesn't exist in the leads table
    const { action_history, ...dataToUpdate } = supabaseLeadData;
    
    console.log("Final data being sent to Supabase:", dataToUpdate);
    
    const { data, error } = await supabase
      .from('leads')
      .update(dataToUpdate)
      .eq('id', leadData.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating lead:", error);
      throw new Error(`Failed to update lead: ${error.message}`);
    }

    console.log("Lead update successful, response data:", data);
    
    if (data) {
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
