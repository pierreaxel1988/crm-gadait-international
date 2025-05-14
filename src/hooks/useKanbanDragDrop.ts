
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { LeadStatus } from '@/components/common/StatusBadge';
import { KanbanItem } from '@/components/kanban/KanbanCard';

export const useKanbanDragDrop = (
  setLoadedColumns: React.Dispatch<React.SetStateAction<any[]>>
) => {
  const [isDragging, setIsDragging] = useState(false);

  // Handle dropping a lead to change its status
  const handleDrop = async (item: KanbanItem, newStatus: LeadStatus) => {
    // If the status hasn't changed, do nothing
    if (item.status === newStatus) return;
    
    try {
      // First update the UI for immediate feedback
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
      
      // Get the current date for history
      const currentDate = new Date().toISOString();
      
      // Update the lead status in Supabase
      const { error } = await supabase
        .from('leads')
        .update({ 
          status: newStatus,
          last_contacted_at: currentDate,
        })
        .eq('id', item.id);
        
      if (error) {
        console.error('Error updating lead status in Supabase:', error);
        toast({
          variant: "default",
          title: "Synchronisation",
          description: "Le statut a été mis à jour localement, mais la synchronisation complète a échoué."
        });
        return;
      }
      
      toast({
        title: "Lead mis à jour",
        description: `Le statut du lead ${item.name} a été changé en ${newStatus}.`
      });
      
    } catch (error) {
      console.error('Error in handleDrop:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour du lead."
      });
    }
  };

  return { isDragging, setIsDragging, handleDrop };
};
