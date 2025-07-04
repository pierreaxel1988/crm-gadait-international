import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ActionHistory, ActionItem, ActionStatus, ExtendedTaskType } from '@/types/actionHistory';
import { AutomatedActionItem, AutomatedActionType, LeadEmailSequence } from '@/types/automatedEmail';
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
      
      console.log(`Extracted ${allActions.length} manual actions`);
      
      // Récupérer les séquences d'emails automatiques actives
      console.log("Fetching automated email sequences...");
      const { data: emailSequences, error: sequencesError } = await supabase
        .from('lead_email_sequences')
        .select(`
          id, lead_id, campaign_id, next_email_date, next_email_day, sequence_started_at,
          leads (
            id, name, phone, email, assigned_to, status, tags
          ),
          automated_email_campaigns (
            id, name
          )
        `)
        .eq('is_active', true)
        .not('next_email_date', 'is', null);

      if (sequencesError) {
        console.error('Error fetching email sequences:', sequencesError);
      } else {
        console.log(`Found ${emailSequences?.length || 0} active email sequences`);
        
        // Convertir les séquences en actions automatiques
        emailSequences?.forEach((sequence: any) => {
          const lead = sequence.leads;
          if (!lead) return;
          
          // Filtrer par assignation si commercial
          const assignedTeamMember = allTeamMembers?.find(tm => tm.id === lead.assigned_to);
          if (isCommercial && currentTeamMember && lead.assigned_to !== currentTeamMember.id) {
            return;
          }
          
          // Déterminer le statut de l'action automatique
          let status: ActionStatus = 'todo';
          if (sequence.next_email_date) {
            const scheduledDate = new Date(sequence.next_email_date);
            if (isPast(scheduledDate) && !isToday(scheduledDate)) {
              status = 'overdue';
            }
          }
          
          const actionType = `Email Auto J+${sequence.next_email_day}` as ExtendedTaskType;
          const actionId = `auto_${sequence.id}_${sequence.next_email_day}`;
          
          const automatedAction: ActionItem = {
            id: actionId,
            leadId: lead.id,
            leadName: lead.name || 'Lead sans nom',
            actionType,
            createdAt: sequence.sequence_started_at,
            scheduledDate: sequence.next_email_date,
            notes: `Email automatique programmé - ${sequence.automated_email_campaigns?.name || 'Campagne inconnue'}`,
            assignedToId: lead.assigned_to,
            assignedToName: assignedTeamMember?.name || 'Non assigné',
            status,
            phoneNumber: lead.phone,
            email: lead.email,
            leadStatus: lead.status,
            leadTags: lead.tags || [],
            // Métadonnées pour identifier les actions automatiques
            isAutomated: true,
            sequenceId: sequence.id,
            canStopSequence: true
          };
          
          allActions.push(automatedAction);
        });
      }
      
      console.log(`Total actions (manual + automated): ${allActions.length}`);

      // Tri spécialisé pour les actions avec priorité sur les dates d'aujourd'hui et en retard
      const sortedActions = allActions.sort((a, b) => {
        // Priorité 0: Actions terminées en dernier
        if (a.status === 'done' && b.status !== 'done') return 1;
        if (a.status !== 'done' && b.status === 'done') return -1;
        
        // Priorité 1: Actions en retard (status overdue) - les plus urgentes
        if (a.status === 'overdue' && b.status !== 'overdue') return -1;
        if (a.status !== 'overdue' && b.status === 'overdue') return 1;
        
        // Priorité 2: Actions d'aujourd'hui (status todo avec date aujourd'hui)
        const isATodayAction = a.status === 'todo' && a.scheduledDate && isToday(new Date(a.scheduledDate));
        const isBTodayAction = b.status === 'todo' && b.scheduledDate && isToday(new Date(b.scheduledDate));
        
        if (isATodayAction && !isBTodayAction) return -1;
        if (!isATodayAction && isBTodayAction) return 1;
        
        // Priorité 3: Pour les actions futures (todo/overdue), organiser par programmation
        if ((a.status === 'todo' || a.status === 'overdue') && (b.status === 'todo' || b.status === 'overdue')) {
          // Actions non programmées en premier
          const aNotScheduled = !a.scheduledDate;
          const bNotScheduled = !b.scheduledDate;
          
          if (aNotScheduled && !bNotScheduled) return -1;
          if (!aNotScheduled && bNotScheduled) return 1;
          
          // Si les deux sont programmées, trier par date (plus proche en premier)
          if (!aNotScheduled && !bNotScheduled) {
            const dateA = new Date(a.scheduledDate!);
            const dateB = new Date(b.scheduledDate!);
            return dateA.getTime() - dateB.getTime();
          }
          
          // Si les deux sont non programmées ou de même statut, utiliser le tri par priorité
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

  const stopEmailSequence = async (sequenceId: string, leadId: string) => {
    try {
      console.log(`Stopping email sequence ${sequenceId} for lead ${leadId}`);
      
      // Appeler l'edge function pour arrêter la séquence
      const { error } = await supabase.functions.invoke('automated-email-system', {
        body: {
          action: 'stop_sequence',
          leadId,
          reason: 'manual'
        }
      });
      
      if (error) {
        console.error('Error stopping sequence:', error);
        throw error;
      }
      
      // Mettre à jour l'état local en supprimant les actions automatiques de cette séquence
      setActions(prevActions => 
        prevActions.filter(action => action.sequenceId !== sequenceId)
      );
      
      toast({
        title: "Séquence arrêtée",
        description: "La séquence d'emails automatiques a été arrêtée."
      });
      
      // Récupérer à nouveau pour s'assurer que nous avons les dernières données
      fetchActions();
      
    } catch (error) {
      console.error('Error stopping email sequence:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'arrêter la séquence d'emails."
      });
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
    markActionComplete,
    stopEmailSequence
  };
};
