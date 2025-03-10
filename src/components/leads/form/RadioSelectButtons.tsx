
import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RadioSelectButtonsProps<T extends string> {
  options: T[];
  selectedValue: T | undefined;
  onSelect: (value: T) => void;
}

const RadioSelectButtons = <T extends string>({ 
  options, 
  selectedValue, 
  onSelect 
}: RadioSelectButtonsProps<T>) => {
  return (
    <div className="flex gap-2">
      {options.map(option => (
        <button
          key={option}
          type="button"
          onClick={() => onSelect(option)}
          className={cn(
            "flex items-center gap-1 py-1 px-2 rounded-full text-xs",
            selectedValue === option
              ? "bg-primary text-white"
              : "bg-accent text-accent-foreground hover:bg-accent/80"
          )}
        >
          {selectedValue === option && <Check className="h-3 w-3" />}
          {option}
        </button>
      ))}
    </div>
  );
};

export default RadioSelectButtons;
