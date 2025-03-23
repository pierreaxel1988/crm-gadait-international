
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
      // Updated to match the image with French statuses
      ? ['New', 'Contacted', 'Qualified', 'Proposal', 'Visit', 'Offre', 'Gagné', 'Perdu'] as LeadStatus[]
      : ['New', 'Contacted', 'Qualified', 'Visit', 'Proposal', 'Offre', 'Gagné', 'Perdu'] as LeadStatus[];
    
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
