
import React from 'react';
import { Home, Key } from 'lucide-react';

interface PipelineTypeIndicatorProps {
  pipelineType?: 'purchase' | 'rental';
}

const PipelineTypeIndicator = ({ pipelineType }: PipelineTypeIndicatorProps) => {
  if (!pipelineType) return null;
  
  return (
    <div className="mt-2 flex items-center text-xs text-muted-foreground">
      {pipelineType === 'purchase' 
        ? <Home className="h-3 w-3 mr-1 text-blue-500" /> 
        : <Key className="h-3 w-3 mr-1 text-amber-500" />}
    </div>
  );
};

export default PipelineTypeIndicator;
