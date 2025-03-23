
import React from 'react';
import KanbanBoard from '@/components/kanban/KanbanBoard';
import { FilterOptions } from '@/components/pipeline/PipelineFilters';
import { LeadStatus } from '@/components/common/StatusBadge';

interface PipelineTabContentProps {
  contentType: 'purchase' | 'rental';
  filters: FilterOptions;
  refreshTrigger: number;
}

const PipelineTabContent = ({ contentType, filters, refreshTrigger }: PipelineTabContentProps) => {
  // Get the columns based on the content type
  const getColumns = () => {
    const statusesToShow = filters.status ? [filters.status] : contentType === 'purchase' 
      // Updated to include all statuses in both French and English, including "Signed"
      ? ['New', 'Contacted', 'Qualified', 'Visit', 'Proposal', 'Offer', 'Offre', 'Deposit', 'Signed', 'Gagné', 'Perdu'] as LeadStatus[]
      : ['New', 'Contacted', 'Qualified', 'Visit', 'Proposal', 'Offer', 'Offre', 'Deposit', 'Signed', 'Gagné', 'Perdu'] as LeadStatus[];
    
    return statusesToShow.map(status => ({
      title: status,
      status: status as LeadStatus,
      items: [],
      pipelineType: contentType
    }));
  };

  return (
    <KanbanBoard 
      columns={getColumns()} 
      filters={filters} 
      refreshTrigger={refreshTrigger}
      pipelineType={contentType}
    />
  );
};

export default PipelineTabContent;
