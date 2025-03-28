
import React from 'react';
import { FilterOptions } from '@/components/pipeline/PipelineFilters';
import { LeadStatus } from '@/components/common/StatusBadge';
import { PipelineType } from '@/types/lead';

interface PipelineTabContentProps {
  contentType: 'purchase' | 'rental';
  filters: FilterOptions;
  refreshTrigger: number;
}

const PipelineTabContent = ({ contentType, filters, refreshTrigger }: PipelineTabContentProps) => {
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

  // Return empty div as we no longer use this component for rendering
  // The rendering is now handled directly by DesktopPipelineView
  return <div></div>;
};

export default PipelineTabContent;
