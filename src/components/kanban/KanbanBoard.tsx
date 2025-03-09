
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import KanbanColumn from './KanbanColumn';
import { KanbanItem } from './KanbanCard';
import { LeadStatus } from '@/components/common/StatusBadge';
import { useIsMobile } from '@/hooks/use-mobile';
import { FilterOptions } from '../pipeline/PipelineFilters';
import { PropertyType, PurchaseTimeframe } from '@/types/lead';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Extend KanbanItem with the additional properties needed for filtering
interface ExtendedKanbanItem extends KanbanItem {
  budget?: string;
  desiredLocation?: string;
  purchaseTimeframe?: PurchaseTimeframe;
  propertyType?: PropertyType;
}

interface KanbanBoardProps {
  columns: {
    title: string;
    status: LeadStatus;
    items: ExtendedKanbanItem[];
  }[];
  className?: string;
  filters?: FilterOptions;
  refreshTrigger?: number;
}

const KanbanBoard = ({ columns, className, filters, refreshTrigger = 0 }: KanbanBoardProps) => {
  const isMobile = useIsMobile();
  const [loadedColumns, setLoadedColumns] = useState(columns);
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setIsLoading(true);
        const { data: teamMembers, error: teamError } = await supabase
          .from('team_members')
          .select('id, email, name');
          
        if (teamError) {
          console.error('Error fetching team members:', teamError);
          toast({
            variant: "destructive",
            title: "Erreur de chargement",
            description: "Impossible de charger les membres de l'équipe."
          });
          return;
        }
          
        const { data: leads, error: leadsError } = await supabase
          .from('leads')
          .select('*');
          
        if (leadsError) {
          console.error('Error fetching leads:', leadsError);
          toast({
            variant: "destructive",
            title: "Erreur de chargement",
            description: "Impossible de charger les leads."
          });
          return;
        }
        
        // Map Supabase data to KanbanItem format
        const mappedLeads = leads.map(lead => {
          const assignedTeamMember = teamMembers.find(tm => tm.id === lead.assigned_to);
          
          return {
            id: lead.id,
            name: lead.name,
            email: lead.email || '',
            phone: lead.phone,
            status: lead.status as LeadStatus,
            tags: lead.tags || [],
            assignedTo: assignedTeamMember ? assignedTeamMember.name : undefined,
            dueDate: lead.next_follow_up_date,
            pipelineType: 'purchase',
            taskType: lead.task_type,
            budget: lead.budget,
            desiredLocation: lead.desired_location,
            purchaseTimeframe: lead.purchase_timeframe as PurchaseTimeframe,
            propertyType: lead.property_type as PropertyType
          };
        });
        
        // Group leads by status
        const updatedColumns = columns.map(column => ({
          ...column,
          items: mappedLeads.filter(lead => lead.status === column.status) as ExtendedKanbanItem[]
        }));
        
        setLoadedColumns(updatedColumns);
      } catch (error) {
        console.error('Unexpected error:', error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Une erreur est survenue lors du chargement des données."
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeads();
  }, [refreshTrigger]);

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
  
  // Apply filters to the items in each column
  const filteredColumns = loadedColumns.map(column => {
    let filteredItems = column.items;
    
    if (filters) {
      // Filter by tags if any are selected
      if (filters.tags.length > 0) {
        filteredItems = filteredItems.filter(item => 
          item.tags.some(tag => filters.tags.includes(tag))
        );
      }
      
      // Filter by assignedTo
      if (filters.assignedTo) {
        filteredItems = filteredItems.filter(item => 
          item.assignedTo === filters.assignedTo
        );
      }
      
      // Apply budget filters if provided
      if (filters.minBudget || filters.maxBudget) {
        filteredItems = filteredItems.filter(item => {
          if (!item.budget) return false;
          
          const budget = parseInt(item.budget.replace(/[^\d]/g, ''));
          const min = filters.minBudget ? parseInt(filters.minBudget) : 0;
          const max = filters.maxBudget ? parseInt(filters.maxBudget) : Infinity;
          
          return budget >= min && budget <= max;
        });
      }
      
      // Filter by location
      if (filters.location) {
        filteredItems = filteredItems.filter(item => 
          item.desiredLocation?.toLowerCase().includes(filters.location.toLowerCase())
        );
      }
      
      // Filter by purchase timeframe
      if (filters.purchaseTimeframe) {
        filteredItems = filteredItems.filter(item => 
          item.purchaseTimeframe === filters.purchaseTimeframe
        );
      }
      
      // Filter by property type
      if (filters.propertyType) {
        filteredItems = filteredItems.filter(item => 
          item.propertyType === filters.propertyType
        );
      }
    }
    
    return {
      ...column,
      items: filteredItems
    };
  });
  
  return (
    <div className={cn('luxury-card p-0 overflow-hidden', className)}>
      <div className={cn(
        "flex overflow-x-auto",
        isMobile ? "h-[calc(100vh-130px)] pb-16" : "h-[calc(100vh-170px)]"
      )}>
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <p className="text-muted-foreground">Chargement des données...</p>
          </div>
        ) : (
          filteredColumns.map((column) => (
            <KanbanColumn
              key={column.status}
              title={column.title}
              status={column.status}
              items={column.items}
              className={cn(
                "flex-1",
                isMobile && "min-w-[250px]" // Slightly narrower columns on mobile
              )}
              onDrop={handleDrop}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default KanbanBoard;
