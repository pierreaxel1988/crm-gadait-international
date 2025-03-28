
import React from 'react';
import { FilterOptions } from '@/components/pipeline/PipelineFilters';
import { LeadStatus } from '@/components/common/StatusBadge';
import { PipelineType } from '@/types/lead';

interface PipelineTabContentProps {
  contentType: 'purchase' | 'rental';
  filters: FilterOptions;
  refreshTrigger: number;
}

// This component is no longer used in the current implementation
// It's kept for backward compatibility
const PipelineTabContent = ({ contentType, filters, refreshTrigger }: PipelineTabContentProps) => {
  return <div></div>;
};

export default PipelineTabContent;
