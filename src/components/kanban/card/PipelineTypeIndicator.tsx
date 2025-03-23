
import React from 'react';
import { Home, Key } from 'lucide-react';

interface PipelineTypeIndicatorProps {
  pipelineType?: 'purchase' | 'rental';
}

const PipelineTypeIndicator = ({ pipelineType }: PipelineTypeIndicatorProps) => {
  // This component is now intentionally blank as we don't want to show the icon
  return null;
};

export default PipelineTypeIndicator;
