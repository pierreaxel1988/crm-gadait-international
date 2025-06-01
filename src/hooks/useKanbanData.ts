
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LeadStatus } from '@/components/common/StatusBadge';
import { KanbanItem } from '@/components/kanban/KanbanCard';
import { PipelineType } from '@/types/lead';
import { LeadTag } from '@/components/common/LeadTag';

export interface ExtendedKanbanItem extends KanbanItem {
  pipelineType?: PipelineType;
}

export const useKanbanData = () => {
  const [loadedColumns, setLoadedColumns] = useState<{
    title: string;
    status: LeadStatus;
    items: ExtendedKanbanItem[];
    pipelineType?: PipelineType;
  }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (leadsError) {
        console.error('Error fetching leads:', leadsError);
        setError('Erreur lors du chargement des leads');
        return;
      }

      // Transform leads data to kanban items
      const kanbanItems: ExtendedKanbanItem[] = (leads || []).map(lead => ({
        id: lead.id,
        name: lead.name || 'Lead sans nom',
        email: lead.email || '',
        phone: lead.phone,
        tags: (lead.tags || []).map((tag: string): LeadTag => ({ id: tag, name: tag, color: 'default' })),
        assignedTo: lead.assigned_to,
        status: lead.status as LeadStatus,
        pipelineType: lead.pipeline_type as PipelineType,
        propertyType: lead.property_types?.[0],
        budget: lead.budget,
        desiredLocation: lead.desired_location,
        country: lead.country,
        bedrooms: lead.bedrooms,
        createdAt: lead.created_at,
        importedAt: lead.imported_at,
        nextFollowUpDate: lead.next_follow_up_date,
        purchaseTimeframe: lead.purchase_timeframe
      }));

      // Group items by status
      const statuses: LeadStatus[] = [
        'New',
        'Contacted',
        'Qualified',
        'Proposal',
        'Negotiation',
        'Closed Won',
        'Closed Lost'
      ];

      const columns = statuses.map(status => ({
        title: status,
        status,
        items: kanbanItems.filter(item => item.status === status),
        pipelineType: 'Vente' as PipelineType
      }));

      setLoadedColumns(columns);
    } catch (err) {
      console.error('Unexpected error loading kanban data:', err);
      setError('Erreur inattendue lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    loadedColumns,
    setLoadedColumns,
    loading,
    isLoading: loading,
    error,
    refetch: loadData,
    teamMembers: []
  };
};
