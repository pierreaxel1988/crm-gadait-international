
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
    
    // Ensure all critical fields are present and log them for debugging
    console.log("Complete Supabase lead data for update:", supabaseLeadData);
    console.log("Budget is:", supabaseLeadData.budget);
    console.log("Budget min is:", supabaseLeadData.budget_min);
    console.log("Desired location is:", supabaseLeadData.desired_location);
    console.log("Currency is:", supabaseLeadData.currency);
    console.log("Property types is:", supabaseLeadData.property_types);
    console.log("Bedrooms is:", supabaseLeadData.bedrooms);
    console.log("Views is:", supabaseLeadData.views);
    console.log("Amenities is:", supabaseLeadData.amenities);
    console.log("Purchase timeframe is:", supabaseLeadData.purchase_timeframe);
    console.log("Financing method is:", supabaseLeadData.financing_method);
    console.log("Property use is:", supabaseLeadData.property_use);
    console.log("Nationality is:", supabaseLeadData.nationality);
    console.log("Country is:", supabaseLeadData.country);
    console.log("Living area is:", supabaseLeadData.living_area);
    console.log("Action history is:", supabaseLeadData.action_history);
    
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
