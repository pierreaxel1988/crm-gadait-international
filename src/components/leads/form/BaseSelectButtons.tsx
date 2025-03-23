
import React from 'react';
import { cn } from '@/lib/utils';

interface BaseSelectButtonsProps<T extends string> {
  options: readonly T[] | T[]; // Handle readonly arrays
  isSelected: (option: T) => boolean;
  onSelectOption: (option: T) => void;
  renderOptionContent?: (option: T, isSelected: boolean) => React.ReactNode;
  specialOption?: T; // Special option like "8+" that needs special handling
  className?: string; // Add className prop
}

const BaseSelectButtons = <T extends string>({
  options,
  isSelected,
  onSelectOption,
  renderOptionContent,
  specialOption,
  className,
}: BaseSelectButtonsProps<T>) => {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map(option => {
        const selected = isSelected(option);
        return (
          <button
            key={option}
            type="button"
            onClick={() => onSelectOption(option)}
            className={cn(
              "flex items-center py-2 px-4 rounded-full text-sm font-medium transition-colors",
              selected
                ? "bg-primary text-white shadow-sm"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            )}
          >
            {renderOptionContent ? renderOptionContent(option, selected) : option}
          </button>
        );
      })}
    </div>
  );
};

export default BaseSelectButtons;
