
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { LeadStatus } from '@/components/common/StatusBadge';
import { KanbanItem } from '@/components/kanban/KanbanCard';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useKanbanDragDrop = () => {
  const [isDragging, setIsDragging] = useState(false);
  const queryClient = useQueryClient();

  // Create a mutation for updating lead status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ item, newStatus }: { item: KanbanItem; newStatus: LeadStatus }) => {
      // Get the current date for history
      const currentDate = new Date().toISOString();
      
      // Update the lead status in Supabase
      const { data, error } = await supabase
        .from('leads')
        .update({ 
          status: newStatus,
          last_contacted_at: currentDate,
        })
        .eq('id', item.id)
        .select();
        
      if (error) {
        console.error('Error updating lead status in Supabase:', error);
        throw error;
      }
      
      return { item, newStatus, data };
    },
    onMutate: async ({ item, newStatus }) => {
      // Optimistically update the UI
      await queryClient.cancelQueries({ queryKey: ['pipelineData'] });

      // Get previous data
      const previousData = queryClient.getQueryData(['pipelineData']);

      // Optimistically update the data
      queryClient.setQueryData(['pipelineData'], (oldData: any) => {
        // Create a deep copy of the columns
        const newData = { ...oldData };
        const newColumns = [...newData.columns];
        
        // Find the item to move
        const sourceColumn = newColumns.find(col => col.status === item.status);
        if (sourceColumn) {
          sourceColumn.items = sourceColumn.items.filter(i => i.id !== item.id);
        }
        
        // Add the item to the target column
        const targetColumn = newColumns.find(col => col.status === newStatus);
        if (targetColumn) {
          // Update the item's status
          const updatedItem = { ...item, status: newStatus };
          targetColumn.items.push(updatedItem);
        }
        
        return { ...newData, columns: newColumns };
      });

      return { previousData };
    },
    onError: (err, { item }, context) => {
      // Roll back to the previous state if there's an error
      if (context?.previousData) {
        queryClient.setQueryData(['pipelineData'], context.previousData);
      }
      
      toast({
        variant: "destructive",
        title: "Erreur",
        description: `Échec de la mise à jour du statut du lead ${item.name}.`,
      });
    },
    onSuccess: ({ item, newStatus }) => {
      toast({
        title: "Lead mis à jour",
        description: `Le statut du lead ${item.name} a été changé en ${newStatus}.`
      });
    },
    onSettled: () => {
      // Refetch the pipeline data to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['pipelineData'] });
    }
  });

  // Handle dropping a lead to change its status
  const handleDrop = useCallback((item: KanbanItem, newStatus: LeadStatus) => {
    // If the status hasn't changed, do nothing
    if (item.status === newStatus) return;
    
    // Update the status using the mutation
    updateStatusMutation.mutate({ item, newStatus });
  }, [updateStatusMutation]);

  return { isDragging, setIsDragging, handleDrop };
};
