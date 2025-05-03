
import { LeadDetailed } from "@/types/lead";
import { ActionHistory } from "@/types/actionHistory";
import { getLead, updateLead } from "./leadCore";
import { TaskType } from "@/components/kanban/KanbanCard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const addActionToLead = async (leadId: string, action: Omit<ActionHistory, 'id' | 'createdAt'>): Promise<LeadDetailed | undefined> => {
  try {
    console.log("Adding action to lead:", { leadId, action });
    
    // Get the lead first
    const lead = await getLead(leadId);
    
    if (!lead) {
      console.error("Lead not found:", leadId);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Lead introuvable."
      });
      return undefined;
    }
    
    console.log("Lead found:", lead.name);
    
    // Ensure actionHistory is initialized
    if (!lead.actionHistory) {
      lead.actionHistory = [];
    }
    
    // Create a new action with ID and createdAt
    const newAction: ActionHistory = {
      id: crypto.randomUUID(),
      ...action,
      createdAt: new Date().toISOString()
    };
    
    const currentDate = new Date().toISOString();
    
    console.log("Created new action:", newAction);
    
    // Update the lead with the new action in history
    const updatedLead: LeadDetailed = {
      ...lead,
      taskType: action.actionType as TaskType,
      nextFollowUpDate: action.scheduledDate,
      lastContactedAt: currentDate,
      actionHistory: [...lead.actionHistory, newAction]
    };
    
    console.log('Updating lead with new action:', { 
      leadId, 
      action, 
      newAction, 
      updatedActionHistory: updatedLead.actionHistory 
    });
    
    // Update the lead in database directly without relying on trigger functions
    const { data, error } = await supabase
      .from('leads')
      .update({
        action_history: updatedLead.actionHistory,
        task_type: updatedLead.taskType,
        next_follow_up_date: updatedLead.nextFollowUpDate,
        last_contacted_at: updatedLead.lastContactedAt
      })
      .eq('id', leadId)
      .select();
    
    if (error) {
      console.error("Error updating lead with new action:", error);
      throw error;
    }
    
    // Verify action history was saved properly with direct query
    try {
      const { data: verificationData, error: verificationError } = await supabase
        .from('leads')
        .select('action_history')
        .eq('id', leadId)
        .single();
      
      if (verificationError) {
        console.error('Error verifying action history:', verificationError);
      } else if (verificationData) {
        console.log('Action history verified in database:', verificationData.action_history);
      }
    } catch (queryError) {
      console.error('Error querying action history:', queryError);
    }
    
    // If data is returned from the update, return the mapped lead
    if (data && data.length > 0) {
      // We now need to call getLead again to get the fully updated lead
      return await getLead(leadId);
    }
    
    return updatedLead;
  } catch (err) {
    console.error('Error adding action to lead:', err);
    toast({
      variant: "destructive",
      title: "Erreur",
      description: "Impossible d'ajouter l'action au lead."
    });
    return undefined;
  }
};
