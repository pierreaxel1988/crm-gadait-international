
import { supabase } from "@/integrations/supabase/client";
import { LeadDetailed } from "@/types/lead";
import { mapToSupabaseFormat } from "./utils/leadMappers";
import { v4 as uuidv4 } from "uuid";

export const createLead = async (leadData: Omit<LeadDetailed, "id" | "createdAt">): Promise<LeadDetailed | null> => {
  try {
    const leadId = uuidv4();
    const createdAt = new Date().toISOString();
    
    const completeLeadData: LeadDetailed = {
      id: leadId,
      createdAt: createdAt,
      ...leadData,
      status: leadData.status || 'New',
      actionHistory: leadData.actionHistory || []
    };
    
    const supabaseData = mapToSupabaseFormat(completeLeadData);
    
    // Log all data before sending to Supabase
    console.log("Data being sent to Supabase:", supabaseData);
    console.log("Action history being sent:", supabaseData.action_history);
    
    const { data, error } = await supabase
      .from("leads")
      .insert(supabaseData)
      .select()
      .single();
    
    if (error) {
      console.error("Error creating lead:", error);
      throw error;
    }
    
    if (data) {
      // Log the response from Supabase
      console.log("Data received from Supabase:", data);
      
      // The Supabase response uses snake_case, but our app uses camelCase
      // We need to handle the conversion properly
      const actionHistory = data['action_history'] || [];
      console.log("Action history received:", actionHistory);
      
      return {
        ...data,
        createdAt: data.created_at || createdAt,
        id: data.id || leadId,
        name: data.name || leadData.name,
        salutation: data.salutation || leadData.salutation,
        status: data.status || leadData.status || 'New',
        actionHistory: Array.isArray(actionHistory) ? actionHistory : []
      } as LeadDetailed;
    }
    
    return completeLeadData;
  } catch (error) {
    console.error("Error in createLead:", error);
    return null;
  }
};
