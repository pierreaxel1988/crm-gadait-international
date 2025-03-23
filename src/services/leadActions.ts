
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
      taskType: action.actionType as TaskType, // Cast to TaskType here
      nextFollowUpDate: action.scheduledDate,
      lastContactedAt: currentDate, // Update last contacted date to now
      actionHistory: [...(lead.actionHistory || []), newAction]
    };
    
    // Save the updated lead
    const result = await updateLead(updatedLead);
    
    // Also try to update the action history directly in Supabase for better data consistency
    try {
      const { error } = await supabase
        .from('leads')
        .update({
          task_type: action.actionType,
          next_follow_up_date: action.scheduledDate,
          last_contacted_at: currentDate, // Update this field in the database
          action_history: updatedLead.actionHistory
        })
        .eq('id', leadId);
      
      if (error) {
        console.error('Error updating action history in Supabase:', error);
        throw error; // Throw the error to be caught by the outer try/catch
      }
    } catch (err) {
      console.error('Unexpected error updating action history:', err);
      throw err; // Rethrow to be caught by the outer try/catch
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
