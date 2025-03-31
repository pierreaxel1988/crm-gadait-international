
import React, { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import ActionsHeader from '@/components/actions/ActionsHeader';
import ActionsList from '@/components/actions/ActionsList';
import { supabase } from '@/integrations/supabase/client';
import { LeadDetailed } from '@/types/lead';
import { TaskType } from '@/components/kanban/KanbanCard';
import { toast } from '@/hooks/use-toast';
import { ActionStatus, ActionItem } from '@/types/actionHistory';
import Navbar from '@/components/layout/Navbar';
import SubNavigation from '@/components/layout/SubNavigation';

const ActionsPage = () => {
  const isMobile = useIsMobile();
  const [isLoading, setIsLoading] = useState(true);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [filteredActions, setFilteredActions] = useState<ActionItem[]>([]);
  const [teamMembers, setTeamMembers] = useState<{ id: string; name: string }[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [statusFilter, setStatusFilter] = useState<ActionStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<TaskType | 'all'>('all');
  const [agentFilter, setAgentFilter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const { data, error } = await supabase
          .from('team_members')
          .select('id, name, is_admin');
          
        if (error) throw error;
        
        if (data) {
          setTeamMembers(data.map(member => ({ id: member.id, name: member.name })));
          
          const { data: userData, error: userError } = await supabase.auth.getUser();
          if (!userError && userData && userData.user) {
            const currentUserEmail = userData.user.email;
            const { data: teamMemberData, error: teamMemberError } = await supabase
              .from('team_members')
              .select('is_admin')
              .eq('email', currentUserEmail)
              .single();
              
            if (!teamMemberError && teamMemberData) {
              setIsAdmin(teamMemberData.is_admin || false);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching team members:', error);
      }
    };
    
    fetchTeamMembers();
  }, []);

  useEffect(() => {
    const fetchActions = async () => {
      setIsLoading(true);
      try {
        console.log("Fetching actions...");
        const { data: userData } = await supabase.auth.getUser();
        const currentUserEmail = userData?.user?.email;
        
        const { data: teamMemberData } = await supabase
          .from('team_members')
          .select('id, is_admin')
          .eq('email', currentUserEmail)
          .single();
        
        const isUserAdmin = teamMemberData?.is_admin || false;
        const currentUserId = teamMemberData?.id;
        
        console.log("User admin status:", isUserAdmin);
        console.log("User ID:", currentUserId);
        
        let query = supabase
          .from('leads')
          .select('id, name, action_history, assigned_to, status, phone, email')
          .order('created_at', { ascending: false });
        
        // If not admin, only show leads assigned to the current user
        if (!isUserAdmin && currentUserId) {
          query = query.eq('assigned_to', currentUserId);
        }
        
        const { data: leads, error } = await query;
        
        if (error) {
          console.error("Error fetching leads:", error);
          throw error;
        }
        
        console.log("Fetched leads:", leads?.length);
        
        const { data: members } = await supabase
          .from('team_members')
          .select('id, name');
        
        const memberMap = new Map();
        members?.forEach(member => memberMap.set(member.id, member.name));
        
        let allActions: ActionItem[] = [];
        
        leads?.forEach((lead: any) => {
          console.log(`Processing lead ${lead.id} (${lead.name}), action history:`, lead.action_history);
          
          const leadActions = lead.action_history || [];
          
          if (Array.isArray(leadActions) && leadActions.length > 0) {
            leadActions.forEach((action: any) => {
              // Skip if the action doesn't have required fields
              if (!action || !action.id || !action.actionType) {
                console.log("Skipping invalid action:", action);
                return;
              }
              
              let status: ActionStatus = 'todo';
              
              if (action.completedDate) {
                status = 'done';
              } else if (action.scheduledDate) {
                const scheduledDate = new Date(action.scheduledDate);
                const now = new Date();
                
                if (scheduledDate < now && !action.completedDate) {
                  status = 'overdue';
                } else {
                  status = 'todo';
                }
              }
              
              // Add the action to our list
              allActions.push({
                id: action.id,
                leadId: lead.id,
                leadName: lead.name,
                actionType: action.actionType as TaskType,
                createdAt: action.createdAt,
                scheduledDate: action.scheduledDate,
                completedDate: action.completedDate,
                notes: action.notes,
                assignedToId: lead.assigned_to,
                assignedToName: memberMap.get(lead.assigned_to) || 'Non assigné',
                status,
                phoneNumber: lead.phone,
                email: lead.email
              });
            });
          } else {
            console.log(`No actions found for lead ${lead.id} (${lead.name})`);
          }
        });
        
        console.log(`Total actions found: ${allActions.length}`);
        
        // Sort actions by priority (overdue first, then todo by date, then done)
        allActions.sort((a, b) => {
          if (a.status !== b.status) {
            if (a.status === 'overdue') return -1;
            if (b.status === 'overdue') return 1;
            if (a.status === 'todo') return -1;
            if (b.status === 'todo') return 1;
          }
          
          if ((a.status === 'todo' || a.status === 'overdue') && 
              (b.status === 'todo' || b.status === 'overdue')) {
            const aDate = a.scheduledDate ? new Date(a.scheduledDate) : new Date(0);
            const bDate = b.scheduledDate ? new Date(b.scheduledDate) : new Date(0);
            return aDate.getTime() - bDate.getTime();
          }
          
          if (a.status === 'done' && b.status === 'done') {
            const aDate = a.completedDate ? new Date(a.completedDate) : new Date(0);
            const bDate = b.completedDate ? new Date(b.completedDate) : new Date(0);
            return bDate.getTime() - aDate.getTime();
          }
          
          return 0;
        });
        
        setActions(allActions);
        setFilteredActions(allActions);
        setIsAdmin(isUserAdmin);
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
    
    fetchActions();
  }, [refreshTrigger]);

  useEffect(() => {
    let filtered = [...actions];
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(action => action.status === statusFilter);
    }
    
    if (typeFilter !== 'all') {
      filtered = filtered.filter(action => action.actionType === typeFilter);
    }
    
    if (isAdmin && agentFilter) {
      filtered = filtered.filter(action => action.assignedToId === agentFilter);
    }
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(action => 
        action.leadName.toLowerCase().includes(searchLower) || 
        (action.notes && action.notes.toLowerCase().includes(searchLower))
      );
    }
    
    console.log(`Filtered actions: ${filtered.length}`);
    setFilteredActions(filtered);
  }, [actions, statusFilter, typeFilter, agentFilter, searchTerm, isAdmin]);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleMarkComplete = async (actionId: string, leadId: string) => {
    try {
      console.log(`Marking action ${actionId} as complete for lead ${leadId}`);
      const { data: lead, error: leadError } = await supabase
        .from('leads')
        .select('action_history')
        .eq('id', leadId)
        .single();
      
      if (leadError) {
        console.error("Error fetching lead:", leadError);
        throw leadError;
      }
      
      if (lead && lead.action_history) {
        const actionHistory = lead.action_history as any[];
        const actionIndex = actionHistory.findIndex((a: any) => a.id === actionId);
        
        if (actionIndex !== -1) {
          console.log(`Found action at index ${actionIndex}:`, actionHistory[actionIndex]);
          actionHistory[actionIndex].completedDate = new Date().toISOString();
          
          const { error: updateError } = await supabase
            .from('leads')
            .update({ 
              action_history: actionHistory,
              last_contacted_at: new Date().toISOString()
            })
            .eq('id', leadId);
          
          if (updateError) {
            console.error("Error updating action:", updateError);
            throw updateError;
          }
          
          console.log("Action marked as complete successfully");
          handleRefresh();
          
          window.dispatchEvent(new CustomEvent('action-completed'));
          
          toast({
            title: "Action complétée",
            description: "L'action a été marquée comme complétée."
          });
        } else {
          console.error(`Action ${actionId} not found in history`);
        }
      }
    } catch (error) {
      console.error('Error marking action as complete:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour l'action."
      });
    }
  };

  return (
    <>
      <Navbar />
      <SubNavigation />
      <div className="p-3 md:p-6 bg-white min-h-screen">
        <ActionsHeader
          isAdmin={isAdmin}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          agentFilter={agentFilter}
          setAgentFilter={setAgentFilter}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          teamMembers={teamMembers}
          handleRefresh={handleRefresh}
        />
        
        <ActionsList
          actions={filteredActions}
          isLoading={isLoading}
          onMarkComplete={handleMarkComplete}
          isMobile={isMobile}
        />
      </div>
    </>
  );
};

export default ActionsPage;
