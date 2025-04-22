
import React from 'react';
import { cn } from '@/lib/utils';

interface MultiSelectButtonsProps {
  options: string[];
  selectedValues?: string[]; 
  onChange?: (value: string) => void;
  onToggle?: (values: string[]) => void;
  specialOption?: string;
  className?: string;
  multiple?: boolean;
}

const MultiSelectButtons: React.FC<MultiSelectButtonsProps> = ({
  options,
  selectedValues = [], 
  onChange,
  onToggle,
  specialOption,
  className,
  multiple = true
}) => {
  const handleClick = (option: string) => {
    let newSelectedValues: string[];

    if (multiple) {
      newSelectedValues = selectedValues.includes(option)
        ? selectedValues.filter(val => val !== option)
        : [...selectedValues, option];
    } else {
      newSelectedValues = [option];
    }

    if (onChange) {
      onChange(option);
    }
    
    if (onToggle) {
      onToggle(newSelectedValues);
    }
  };

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map(option => (
        <button
          key={option}
          type="button"
          onClick={() => handleClick(option)}
          className={`py-1 px-3 text-sm rounded-md transition-colors flex items-center ${
            selectedValues.includes(option)
              ? 'bg-primary text-white'
              : 'bg-secondary text-foreground'
          } ${option === specialOption ? 'font-bold' : ''}`}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

export default MultiSelectButtons;
