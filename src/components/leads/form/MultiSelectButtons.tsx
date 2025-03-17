
import React from 'react';
import BaseSelectButtons from './BaseSelectButtons';

export interface MultiSelectButtonsProps<T extends string> {
  options: T[];
  selectedValues: T[];
  onToggle?: (value: T) => void;
  onChange?: (value: T) => void;
  singleSelect?: boolean;
}

const MultiSelectButtons = <T extends string>({ 
  options, 
  selectedValues, 
  onToggle, 
  onChange,
  singleSelect = false 
}: MultiSelectButtonsProps<T>) => {
  const handleClick = (value: T) => {
    if (onChange) {
      // If onChange is provided, use it (typically for single select)
      onChange(value);
    } else if (onToggle) {
      // If onToggle is provided, use it (for multi-select)
      onToggle(value);
    }
  };

  return (
    <BaseSelectButtons 
      options={options} 
      selectedValues={selectedValues}
      onSelect={handleClick}
      singleSelect={singleSelect}
    />
  );
};

export default MultiSelectButtons;
