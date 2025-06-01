
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MultiSelectButtonsProps<T> {
  options: T[];
  selectedValues: T[];
  onToggle: (value: T) => void;
  className?: string;
  buttonClassName?: string;
}

const MultiSelectButtons = <T extends string | number>({
  options,
  selectedValues,
  onToggle,
  className = "flex flex-wrap gap-2",
  buttonClassName
}: MultiSelectButtonsProps<T>) => {
  return (
    <div className={className}>
      {options.map((option) => {
        const isSelected = selectedValues.includes(option);
        return (
          <Button
            key={String(option)}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onToggle(option)}
            data-selected={isSelected}
            className={cn(
              "transition-all duration-200",
              buttonClassName || `
                border-loro-sand/30 text-loro-navy hover:bg-loro-sand/20
                ${isSelected 
                  ? 'bg-loro-hazel text-white border-loro-hazel hover:bg-loro-hazel/90' 
                  : 'bg-white hover:bg-loro-sand/10'
                }
              `
            )}
          >
            {String(option)}
          </Button>
        );
      })}
    </div>
  );
};

export default MultiSelectButtons;
