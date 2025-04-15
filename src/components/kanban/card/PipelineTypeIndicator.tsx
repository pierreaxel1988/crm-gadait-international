
import React from 'react';
import { Home, Building } from 'lucide-react';

interface PipelineTypeIndicatorProps {
  pipelineType?: 'purchase' | 'rental';
}

const PipelineTypeIndicator = ({ pipelineType }: PipelineTypeIndicatorProps) => {
  // If you want to debug the pipeline type, you can uncomment the code below
  // Normally this component is invisible, but it can be useful for debugging
  
  /*
  if (!pipelineType) return null;
  
  return (
    <div className="flex items-center text-xs text-gray-500 mt-1">
      {pipelineType === 'purchase' ? (
        <Home className="h-3 w-3 mr-1" />
      ) : (
        <Building className="h-3 w-3 mr-1" />
      )}
      <span>{pipelineType === 'purchase' ? 'Achat' : 'Location'}</span>
    </div>
  );
  */
  
  // For production, we don't show anything
  return null;
};

export default PipelineTypeIndicator;
