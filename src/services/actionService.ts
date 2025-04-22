
import { supabase } from '@/integrations/supabase/client';
import { ActionItem, ActionStatus, TaskType } from '@/types/actionHistory';
import { isPast, isToday } from 'date-fns';

/**
 * Fetch actions from the database with optional filters
 */
export const fetchActions = async (
  statusFilter: ActionStatus | 'all' = 'all',
  typeFilter: TaskType | 'all' = 'all',
  agentFilter: string | null = null,
  searchTerm: string = ''
): Promise<ActionItem[]> => {
  try {
    // Get team members for assignment information
    const { data: teamMembers, error: teamError } = await supabase
      .from('team_members')
      .select('id, name, email');
      
    if (teamError) {
      console.error('Error fetching team members:', teamError);
      throw teamError;
    }
    
    // Get all leads with action history
    let query = supabase
      .from('leads')
      .select('id, name, phone, email, action_history, assigned_to, status');
    
    // Apply agent filter if provided
    if (agentFilter) {
      query = query.eq('assigned_to', agentFilter);
    }
    
    // Apply search term if provided
    if (searchTerm) {
      query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`);
    }

    const { data: leads, error: leadsError } = await query;

    if (leadsError) {
      console.error('Error fetching leads:', leadsError);
      throw leadsError;
    }
    
    // Extract and process actions from leads
    const allActions: ActionItem[] = [];
    
    leads?.forEach(lead => {
      if (!lead.action_history || !Array.isArray(lead.action_history)) return;
      
      lead.action_history.forEach((action: any) => {
        if (!action || !action.id) return;
        
        // Determine action status
        let status: ActionStatus;
        if (action.completedDate) {
          status = 'done';
        } else if (action.scheduledDate) {
          const scheduledDate = new Date(action.scheduledDate);
          if (isPast(scheduledDate) && !isToday(scheduledDate)) {
            status = 'overdue';
          } else {
            status = 'todo';
          }
        } else {
          status = 'todo';
        }
        
        // Find assigned team member name
        const assignedTeamMember = teamMembers?.find(tm => tm.id === lead.assigned_to);
        
        // Create action item
        const actionItem: ActionItem = {
          id: action.id,
          leadId: lead.id,
          leadName: lead.name || 'Lead sans nom',
          actionType: action.actionType,
          createdAt: action.createdAt,
          scheduledDate: action.scheduledDate,
          completedDate: action.completedDate,
          notes: action.notes,
          assignedToId: lead.assigned_to,
          assignedToName: assignedTeamMember?.name || 'Non assigné',
          status,
          phoneNumber: lead.phone,
          email: lead.email
        };
        
        // Apply status filter
        if (statusFilter !== 'all' && actionItem.status !== statusFilter) {
          return;
        }
        
        // Apply type filter
        if (typeFilter !== 'all' && actionItem.actionType !== typeFilter) {
          return;
        }
        
        allActions.push(actionItem);
      });
    });
    
    // Sort actions by status and date
    return allActions.sort((a, b) => {
      // Priority: 1. overdue, 2. todo, 3. done
      const statusPriority = { 'overdue': 0, 'todo': 1, 'done': 2 };
      if (statusPriority[a.status] !== statusPriority[b.status]) {
        return statusPriority[a.status] - statusPriority[b.status];
      }
      
      // Secondary sort by date
      const dateA = a.status === 'done' 
        ? (a.completedDate ? new Date(a.completedDate) : new Date())
        : (a.scheduledDate ? new Date(a.scheduledDate) : new Date());
        
      const dateB = b.status === 'done'
        ? (b.completedDate ? new Date(b.completedDate) : new Date())
        : (b.scheduledDate ? new Date(b.scheduledDate) : new Date());
        
      return dateA.getTime() - dateB.getTime();
    });
  } catch (error) {
    console.error('Error in fetchActions:', error);
    throw error;
  }
};

/**
 * Mark an action as complete
 */
export const markActionComplete = async (actionId: string, leadId: string): Promise<void> => {
  try {
    // First get the lead to update its action history
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('action_history')
      .eq('id', leadId)
      .single();
      
    if (leadError) {
      console.error('Error fetching lead for action completion:', leadError);
      throw leadError;
    }
    
    if (!lead || !lead.action_history) {
      throw new Error('Lead or action history not found');
    }
    
    // Update the action in the action history
    const updatedActionHistory = lead.action_history.map((action: any) => {
      if (action.id === actionId) {
        return {
          ...action,
          completedDate: new Date().toISOString()
        };
      }
      return action;
    });
    
    // Update the lead with the new action history
    const { error: updateError } = await supabase
      .from('leads')
      .update({ action_history: updatedActionHistory })
      .eq('id', leadId);
      
    if (updateError) {
      console.error('Error updating action:', updateError);
      throw updateError;
    }
  } catch (error) {
    console.error('Error marking action as complete:', error);
    throw error;
  }
};
