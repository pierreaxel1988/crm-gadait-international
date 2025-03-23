
import { supabase } from "@/integrations/supabase/client";
import { LeadDetailed } from "@/types/lead";
import { mapToLeadDetailed, mapToSupabaseFormat } from "./utils/leadMappers";

/**
 * Updates an existing lead in the database
 */
export const updateLead = async (leadData: LeadDetailed): Promise<LeadDetailed | null> => {
  try {
    console.log("Updating lead with data:", leadData);
    
    // Log purchase conditions for debugging
    console.log("Purchase conditions:", {
      purchaseTimeframe: leadData.purchaseTimeframe,
      financingMethod: leadData.financingMethod,
      propertyUse: leadData.propertyUse
    });
    
    const supabaseLeadData = mapToSupabaseFormat(leadData);
    
    // Log the data for debugging
    console.log("Preparing lead data for update:", supabaseLeadData);
    
    // Remove actionHistory from the data before sending to Supabase
    // since this column doesn't exist in the leads table
    const { action_history, ...dataToUpdate } = supabaseLeadData;
    
    console.log("Final data being sent to Supabase:", dataToUpdate);
    
    // Special handling for multiple bedroom selections
    // Since the database bedrooms column is an integer, we need a custom approach for multiple values
    const isMultipleBedroomsSelected = Array.isArray(leadData.bedrooms) && leadData.bedrooms.length > 1;
    
    let result;
    if (isMultipleBedroomsSelected) {
      // First update all fields except bedrooms
      const { bedrooms, ...dataWithoutBedrooms } = dataToUpdate;
      
      // First update everything except bedrooms
      result = await supabase
        .from('leads')
        .update(dataWithoutBedrooms)
        .eq('id', leadData.id)
        .select()
        .single();
      
      if (result.error) {
        console.error("Error updating lead:", result.error);
        throw new Error(`Failed to update lead: ${result.error.message}`);
      }
      
      // Now store the bedrooms as a JSON array directly with a raw SQL update
      // This is necessary since the column is an integer but we need to store multiple values
      const bedroomsArray = JSON.stringify(leadData.bedrooms);
      console.log("Updating bedrooms with array:", bedroomsArray);
      
      // Use the correct function name that matches what we created in the database
      const { error: bedroomsError } = await supabase.rpc(
        'update_lead_bedrooms', 
        { 
          lead_id: leadData.id, 
          bedroom_values: bedroomsArray 
        }
      );
        
      if (bedroomsError) {
        console.error("Error updating bedrooms:", bedroomsError);
        // Continue anyway, as the other fields were updated successfully
      }
      
      // Now fetch the full lead again to get all updated fields
      const { data: updatedData, error: fetchError } = await supabase
        .from('leads')
        .select()
        .eq('id', leadData.id)
        .single();
        
      if (fetchError) {
        console.error("Error fetching updated lead:", fetchError);
      } else {
        result.data = updatedData;
      }
    } else {
      // Regular update for single or no bedroom value
      result = await supabase
        .from('leads')
        .update(dataToUpdate)
        .eq('id', leadData.id)
        .select()
        .single();
    }

    const { data, error } = result;
    
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
