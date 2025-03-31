
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Définir l'interface ActionData ici puisqu'il y a une erreur d'import
interface ActionData {
  id: string;
  leadId: string;
  leadName: string;
  leadEmail?: string;
  leadPhone?: string;
  actionType: string;
  scheduledDate: string;
  completedDate?: string | null;
  notes?: string;
  assignedToId?: string;
  assignedToName?: string;
  createdAt: string;
}

export const useActionsData = (filteredStatus: string | null = null, filteredType: string | null = null, filteredAgentId: string | null = null) => {
  const [actionsData, setActionsData] = useState<ActionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState<{id: string, name: string, email: string}[]>([]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch team members for better display
      const { data: teamData, error: teamError } = await supabase
        .from('team_members')
        .select('id, name, email');
      
      if (teamError) {
        console.error('Error fetching team members:', teamError);
        toast({
          variant: "destructive",
          title: "Error fetching team members",
          description: teamError.message
        });
        return;
      }

      if (teamData) {
        setTeamMembers(teamData);
      }

      // Build the query for leads with their action history
      let query = supabase
        .from('leads')
        .select(`
          id, 
          name,
          email,
          phone,
          created_at,
          assigned_to,
          action_history
        `);

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching leads with actions:', error);
        toast({
          variant: "destructive",
          title: "Error fetching data",
          description: error.message
        });
        setIsLoading(false);
        return;
      }

      if (!data || data.length === 0) {
        setActionsData([]);
        setIsLoading(false);
        return;
      }

      // Process the data to create a list of actions
      const processedActions: ActionData[] = [];
      
      for (const lead of data) {
        if (lead.action_history && Array.isArray(lead.action_history)) {
          for (const action of lead.action_history) {
            // S'assurer que action est un objet et pas une chaîne
            if (typeof action === 'object' && action !== null) {
              // Create an action with lead information
              const actionData: ActionData = {
                id: action.id as string,
                leadId: lead.id,
                leadName: lead.name,
                leadEmail: lead.email,
                leadPhone: lead.phone,
                actionType: action.actionType as string,
                scheduledDate: action.scheduledDate as string,
                completedDate: action.completedDate as string | null,
                notes: action.notes as string | undefined,
                assignedToId: lead.assigned_to,
                createdAt: action.createdAt as string || lead.created_at,
                assignedToName: ''
              };

              // Add the team member name if available
              const teamMember = teamMembers.find(tm => tm.id === lead.assigned_to);
              if (teamMember) {
                actionData.assignedToName = teamMember.name;
              }

              processedActions.push(actionData);
            }
          }
        }
      }

      // Apply filters if needed
      let filteredActions = processedActions;
      
      if (filteredStatus) {
        if (filteredStatus === 'completed') {
          filteredActions = filteredActions.filter(action => action.completedDate !== null);
        } else if (filteredStatus === 'pending') {
          filteredActions = filteredActions.filter(action => action.completedDate === null);
        }
      }
      
      if (filteredType) {
        filteredActions = filteredActions.filter(action => action.actionType === filteredType);
      }
      
      if (filteredAgentId) {
        filteredActions = filteredActions.filter(action => action.assignedToId === filteredAgentId);
      }

      // Sort actions by scheduledDate (most recent first)
      filteredActions.sort((a, b) => {
        if (!a.scheduledDate) return 1;
        if (!b.scheduledDate) return -1;
        return new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime();
      });

      setActionsData(filteredActions);
    } catch (err) {
      console.error('Unexpected error in useActionsData:', err);
      toast({
        variant: "destructive",
        title: "Error fetching actions",
        description: "An unexpected error occurred."
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filteredStatus, filteredType, filteredAgentId]);

  return { actionsData, isLoading, teamMembers, refreshData: fetchData };
};
