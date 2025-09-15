import React from 'react';
import { Button } from '@/components/ui/button';

interface BudgetPresetsProps {
  onPresetSelect: (min: string, max: string) => void;
}

const BudgetPresets = ({ onPresetSelect }: BudgetPresetsProps) => {
  const presets = [
    { label: '< 500k€', min: '', max: '500000€' },
    { label: '500k - 1M€', min: '500000€', max: '1000000€' },
    { label: '1M - 2M€', min: '1000000€', max: '2000000€' },
    { label: '> 2M€', min: '2000000€', max: '' },
  ];

  return (
    <div className="grid grid-cols-2 gap-1 mt-2">
      {presets.map((preset) => (
        <Button
          key={preset.label}
          variant="outline"
          size="sm"
          className="text-xs h-7"
          onClick={() => onPresetSelect(preset.min, preset.max)}
        >
          {preset.label}
        </Button>
      ))}
    </div>
  );
};

export default BudgetPresets;