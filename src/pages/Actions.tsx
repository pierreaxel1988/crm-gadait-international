import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchActions } from '@/services/actionService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { formatPhoneNumber } from '@/utils/formatters';
import { ActionItem, ActionStatus } from '@/types/actionHistory';
import { TaskType } from '@/types/actionHistory';
import ActionsHeader from '@/components/actions/ActionsHeader';
import ActionsList from '@/components/actions/ActionsList';

const Actions = () => {
  const { user, isAdmin, isCommercial, teamMembers } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [statusFilter, setStatusFilter] = useState<ActionStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<TaskType | 'all'>('all');
  const [agentFilter, setAgentFilter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { 
    data: actions, 
    isLoading, 
    refetch 
  } = useQuery({
    queryKey: ['actions', statusFilter, typeFilter, agentFilter, searchTerm],
    queryFn: () => fetchActions(statusFilter, typeFilter, agentFilter, searchTerm),
  });

  useEffect(() => {
    if (!user) return;
    refetch();
  }, [user, refetch]);

  const handleMarkComplete = async (actionId: string, leadId: string) => {
    try {
      // Optimistically update the UI
      const updatedActions = actions?.map(action =>
        action.id === actionId ? { ...action, status: 'done' } : action
      );
      
      // TODO: Update the cache with the optimistic update
      // queryClient.setQueryData(['actions'], updatedActions);

      // Call the API to mark the action as complete
      // await markActionComplete(actionId);
      
      toast({
        title: "Action complétée",
        description: "L'action a été marquée comme terminée."
      });
      
      refetch();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour l'action."
      });
    }
  };
  
  const formatAction = (action: any): ActionItem => ({
    id: action.id,
    leadId: action.lead_id,
    leadName: action.lead_name,
    actionType: action.action_type as TaskType,
    createdAt: action.created_at,
    scheduledDate: action.scheduled_date,
    completedDate: action.completed_date,
    notes: action.notes,
    assignedToId: action.assigned_to_id,
    assignedToName: action.assigned_to_name,
    status: action.status,
    phoneNumber: formatPhoneNumber(action.phone_number),
    email: action.email,
  });

  const formattedActions = actions?.map(action => formatAction(action)) || [];

  return (
    <div className="container mx-auto py-6">
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
        handleRefresh={refetch}
      />
      
      <ActionsList 
        actions={formattedActions} 
        isLoading={isLoading}
        onMarkComplete={handleMarkComplete}
        isMobile={isMobile}
      />
    </div>
  );
};

export default Actions;
