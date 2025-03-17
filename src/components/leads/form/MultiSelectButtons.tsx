
import React from 'react';
import BaseSelectButtons from './BaseSelectButtons';

interface MultiSelectButtonsProps<T extends string> {
  options: T[];
  selectedValues: T[] | undefined;
  onChange?: (value: T) => void;
  onToggle?: (value: T) => void;
  singleSelect?: boolean;
}

const MultiSelectButtons = <T extends string>({ 
  options, 
  selectedValues = [], 
  onChange, 
  onToggle,
  singleSelect = false
}: MultiSelectButtonsProps<T>) => {
  const isSelected = (option: T) => selectedValues.includes(option);
  
  const handleSelectOption = (value: T) => {
    if (onChange) {
      // For single select, just pass the selected value
      if (singleSelect) {
        onChange(value);
        return;
      }
      // For multi-select, handle toggling
      onChange(value);
    } else if (onToggle) {
      onToggle(value);
    }
  };
  
  return (
    <BaseSelectButtons
      options={options}
      isSelected={isSelected}
      onSelectOption={handleSelectOption}
    />
  );
};

export default MultiSelectButtons;
