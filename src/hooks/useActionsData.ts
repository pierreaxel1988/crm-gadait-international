import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ActionHistory, ActionItem, ActionStatus } from '@/types/actionHistory';
import { isPast, isToday } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { synchronizeLeadAssignments, GUARANTEED_TEAM_MEMBERS } from '@/services/teamMemberService';
import { sortLeadsByPriority } from '@/components/pipeline/mobile/utils/leadSortUtils';

export const useActionsData = (refreshTrigger: number = 0) => {
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isCommercial } = useAuth();

  useEffect(() => {
    console.log("useActionsData useEffect triggered", { refreshTrigger });
    fetchActions();
  }, [refreshTrigger]);

  const fetchActions = useCallback(async () => {
    setIsLoading(true);
    try {
      // Première étape : synchroniser les assignations de leads pour corriger les UUIDs
      await synchronizeLeadAssignments();
      
      console.log("Fetching team members...");
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
      let query = supabase.from('leads').select('id, name, phone, email, action_history, assigned_to, status, tags');
      
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
            email: lead.email,
            // Ajouter les données du lead pour le tri par priorité
            leadStatus: lead.status,
            leadTags: lead.tags || []
          });
        });
      });
      
      console.log(`Extracted ${allActions.length} actions`);

      // Tri spécialisé pour les actions avec priorité sur les dates d'aujourd'hui et en retard
      const sortedActions = allActions.sort((a, b) => {
        // Priorité 1: Actions d'aujourd'hui (status todo avec date aujourd'hui)
        const isATodayAction = a.status === 'todo' && a.scheduledDate && isToday(new Date(a.scheduledDate));
        const isBTodayAction = b.status === 'todo' && b.scheduledDate && isToday(new Date(b.scheduledDate));
        
        if (isATodayAction && !isBTodayAction) return -1;
        if (!isATodayAction && isBTodayAction) return 1;
        
        // Priorité 2: Actions en retard (status overdue)
        if (a.status === 'overdue' && b.status !== 'overdue') return -1;
        if (a.status !== 'overdue' && b.status === 'overdue') return 1;
        
        // Si même catégorie de date (aujourd'hui ou en retard), utiliser le tri par priorité des leads
        if ((isATodayAction && isBTodayAction) || (a.status === 'overdue' && b.status === 'overdue')) {
          // Créer des objets temporaires avec les propriétés nécessaires pour le tri
          const actionAWithPriority = {
            ...a,
            status: a.leadStatus,
            tags: a.leadTags,
            nextFollowUpDate: a.scheduledDate,
            createdAt: a.createdAt
          };
          
          const actionBWithPriority = {
            ...b,
            status: b.leadStatus,
            tags: b.leadTags,
            nextFollowUpDate: b.scheduledDate,
            createdAt: b.createdAt
          };
          
          // Utiliser la fonction de tri par priorité
          const sorted = sortLeadsByPriority([actionAWithPriority, actionBWithPriority], 'priority');
          return sorted[0].id === a.id ? -1 : 1;
        }
        
        // Pour les autres actions, tri par priorité normal
        const actionsWithPriority = [a, b].map(action => ({
          ...action,
          status: action.leadStatus,
          tags: action.leadTags,
          nextFollowUpDate: action.scheduledDate,
          createdAt: action.createdAt
        }));
        
        const sortedByPriority = sortLeadsByPriority(actionsWithPriority, 'priority');
        return sortedByPriority[0].id === a.id ? -1 : 1;
      });

      setActions(sortedActions);
      
      // Cache actions for calendar sync
      localStorage.setItem('cachedActions', JSON.stringify(sortedActions));
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
    
    return actions;
  }, [isCommercial, user]);

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
      
      // Update cached actions for calendar sync
      const cachedActions = JSON.parse(localStorage.getItem('cachedActions') || '[]');
      const updatedCachedActions = cachedActions.map((action: ActionItem) => {
        if (action.id === actionId) {
          return { ...action, status: 'done', completedDate: new Date().toISOString() };
        }
        return action;
      });
      localStorage.setItem('cachedActions', JSON.stringify(updatedCachedActions));
      
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
