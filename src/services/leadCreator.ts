
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
    
    // Log assignment information to verify data
    if (completeLeadData.assignedTo) {
      console.log("Lead will be assigned to agent with ID:", completeLeadData.assignedTo);
      
      // Verify agent exists
      const { data: agentData, error: agentError } = await supabase
        .from("team_members")
        .select("name, is_admin")
        .eq("id", completeLeadData.assignedTo)
        .single();
        
      if (agentError) {
        console.warn("Warning: Could not verify agent exists:", agentError);
      } else {
        console.log("Lead will be assigned to agent:", agentData.name);
      }
      
      // Vérifier si l'utilisateur actuel est admin
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user) {
        const { data: currentUser } = await supabase
          .from("team_members")
          .select("id, is_admin")
          .eq("email", sessionData.session.user.email)
          .single();
          
        // Si l'utilisateur n'est pas admin, vérifier qu'il s'assigne à lui-même
        if (currentUser && !currentUser.is_admin && currentUser.id !== completeLeadData.assignedTo) {
          console.warn("Non-admin user trying to assign lead to someone else. This might fail due to RLS.");
        }
      }
    } else {
      console.log("Lead will not be assigned to any agent");
    }
    
    // Map to Supabase format
    const supabaseData = mapToSupabaseFormat(completeLeadData);
    
    // Ensure assigned_to is explicitly set in the data
    if (completeLeadData.assignedTo) {
      supabaseData.assigned_to = completeLeadData.assignedTo;
    }
    
    console.log("Data being sent to Supabase:", supabaseData);
    
    // Insert into database
    const { data, error } = await supabase
      .from("leads")
      .insert(supabaseData)
      .select()
      .single();
    
    if (error) {
      console.error("Error creating lead:", error);
      
      // Vérifier s'il s'agit d'une erreur RLS
      if (error.message && 
          (error.message.includes("violates row-level security") ||
           error.message.includes("new row violates"))) {
        throw new Error("Violation de la politique de sécurité RLS: Vous n'avez pas les droits nécessaires pour créer ce lead avec cette assignation.");
      }
      
      throw error;
    }
    
    if (data) {
      console.log("Data received from Supabase:", data);
      
      // Verify assigned_to was saved properly
      if (completeLeadData.assignedTo && !data.assigned_to) {
        console.warn("Assignment appears to have failed - assigned_to field is empty in response");
        
        // Attempt to update the assignment if it failed initially
        const { error: updateError } = await supabase
          .from("leads")
          .update({ assigned_to: completeLeadData.assignedTo })
          .eq("id", data.id);
          
        if (updateError) {
          console.error("Error updating lead assignment:", updateError);
        } else {
          console.log("Assignment fixed via update");
        }
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
