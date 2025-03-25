
import { supabase } from "@/integrations/supabase/client";
import { LeadDetailed } from "@/types/lead";
import { mapToSupabaseFormat } from "./utils/leadMappers";
import { v4 as uuidv4 } from "uuid";

export const createLead = async (leadData: Omit<LeadDetailed, "id" | "createdAt">): Promise<LeadDetailed | null> => {
  try {
    const leadId = uuidv4();
    const createdAt = new Date().toISOString();
    
    // Create complete lead data
    const completeLeadData: LeadDetailed = {
      id: leadId,
      createdAt: createdAt,
      ...leadData,
      status: leadData.status || 'New',
      actionHistory: leadData.actionHistory || []
    };
    
    // Add creation action to history if not present
    if (!completeLeadData.actionHistory || completeLeadData.actionHistory.length === 0) {
      completeLeadData.actionHistory = [{
        id: uuidv4(),
        actionType: 'Creation',
        createdAt: createdAt,
        scheduledDate: createdAt,
        notes: 'Lead créé'
      }];
    }
    
    // Ensure assignment is properly set
    if (completeLeadData.assignedTo) {
      console.log("Lead will be assigned to:", completeLeadData.assignedTo);
    } else {
      console.log("Lead will not be assigned to any agent");
    }
    
    // Map to Supabase format
    const supabaseData = mapToSupabaseFormat(completeLeadData);
    console.log("Data being sent to Supabase:", supabaseData);
    
    // Insert into database
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
      console.log("Data received from Supabase:", data);
      
      // Verify assigned_to was saved properly
      if (completeLeadData.assignedTo && !data.assigned_to) {
        console.warn("Assignment appears to have failed - assigned_to field is empty in response");
      }
      
      // Map database response back to LeadDetailed format
      return {
        ...data,
        createdAt: data.created_at || createdAt,
        id: data.id || leadId,
        name: data.name || leadData.name,
        salutation: data.salutation || leadData.salutation,
        status: data.status || leadData.status || 'New',
        actionHistory: data.action_history || completeLeadData.actionHistory,
        // Ensure consistency between pipelineType and pipeline_type
        pipelineType: data.pipeline_type || completeLeadData.pipelineType,
        pipeline_type: data.pipeline_type || completeLeadData.pipelineType,
        // Ensure assignedTo is properly mapped
        assignedTo: data.assigned_to || completeLeadData.assignedTo
      } as LeadDetailed;
    }
    
    return completeLeadData;
  } catch (error) {
    console.error("Error in createLead:", error);
    throw error;
  }
};
