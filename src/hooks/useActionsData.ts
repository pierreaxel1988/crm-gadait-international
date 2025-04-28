import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { ActionItem, ActionStatus } from '@/types/actionHistory';
import { isPast, isToday } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { GUARANTEED_TEAM_MEMBERS } from '@/services/teamMemberService';

export const useActionsData = (refreshTrigger: number = 0) => {
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isCommercial } = useAuth();

  useEffect(() => {
    console.log("useActionsData useEffect triggered", { refreshTrigger });
    fetchActions();
  }, [refreshTrigger]);

  const fetchActions = async () => {
    setIsLoading(true);
    try {
      // First step: synchronize lead assignments to fix UUIDs
      try {
        console.log("Running lead reassignment for Jade, Jean Marc, and Sharon...");
        // Dynamically import to avoid circular dependencies
        const { reassignJadeLeads, reassignJeanMarcLeads, reassignSharonLeads } = await import('@/services/leadService');
        await reassignJadeLeads();
        await reassignJeanMarcLeads();
        await reassignSharonLeads();
        console.log("Lead reassignments completed successfully");
      } catch (error) {
        console.error('Error fixing lead assignments:', error);
      }
      
      // Récupérer les membres d'équipe pour l'information d'assignation
      const { data: teamMembers, error: teamError } = await supabase
        .from('team_members')
        .select('id, name, email');
        
      if (teamError) {
        console.error('Error fetching team members:', teamError);
        throw teamError;
      }
      
      console.log("Team members:", teamMembers);

      // Ajouter les membres garantis qui ne seraient pas dans la base de données
      const allTeamMembers = [...(teamMembers || [])];
      const teamMemberIds = new Set(allTeamMembers.map(tm => tm.id));
      
      GUARANTEED_TEAM_MEMBERS.forEach(member => {
        if (!teamMemberIds.has(member.id)) {
          allTeamMembers.push({
            id: member.id,
            name: member.name,
            email: member.email
          });
          console.log(`Added guaranteed member to team list: ${member.name} (${member.id})`);
        }
      });

      // Trouver le membre d'équipe actuel si l'utilisateur est un commercial
      const currentTeamMember = isCommercial && user ? 
        allTeamMembers?.find(tm => tm.email === user.email) : null;

      // Récupérer tous les leads avec historique d'actions
      console.log("Fetching leads with action history...");
      let query = supabase.from('leads').select('id, name, phone, email, action_history, assigned_to, status');
      
      // Si l'utilisateur est un commercial, ne récupérer que ses leads assignés
      if (isCommercial && currentTeamMember) {
        console.log(`Filtering leads for commercial: ${currentTeamMember.name} (${currentTeamMember.id})`);
        query = query.eq('assigned_to', currentTeamMember.id);
      }

      const { data: leads, error: leadsError } = await query;

      if (leadsError) {
        console.error('Error fetching leads:', leadsError);
        throw leadsError;
      }

      console.log(`Fetched ${leads?.length || 0} leads`);
      
      // Extraire toutes les actions des leads
      const allActions: ActionItem[] = [];
      
      leads?.forEach(lead => {
        if (!lead.action_history || !Array.isArray(lead.action_history)) return;
        
        lead.action_history.forEach((action: any) => {
          if (!action || !action.id) return;
          
          // Déterminer le statut de l'action
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
          
          // Trouver le nom du membre d'équipe assigné
          const assignedTeamMember = allTeamMembers?.find(tm => tm.id === lead.assigned_to);
          
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

      // Trier les actions par statut (en retard d'abord, puis à faire, puis terminées)
      // puis par date prévue
      const sortedActions = allActions.sort((a, b) => {
        // Priorité: 1. overdue, 2. todo, 3. done
        const statusPriority = { 'overdue': 0, 'todo': 1, 'done': 2 };
        if (statusPriority[a.status] !== statusPriority[b.status]) {
          return statusPriority[a.status] - statusPriority[b.status];
        }
        
        // Tri secondaire par date
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
      // D'abord récupérer le lead pour mettre à jour son historique d'actions
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
      
      // S'assurer que action_history est un tableau avant d'essayer de le mapper
      if (!Array.isArray(lead.action_history)) {
        throw new Error('Action history is not an array');
      }
      
      // Mettre à jour l'action dans l'historique d'actions
      const updatedActionHistory = lead.action_history.map((action: any) => {
        if (action.id === actionId) {
          return {
            ...action,
            completedDate: new Date().toISOString()
          };
        }
        return action;
      });
      
      // Mettre à jour le lead avec le nouvel historique d'actions
      const { error: updateError } = await supabase
        .from('leads')
        .update({ action_history: updatedActionHistory })
        .eq('id', leadId);
        
      if (updateError) {
        console.error('Error updating action:', updateError);
        throw updateError;
      }
      
      // Mettre à jour l'état local
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
      
      // Récupérer à nouveau pour s'assurer que nous avons les dernières données
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
