
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
    console.log("Preparing lead data for update:", supabaseLeadData);
    
    // Ensure phone-related fields are always explicitly included in the update
    // Use nullish coalescing to avoid setting undefined values
    supabaseLeadData.phone_country_code = leadData.phoneCountryCode ?? null;
    supabaseLeadData.phone_country_code_display = leadData.phoneCountryCodeDisplay ?? null;
    
    // Add pipeline_type field to ensure consistency
    if (leadData.pipelineType) {
      supabaseLeadData.pipeline_type = leadData.pipelineType;
    }
    
    // Ensure preferred_language is included in the update
    supabaseLeadData.preferred_language = leadData.preferredLanguage ?? null;
    
    // Debug log for phone-related fields
    console.log("Phone-related fields:", {
      phoneCountryCode: leadData.phoneCountryCode,
      phoneCountryCodeDisplay: leadData.phoneCountryCodeDisplay,
      phone: leadData.phone
    });

    // Debug log for language field
    console.log("Language field:", {
      preferredLanguage: leadData.preferredLanguage
    });
    
    // Special handling for multiple bedroom selections
    const isMultipleBedroomsSelected = Array.isArray(leadData.bedrooms) && leadData.bedrooms.length > 1;
    
    let result;
    
    if (isMultipleBedroomsSelected) {
      // First update everything except bedrooms
      const { bedrooms, ...dataWithoutBedrooms } = supabaseLeadData;
      
      result = await supabase
        .from('leads')
        .update(dataWithoutBedrooms)
        .eq('id', leadData.id)
        .select()
        .single();
      
      if (result.error) {
        console.error("Error updating lead:", result.error);
        throw result.error;
      }
      
      // Then use the update_lead_bedrooms function to handle complex bedroom values
      if (Array.isArray(leadData.bedrooms) && leadData.bedrooms.length > 0) {
        const { error: bedroomsError } = await supabase.rpc(
          'update_lead_bedrooms',
          { 
            lead_id: leadData.id,
            bedroom_values: JSON.stringify(leadData.bedrooms)
          }
        );
        
        if (bedroomsError) {
          console.error("Error updating bedrooms:", bedroomsError);
        }
      }
    } else {
      // Standard update for simple cases
      result = await supabase
        .from('leads')
        .update(supabaseLeadData)
        .eq('id', leadData.id)
        .select()
        .single();
      
      if (result.error) {
        console.error("Error updating lead:", result.error);
        throw result.error;
      }
    }
    
    // Verify action history was saved properly
    console.log("Update response:", result.data);
    
    if (result.data) {
      return mapToLeadDetailed(result.data);
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
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error in deleteLead:", error);
    throw error;
  }
};
