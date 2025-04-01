
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ActionItem, ActionStatus } from '@/types/actionHistory';
import { isPast, isToday } from 'date-fns';
import { toast } from '@/hooks/use-toast';

export const useActionsData = (refreshTrigger: number = 0) => {
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("useActionsData useEffect triggered", { refreshTrigger });
    fetchActions();
  }, [refreshTrigger]);

  const fetchActions = async () => {
    setIsLoading(true);
    try {
      console.log("Fetching team members...");
      // Get team members for assignment information
      const { data: teamMembers, error: teamError } = await supabase
        .from('team_members')
        .select('id, name');
        
      if (teamError) {
        console.error('Error fetching team members:', teamError);
        throw teamError;
      }
      
      console.log("Team members:", teamMembers);

      // Get all leads with action history
      console.log("Fetching leads with action history...");
      const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select('id, name, phone, email, action_history, assigned_to, status');

      if (leadsError) {
        console.error('Error fetching leads:', leadsError);
        throw leadsError;
      }

      console.log(`Fetched ${leads?.length || 0} leads`);
      
      // Extract all actions from leads
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
          
          allActions.push({
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
          });
        });
      });
      
      console.log(`Extracted ${allActions.length} actions`);

      // Sort actions by status (overdue first, then todo, then done)
      // and then by scheduled date
      const sortedActions = allActions.sort((a, b) => {
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

      setActions(sortedActions);
    } catch (error) {
      console.error('Error fetching actions:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les actions."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const markActionComplete = async (actionId: string, leadId: string) => {
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
      
      // Ensure action_history is an array before trying to map it
      if (!Array.isArray(lead.action_history)) {
        throw new Error('Action history is not an array');
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
      
      // Update the local state
      setActions(prevActions => 
        prevActions.map(action => 
          action.id === actionId
            ? { ...action, status: 'done', completedDate: new Date().toISOString() }
            : action
        )
      );
      
      toast({
        title: "Action complétée",
        description: "L'action a été marquée comme terminée."
      });
      
      // Refetch to ensure we have the latest data
      fetchActions();
      
    } catch (error) {
      console.error('Error marking action as complete:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de marquer l'action comme terminée."
      });
    }
  };

  return { 
    actions, 
    isLoading, 
    refreshActions: fetchActions,
    markActionComplete
  };
};
