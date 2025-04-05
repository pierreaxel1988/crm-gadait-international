
import React from 'react';
import { FilterOptions } from '@/components/pipeline/PipelineFilters';
import { PipelineType } from '@/types/lead';
import LocationFilter from './filters/LocationFilter';

interface PipelineTabContentProps {
  contentType: 'purchase' | 'rental';
  filters: FilterOptions;
  refreshTrigger: number;
}

// This component is no longer used in the current implementation
// It's kept for backward compatibility but now has the improved LocationFilter
const PipelineTabContent = ({ contentType, filters, refreshTrigger }: PipelineTabContentProps) => {
  return <div></div>;
};

export default PipelineTabContent;
