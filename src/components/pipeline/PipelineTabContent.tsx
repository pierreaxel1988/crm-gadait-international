
import React from 'react';
import KanbanBoard from '@/components/kanban/KanbanBoard';
import { FilterOptions } from '@/components/pipeline/PipelineFilters';
import { LeadStatus } from '@/components/common/StatusBadge';
import { useIsMobile } from '@/hooks/use-mobile';
import MobilePipelineView from './MobilePipelineView';

interface PipelineTabContentProps {
  contentType: 'purchase' | 'rental';
  filters: FilterOptions;
  refreshTrigger: number;
  onToggleFilters?: () => void;
  activeFilters?: number;
}

const PipelineTabContent = ({ 
  contentType, 
  filters, 
  refreshTrigger,
  onToggleFilters,
  activeFilters = 0
}: PipelineTabContentProps) => {
  const isMobile = useIsMobile();

  // Get the columns based on the content type
  const getColumns = () => {
    const statusesToShow = filters.status ? [filters.status] : contentType === 'purchase' 
      ? ['New', 'Contacted', 'Qualified', 'Proposal', 'Visit', 'Offer', 'Deposit', 'Signed'] as LeadStatus[]
      : ['New', 'Contacted', 'Qualified', 'Visit', 'Proposal', 'Offer', 'Signed'] as LeadStatus[];
    
    return statusesToShow.map(status => ({
      title: status,
      status: status as LeadStatus,
      items: [],
      pipelineType: contentType
    }));
  };

  const columns = getColumns();

  if (isMobile) {
    return (
      <MobilePipelineView 
        columns={columns}
        filters={filters}
        pipelineType={contentType}
        onToggleFilters={onToggleFilters || (() => {})}
        activeFilters={activeFilters}
      />
    );
  }

  return (
    <KanbanBoard 
      columns={columns} 
      filters={filters} 
      refreshTrigger={refreshTrigger}
      pipelineType={contentType}
    />
  );
};

export default PipelineTabContent;
