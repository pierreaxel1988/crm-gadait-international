
import { LeadDetailed } from "@/types/lead";
import { ActionHistory } from "@/types/actionHistory";
import { getLead, updateLead } from "./leadCore";
import { TaskType } from "@/components/kanban/KanbanCard";

export const addActionToLead = (leadId: string, action: Omit<ActionHistory, 'id' | 'createdAt'>): LeadDetailed | undefined => {
  const lead = getLead(leadId);
  
  if (lead) {
    // Create a new action with ID and createdAt
    const newAction: ActionHistory = {
      id: Date.now().toString(),
      ...action,
      createdAt: new Date().toISOString()
    };
    
    // Update the lead with the new action in history
    const updatedLead: LeadDetailed = {
      ...lead,
      taskType: action.actionType as TaskType, // Cast to TaskType here
      nextFollowUpDate: action.scheduledDate,
      actionHistory: [...(lead.actionHistory || []), newAction]
    };
    
    // Save the updated lead
    return updateLead(updatedLead);
  }
  
  return undefined;
};
