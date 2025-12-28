
import { supabase } from "@/integrations/supabase/client";
import { LeadDetailed } from "@/types/lead";
import { mapToLeadDetailed, mapToSupabaseFormat } from "./utils/leadMappers";

// Important UUIDs
const JADE_ID = "acab847b-7ace-4681-989d-86f78549aa69";
const JEAN_MARC_ID = "af8e053c-8fae-4424-abaa-d79029fd8a11";
const SHARON_ID = "e564a874-2520-4167-bfa8-26d39f119470";

/**
 * Updates an existing lead in the database
 */
export const updateLead = async (leadData: LeadDetailed): Promise<LeadDetailed | null> => {
  try {
    console.log("Updating lead with data:", leadData);
    
    // Convert legacy IDs to proper UUIDs
    if (leadData.assignedTo === 'jade-diouane') {
      leadData.assignedTo = JADE_ID;
    } else if (leadData.assignedTo === 'jean-marc-perrissol') {
      leadData.assignedTo = JEAN_MARC_ID;
    } else if (leadData.assignedTo === 'sharon-ramdiane') {
      leadData.assignedTo = SHARON_ID;
    }
    
    const supabaseLeadData = mapToSupabaseFormat(leadData);
    console.log("Preparing lead data for update:", supabaseLeadData);
    
    // Ensure all required fields are properly included in the update
    supabaseLeadData.phone_country_code = leadData.phoneCountryCode ?? null;
    supabaseLeadData.phone_country_code_display = leadData.phoneCountryCodeDisplay ?? null;
    supabaseLeadData.preferred_language = leadData.preferredLanguage ?? null;
    supabaseLeadData.mandate_type = leadData.mandate_type ?? null;
    supabaseLeadData.map_coordinates = leadData.mapCoordinates ?? null;
    
    // Add pipeline_type field to ensure consistency
    if (leadData.pipelineType) {
      supabaseLeadData.pipeline_type = leadData.pipelineType;
    }
    
    // Clean up any problematic fields - remove fields that don't exist in the database
    const cleanedData = { ...supabaseLeadData };
    
    // Handle parking_spaces and floors - convert objects to proper values
    if (cleanedData.parking_spaces && typeof cleanedData.parking_spaces === 'object') {
      cleanedData.parking_spaces = null;
    }
    if (cleanedData.floors && typeof cleanedData.floors === 'object') {
      cleanedData.floors = null;
    }

    // Validate that required fields are properly set for property type updates
    if (leadData.propertyType) {
      console.log("Updating property type to:", leadData.propertyType);
      cleanedData.property_type = leadData.propertyType;
    }

    console.log("Final cleaned data for update:", cleanedData);
    
    // Special handling for multiple bedroom selections
    const isMultipleBedroomsSelected = Array.isArray(leadData.bedrooms) && leadData.bedrooms.length > 1;
    
    let result;
    
    if (isMultipleBedroomsSelected) {
      // First update everything except bedrooms
      const { bedrooms, ...dataWithoutBedrooms } = cleanedData;
      
      result = await supabase
        .from('leads')
        .update(dataWithoutBedrooms)
        .eq('id', leadData.id)
        .is('deleted_at', null) // Only update non-deleted leads
        .select()
        .maybeSingle();
      
      if (result.error) {
        console.error("Error updating lead:", result.error);
        throw new Error(`Database update failed: ${result.error.message}`);
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
          throw new Error(`Database update failed: ${bedroomsError.message}`);
        }
      }
    } else {
      // For single bedroom selection or no selection, ensure proper integer value
      if (Array.isArray(leadData.bedrooms)) {
        cleanedData.bedrooms = leadData.bedrooms.length > 0 ? leadData.bedrooms[0] : null;
      }
      
      // Standard update for simple cases
      result = await supabase
        .from('leads')
        .update(cleanedData)
        .eq('id', leadData.id)
        .is('deleted_at', null) // Only update non-deleted leads
        .select()
        .maybeSingle();
      
      if (result.error) {
        console.error("Error updating lead:", result.error);
        throw new Error(`Database update failed: ${result.error.message}`);
      }
    }
    
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
 * Soft deletes a lead from the database (marks as deleted instead of removing)
 * @deprecated Use softDeleteLead from leadSoftDelete.ts instead
 */
export const deleteLead = async (id: string, reason?: string): Promise<boolean> => {
  try {
    // Get current user's team member ID
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;
    
    if (!user) {
      throw new Error("Utilisateur non connecté");
    }

    // Get team member ID from email
    const { data: teamMember } = await supabase
      .from('team_members')
      .select('id')
      .eq('email', user.email)
      .single();

    if (!teamMember) {
      throw new Error("Membre d'équipe non trouvé");
    }

    // Soft delete the lead
    const { error } = await supabase
      .from('leads')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: teamMember.id,
        deletion_reason: reason || null
      })
      .eq('id', id);
    
    if (error) {
      console.error("Error soft deleting lead:", error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error in deleteLead:", error);
    throw error;
  }
};
