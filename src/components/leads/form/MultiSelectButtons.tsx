
import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MultiSelectButtonsProps<T extends string> {
  options: T[];
  selectedValues: T[] | undefined;
  onToggle: (value: T) => void;
}

const MultiSelectButtons = <T extends string>({ 
  options, 
  selectedValues = [], 
  onToggle 
}: MultiSelectButtonsProps<T>) => {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(option => (
        <button
          key={option}
          type="button"
          onClick={() => onToggle(option)}
          className={cn(
            "flex items-center gap-1 py-1 px-2 rounded-full text-xs",
            selectedValues.includes(option)
              ? "bg-primary text-white"
              : "bg-accent text-accent-foreground hover:bg-accent/80"
          )}
        >
          {selectedValues.includes(option) && <Check className="h-3 w-3" />}
          {option}
        </button>
      ))}
    </div>
  );
};

export default MultiSelectButtons;
