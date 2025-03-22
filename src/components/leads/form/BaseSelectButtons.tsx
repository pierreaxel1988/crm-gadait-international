
import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BaseSelectButtonsProps<T extends string> {
  options: T[];
  isSelected: (option: T) => boolean;
  onSelectOption: (option: T) => void;
  renderOptionContent?: (option: T, isSelected: boolean) => React.ReactNode;
  specialOption?: T; // Special option like "8+" that needs special handling
}

const BaseSelectButtons = <T extends string>({
  options,
  isSelected,
  onSelectOption,
  renderOptionContent,
  specialOption,
}: BaseSelectButtonsProps<T>) => {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(option => {
        const selected = isSelected(option);
        return (
          <button
            key={option}
            type="button"
            onClick={() => onSelectOption(option)}
            className={cn(
              "flex items-center gap-1 py-1 px-2 rounded-full text-xs",
              selected
                ? "bg-primary text-white"
                : "bg-accent text-accent-foreground hover:bg-accent/80"
            )}
          >
            {selected && <Check className="h-3 w-3" />}
            {renderOptionContent ? renderOptionContent(option, selected) : option}
          </button>
        );
      })}
    </div>
  );
};

export default BaseSelectButtons;
