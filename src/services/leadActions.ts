
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
    
    // Fix for undefined or object scheduledDate
    if (!newAction.scheduledDate || typeof newAction.scheduledDate === 'object') {
      newAction.scheduledDate = new Date().toISOString();
    }
    
    const currentDate = new Date().toISOString();
    
    console.log("Created new action:", newAction);
    
    // Update the lead with the new action in history
    const updatedLead: LeadDetailed = {
      ...lead,
      taskType: action.actionType as TaskType,
      nextFollowUpDate: newAction.scheduledDate,
      lastContactedAt: currentDate,
      actionHistory: [...lead.actionHistory, newAction]
    };
    
    console.log('Updating lead with new action:', { 
      leadId, 
      action, 
      newAction, 
      updatedActionHistory: updatedLead.actionHistory 
    });
    
    // Avoid the http_post function by using direct updateLead
    const result = await updateLead(updatedLead);
    
    if (!result) {
      throw new Error("Failed to update lead with new action");
    }
    
    console.log("Lead successfully updated with new action");
    return result;
    
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
