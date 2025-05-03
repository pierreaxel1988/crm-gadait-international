
import { LeadDetailed } from "@/types/lead";
import { ActionHistory } from "@/types/actionHistory";
import { getLead } from "./leadCore";
import { TaskType } from "@/components/kanban/KanbanCard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const addActionToLead = async (leadId: string, action: Omit<ActionHistory, 'id' | 'createdAt'>): Promise<LeadDetailed | undefined> => {
  try {
    console.log('Adding action to lead:', { leadId, action });
    
    // Get the lead first
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();
    
    if (leadError) {
      console.error('Error fetching lead for adding action:', leadError);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Lead introuvable."
      });
      return undefined;
    }
    
    // Ensure actionHistory is initialized
    let actionHistory = lead.action_history || [];
    if (!Array.isArray(actionHistory)) {
      actionHistory = [];
    }
    
    // Clean and validate scheduledDate
    let scheduledDate = null;
    if (action.scheduledDate !== undefined && action.scheduledDate !== null) {
      try {
        if (typeof action.scheduledDate === 'object' && '_type' in action.scheduledDate && action.scheduledDate._type === 'undefined') {
          console.warn('Invalid scheduledDate object detected:', action.scheduledDate);
        } else {
          // Try to parse into a valid date
          const tempDate = new Date(action.scheduledDate);
          if (!isNaN(tempDate.getTime())) {
            scheduledDate = tempDate.toISOString();
          } else {
            console.warn('Invalid scheduledDate value:', action.scheduledDate);
          }
        }
      } catch (err) {
        console.warn('Error processing scheduledDate:', err);
      }
    }
    
    // Clean and validate completedDate
    let completedDate = null;
    if (action.completedDate !== undefined && action.completedDate !== null) {
      try {
        if (typeof action.completedDate === 'object' && '_type' in action.completedDate && action.completedDate._type === 'undefined') {
          console.warn('Invalid completedDate object detected:', action.completedDate);
        } else {
          // Try to parse into a valid date
          const tempDate = new Date(action.completedDate);
          if (!isNaN(tempDate.getTime())) {
            completedDate = tempDate.toISOString();
          } else {
            console.warn('Invalid completedDate value:', action.completedDate);
          }
        }
      } catch (err) {
        console.warn('Error processing completedDate:', err);
      }
    }
    
    // Create a new action as a plain object that's compatible with Supabase JSON
    const newAction = {
      id: crypto.randomUUID(),
      actionType: action.actionType || 'Note',
      createdAt: new Date().toISOString(),
      scheduledDate: scheduledDate,
      completedDate: completedDate,
      notes: action.notes
    };
    
    // Add the new action to the history
    actionHistory.push(newAction);
    
    // Prepare values for update
    const currentDate = new Date().toISOString();
    const taskType = action.actionType as TaskType;
    
    // Fix for nextFollowUpDate based on scheduledDate
    let nextFollowUpDate = null;
    if (scheduledDate) {
      nextFollowUpDate = scheduledDate;
    }
    
    console.log(`Updating lead ${leadId} with new action:`, newAction);
    console.log('Action history now contains:', actionHistory.length, 'items');
    
    // Update the lead with the new action in history
    const { data: updatedLead, error: updateError } = await supabase
      .from('leads')
      .update({
        action_history: actionHistory,
        last_contacted_at: currentDate,
        task_type: taskType,
        next_follow_up_date: nextFollowUpDate,
        email_envoye: false // Forcer à false pour désactiver le déclenchement automatique d'emails
      })
      .eq('id', leadId)
      .select('*')
      .single();
    
    if (updateError) {
      console.error('Error updating lead with new action:', updateError);
      throw updateError;
    }
    
    console.log('Successfully added action:', newAction);
    
    // Convert to LeadDetailed format
    const result = await getLead(leadId);
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
