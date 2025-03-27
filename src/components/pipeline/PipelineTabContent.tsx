
import React from 'react';
import KanbanBoard from '@/components/kanban/KanbanBoard';
import { FilterOptions } from '@/components/pipeline/PipelineFilters';
import { LeadStatus } from '@/components/common/StatusBadge';

interface PipelineTabContentProps {
  contentType: 'purchase' | 'rental';
  filters: FilterOptions;
  refreshTrigger: number;
  searchTerm?: string;
}

const PipelineTabContent = ({ contentType, filters, refreshTrigger, searchTerm }: PipelineTabContentProps) => {
  // Get the columns based on the content type
  const getColumns = () => {
    const statusesToShow = filters.status ? [filters.status] : contentType === 'purchase' 
      // Standardized statuses matching the database values
      ? ['New', 'Contacted', 'Qualified', 'Proposal', 'Visit', 'Offer', 'Deposit', 'Signed', 'Gagné', 'Perdu'] as LeadStatus[]
      : ['New', 'Contacted', 'Qualified', 'Proposal', 'Visit', 'Offre', 'Deposit', 'Signed', 'Gagné', 'Perdu'] as LeadStatus[];
    
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
      searchTerm={searchTerm}
    />
  );
};

export default PipelineTabContent;
