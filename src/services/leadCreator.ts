
import { supabase } from "@/integrations/supabase/client";
import { LeadDetailed } from "@/types/lead";
import { mapToSupabaseFormat } from "./utils/leadMappers";
import { v4 as uuidv4 } from "uuid";

/**
 * Creates a new lead in the database
 * 
 * @param leadData - Data to create the lead with
 * @returns The created lead or null if there was an error
 */
export const createLead = async (leadData: Omit<LeadDetailed, "id" | "createdAt">): Promise<LeadDetailed | null> => {
  try {
    // Generate a new UUID for the lead
    const leadId = uuidv4();
    const createdAt = new Date().toISOString();
    
    // Create a complete LeadDetailed object with the required id and createdAt fields
    const completeLeadData: LeadDetailed = {
      id: leadId,
      createdAt: createdAt,
      ...leadData,
      status: leadData.status || 'New'
    };
    
    // Convert to Supabase format
    const supabaseData = mapToSupabaseFormat(completeLeadData);
    
    // Insert into Supabase
    const { data, error } = await supabase
      .from("leads")
      .insert(supabaseData)
      .select()
      .single();
    
    if (error) {
      console.error("Error creating lead:", error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Error in createLead:", error);
    return null;
  }
};
