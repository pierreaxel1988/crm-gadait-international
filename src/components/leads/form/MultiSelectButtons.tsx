
import React from 'react';
import BaseSelectButtons from './BaseSelectButtons';

interface MultiSelectButtonsProps<T extends string> {
  options: readonly T[] | T[];
  selectedValues: T[];
  onChange?: (value: T) => void; // Make onChange optional
  onToggle?: (value: T) => void; // Add back onToggle for backward compatibility
  specialOption?: T;
}

const MultiSelectButtons = <T extends string>({
  options,
  selectedValues = [],
  onChange,
  onToggle,
  specialOption,
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
      options={[...options]} // Convert readonly array to regular array with spread
      isSelected={isSelected}
      onSelectOption={handleSelectOption}
      specialOption={specialOption}
    />
  );
};

export default MultiSelectButtons;
