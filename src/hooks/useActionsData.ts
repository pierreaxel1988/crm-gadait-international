
import { useState, useEffect, useCallback } from 'react';
import { ActionHistory } from '@/types/actionHistory';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useActionsData = (refreshTrigger = 0, filters: any = {}) => {
  const [actions, setActions] = useState<ActionHistory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAdmin } = useAuth();

  // Function to update the status of an action to completed
  const markActionComplete = async (actionId: string) => {
    try {
      const { error } = await supabase
        .from('action_history')
        .update({ completed: true })
        .eq('id', actionId);
      
      if (error) throw error;
      
      // Update the local state
      setActions(prevActions => 
        prevActions.map(action => 
          action.id === actionId 
            ? { ...action, completed: true } 
            : action
        )
      );
      
      return true;
    } catch (error) {
      console.error('Error marking action complete:', error);
      return false;
    }
  };

  // Function to fetch actions data from Supabase
  const fetchActions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('action_history')
        .select(`
          *,
          lead:lead_id (
            id,
            name,
            email,
            phone,
            status,
            tags,
            currency,
            budget,
            budgetMin,
            desiredLocation,
            propertyType,
            assignedTo,
            source
          ),
          assigned_users:action_assigned_users (
            user_id,
            user:user_id (
              id,
              email,
              full_name
            )
          )
        `)
        .order('scheduledDate', { ascending: true });
      
      // Apply filters if provided
      if (filters) {
        // Filter by type
        if (filters.type && filters.type.length > 0) {
          query = query.in('type', filters.type);
        }
        
        // Filter by status
        if (filters.status === 'completed') {
          query = query.eq('completed', true);
        } else if (filters.status === 'pending') {
          query = query.eq('completed', false);
        }
        
        // Filter by date range
        if (filters.dateRange?.from) {
          query = query.gte('scheduledDate', filters.dateRange.from);
        }
        if (filters.dateRange?.to) {
          query = query.lte('scheduledDate', filters.dateRange.to);
        }
        
        // Filter by agent (assigned user)
        if (filters.agent && filters.agent.length > 0) {
          query = query.in('assignedTo', filters.agent);
        }
        
        // Filter by lead status
        if (filters.leadStatus && filters.leadStatus.length > 0) {
          // This is a bit tricky as we need to filter on the nested lead object
          // We might need to handle this post-fetch
        }
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Process the data to include the assigned users information
      let processedActions = data?.map(action => {
        // Extract assigned users information
        const assignedUsers = action.assigned_users?.map((au: any) => ({
          id: au.user?.id,
          email: au.user?.email,
          fullName: au.user?.full_name
        })) || [];

        // Return the action with assigned users
        return {
          ...action,
          assignedUsers,
          // Remove the raw assigned_users data to clean up the object
          assigned_users: undefined
        };
      }) || [];

      // If not admin, filter actions to only show those assigned to the current user
      if (!isAdmin && user) {
        processedActions = processedActions.filter(action => {
          if (!action.assignedTo) return false;
          
          // Check if assignedTo is an array
          if (Array.isArray(action.assignedTo)) {
            return action.assignedTo.some(id => id === user.id);
          }
          
          // If it's a string, check direct equality
          return action.assignedTo === user.id;
        });
      }

      // Apply post-fetch filter for lead status if needed
      if (filters.leadStatus && filters.leadStatus.length > 0) {
        processedActions = processedActions.filter(action => 
          action.lead && filters.leadStatus.includes(action.lead.status)
        );
      }

      setActions(processedActions);
    } catch (err) {
      console.error('Error fetching actions:', err);
      setError('Failed to fetch actions');
    } finally {
      setIsLoading(false);
    }
  }, [filters, user, isAdmin]);

  useEffect(() => {
    fetchActions();
  }, [fetchActions, refreshTrigger]);

  return { actions, isLoading, error, markActionComplete, refreshActions: fetchActions };
};
