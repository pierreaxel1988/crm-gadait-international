
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
        // Check if we're dealing with an object (potential special case)
        if (typeof action.scheduledDate === 'object') {
          // Make sure it's not null before checking properties
          if (action.scheduledDate !== null) {
            // Using type assertion to tell TypeScript we checked it's not null
            const actionDate = action.scheduledDate as object;
            // Check if _type property exists safely
            if ('_type' in actionDate && (actionDate as any)._type === 'undefined') {
              console.warn('Invalid scheduledDate object detected:', action.scheduledDate);
            }
          }
        } else {
          // It's not an object, so try to parse as date string
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
        // Check if we're dealing with an object (potential special case)
        if (typeof action.completedDate === 'object') {
          // Make sure it's not null before checking properties
          if (action.completedDate !== null) {
            // Using type assertion to tell TypeScript we checked it's not null
            const actionDate = action.completedDate as object;
            // Check if _type property exists safely
            if ('_type' in actionDate && (actionDate as any)._type === 'undefined') {
              console.warn('Invalid completedDate object detected:', action.completedDate);
            }
          }
        } else {
          // It's not an object, so try to parse as date string
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
      notes: action.notes,
      leadId: leadId // Ajout explicite de l'ID du lead à l'action pour assurer le lien
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
    // Important: Set email_envoye to false to prevent automatic email triggering
    const { data: updatedLead, error: updateError } = await supabase
      .from('leads')
      .update({
        action_history: actionHistory,
        last_contacted_at: currentDate,
        task_type: taskType,
        next_follow_up_date: nextFollowUpDate,
        email_envoye: false // Désactiver explicitement l'envoi d'email automatique
      })
      .eq('id', leadId)
      .select('*');
    
    if (updateError) {
      console.error('Error updating lead with new action:', updateError);
      throw updateError;
    }
    
    if (!updatedLead || updatedLead.length === 0) {
      throw new Error('Lead not found after update');
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

// Nouvelle fonction pour synchroniser les actions existantes avec les leads
export const syncExistingActionsWithLeads = async (leadId?: string): Promise<boolean> => {
  try {
    let query = supabase.from('leads').select('id, action_history');
    
    // Si un ID de lead spécifique est fourni, on ne synchronise que ce lead
    if (leadId) {
      query = query.eq('id', leadId);
    }
    
    const { data: leads, error } = await query;
    
    if (error) {
      console.error('Error fetching leads for sync:', error);
      throw error;
    }
    
    if (!leads || leads.length === 0) {
      console.log('No leads found to sync actions');
      return false;
    }
    
    console.log(`Starting sync for ${leads.length} leads`);
    
    // Pour chaque lead, parcourir son historique d'actions et ajouter l'ID du lead si nécessaire
    for (const lead of leads) {
      if (!lead.action_history || !Array.isArray(lead.action_history) || lead.action_history.length === 0) {
        continue; // Passer au lead suivant s'il n'a pas d'historique d'actions
      }
      
      let needsUpdate = false;
      const updatedActionHistory = lead.action_history.map((action: any) => {
        if (!action.leadId) {
          needsUpdate = true;
          return { ...action, leadId: lead.id };
        }
        return action;
      });
      
      if (needsUpdate) {
        const { error: updateError } = await supabase
          .from('leads')
          .update({ 
            action_history: updatedActionHistory,
            email_envoye: false // S'assurer que l'email automatique ne soit pas déclenché
          })
          .eq('id', lead.id);
        
        if (updateError) {
          console.error(`Error updating actions for lead ${lead.id}:`, updateError);
        } else {
          console.log(`Successfully synced ${updatedActionHistory.length} actions for lead ${lead.id}`);
        }
      }
    }
    
    return true;
  } catch (err) {
    console.error('Error synchronizing actions with leads:', err);
    return false;
  }
};
