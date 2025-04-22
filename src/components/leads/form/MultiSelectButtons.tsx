
import React from 'react';
import BaseSelectButtons from './BaseSelectButtons';

interface MultiSelectButtonsProps<T extends string> {
  options: readonly T[] | T[];
  selectedValues: T[];
  onChange?: (value: T) => void;
  onToggle?: (value: T) => void;
  specialOption?: T;
  className?: string;
}

const MultiSelectButtons = <T extends string>({
  options,
  selectedValues = [],
  onChange,
  onToggle,
  specialOption,
  className,
}: MultiSelectButtonsProps<T>) => {
  const isSelected = (option: T) => selectedValues.includes(option);
  
  // Handle both onChange and onToggle patterns
  const handleSelectOption = (value: T) => {
    if (onToggle) {
      onToggle(value);
    } else if (onChange) {
      onChange(value);
    }
  };
  
  return (
    <BaseSelectButtons
      options={[...options]}
      isSelected={isSelected}
      onSelectOption={handleSelectOption}
      specialOption={specialOption}
      className={className}
    />
  );
};

export default MultiSelectButtons;
