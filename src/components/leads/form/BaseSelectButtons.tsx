
import React from 'react';
import { cn } from '@/lib/utils';

interface BaseSelectButtonsProps<T extends string> {
  options: T[];
  isSelected: (option: T) => boolean;
  onSelectOption: (option: T) => void;
  renderOptionContent?: (option: T, isSelected: boolean) => React.ReactNode;
  specialOption?: T;
  className?: string;
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
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              selected
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            } ${option === specialOption ? 'special-option' : ''}`}
          >
            {renderOptionContent ? renderOptionContent(option, selected) : option}
          </button>
        );
      })}
    </div>
  );
};

export default BaseSelectButtons;
