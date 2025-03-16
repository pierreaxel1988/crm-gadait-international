
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
      ? ['New', 'Contacted', 'Qualified', 'Proposal', 'Visit', 'Offer', 'Deposit', 'Signed'] as LeadStatus[]
      : ['New', 'Contacted', 'Qualified', 'Visit', 'Proposal', 'Offer', 'Signed'] as LeadStatus[];
    
    return statusesToShow.map(status => ({
      title: status,
      status: status as LeadStatus,
      items: [],
      pipelineType: contentType // Ajout du type de pipeline
    }));
  };

  return (
    <KanbanBoard 
      columns={getColumns()} 
      filters={filters} 
      refreshTrigger={refreshTrigger}
      pipelineType={contentType} // Passer le type de pipeline au KanbanBoard
    />
  );
};

export default PipelineTabContent;
