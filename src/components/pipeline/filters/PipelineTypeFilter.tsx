import React from 'react';
import { Button } from '@/components/ui/button';
import { Layers } from 'lucide-react';

interface PipelineTypeFilterProps {
  pipelineType: string;
  onPipelineTypeChange: (pipelineType: string) => void;
}

const PipelineTypeFilter = ({ pipelineType, onPipelineTypeChange }: PipelineTypeFilterProps) => {
  const pipelineTypes = [
    { value: 'all', label: 'Tous' },
    { value: 'purchase', label: 'Achat' },
    { value: 'location', label: 'Location' },
    { value: 'owners', label: 'Propriétaires' }
  ];

  return (
    <div>
      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
        <Layers className="h-4 w-4" /> Pipeline
      </h4>
      <div className="flex flex-wrap gap-1.5">
        {pipelineTypes.map((type) => (
          <Button
            key={type.value}
            variant={pipelineType === type.value ? "default" : "outline"}
            size="sm"
            className="text-xs h-7 px-3 min-w-0 whitespace-nowrap"
            onClick={() => onPipelineTypeChange(type.value)}
          >
            {type.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default PipelineTypeFilter;