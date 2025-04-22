
import React from 'react';
import { cn } from '@/lib/utils';

export interface MultiSelectButtonsProps {
  options: string[];
  selectedValues: string[];
  onChange?: (value: string) => void;
  onToggle?: (value: string) => void;
  className?: string;
  specialOption?: string;
}

const MultiSelectButtons = ({
  options,
  selectedValues,
  onChange,
  onToggle,
  className,
  specialOption
}: MultiSelectButtonsProps) => {
  const handleToggle = (value: string) => {
    if (onChange) {
      onChange(value);
    } else if (onToggle) {
      onToggle(value);
    }
  };

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((option) => {
        const isSelected = selectedValues.includes(option);
        
        return (
          <button
            key={option}
            type="button"
            onClick={() => handleToggle(option)}
            className={cn(
              "rounded-full px-3 py-1 text-sm font-medium transition-colors",
              isSelected
                ? "bg-chocolate-dark text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200",
              specialOption === option ? "border border-green-500" : ""
            )}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
};

export default MultiSelectButtons;
