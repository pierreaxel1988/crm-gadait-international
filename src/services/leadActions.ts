
import { LeadDetailed } from "@/types/lead";
import { ActionHistory } from "@/types/actionHistory";
import { getLead, updateLead } from "./leadCore";
import { TaskType } from "@/components/kanban/KanbanCard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const addActionToLead = async (leadId: string, action: Omit<ActionHistory, 'id' | 'createdAt'>): Promise<LeadDetailed | undefined> => {
  try {
    // Get the lead first
    const lead = await getLead(leadId);
    
    if (!lead) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Lead introuvable."
      });
      return undefined;
    }
    
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
    
    // Update the lead in Supabase
    const result = await updateLead(updatedLead);
    
    if (!result) {
      throw new Error('Failed to update lead with new action');
    }
    
    // Verify action history was saved properly with direct query
    const { data, error } = await supabase
      .from('leads')
      .select('action_history')
      .eq('id', leadId)
      .single();
    
    if (error) {
      console.error('Error verifying action history:', error);
    } else if (data) {
      console.log('Action history verified in database:', data.action_history);
    }
    
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
