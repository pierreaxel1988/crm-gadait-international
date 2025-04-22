
import React from 'react';
import { cn } from '@/lib/utils';

interface MultiSelectButtonsProps {
  options: string[];
  selectedValues: string[];
  onChange: (value: string) => void;
  specialOption?: string;
  className?: string;
}

const MultiSelectButtons: React.FC<MultiSelectButtonsProps> = ({
  options,
  selectedValues,
  onChange,
  specialOption,
  className
}) => {
  // La fonction de gestion de clic pour basculer entre sélectionné et non sélectionné
  const handleToggle = (value: string) => {
    onChange(value);
  };

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map(option => (
        <button
          key={option}
          type="button"
          onClick={() => handleToggle(option)}
          className={`py-1 px-3 text-sm rounded-md transition-colors flex items-center ${
            selectedValues.includes(option)
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          } ${option === specialOption ? 'font-bold' : ''}`}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

export default MultiSelectButtons;
