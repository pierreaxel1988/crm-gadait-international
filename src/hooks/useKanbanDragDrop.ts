
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { LeadStatus } from '@/components/common/StatusBadge';
import { KanbanItem } from '@/components/kanban/KanbanCard';
import { ExtendedKanbanItem } from './useKanbanData';

export const useKanbanDragDrop = (
  setLoadedColumns: React.Dispatch<React.SetStateAction<{
    title: string;
    status: LeadStatus;
    items: ExtendedKanbanItem[];
  }[]>>
) => {
  const [isDragging, setIsDragging] = useState(false);

  // Handle dropping a lead to change its status
  const handleDrop = async (item: KanbanItem, newStatus: LeadStatus) => {
    // If the status hasn't changed, do nothing
    if (item.status === newStatus) return;
    
    try {
      // Update the lead status in Supabase
      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus })
        .eq('id', item.id);
        
      if (error) {
        console.error('Error updating lead status:', error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de mettre à jour le statut du lead."
        });
        return;
      }
      
      // Update the local state to reflect the change
      setLoadedColumns(prev => {
        // Create a deep copy of the columns
        const newColumns = [...prev];
        
        // Find the item to move
        const itemToMove = newColumns
          .flatMap(col => col.items)
          .find(i => i.id === item.id);
          
        if (!itemToMove) return prev;
        
        // Remove the item from its current column
        const sourceColumn = newColumns.find(col => col.status === item.status);
        if (sourceColumn) {
          sourceColumn.items = sourceColumn.items.filter(i => i.id !== item.id);
        }
        
        // Add the item to the target column
        const targetColumn = newColumns.find(col => col.status === newStatus);
        if (targetColumn) {
          // Update the item's status
          const updatedItem = { ...itemToMove, status: newStatus };
          targetColumn.items.push(updatedItem);
        }
        
        return newColumns;
      });
      
      toast({
        title: "Lead mis à jour",
        description: `Le statut du lead ${item.name} a été changé en ${newStatus}.`
      });
      
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour du lead."
      });
    }
  };

  return { isDragging, setIsDragging, handleDrop };
};
