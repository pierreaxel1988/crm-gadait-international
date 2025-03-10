
import React from 'react';
import BaseSelectButtons from './BaseSelectButtons';

interface MultiSelectButtonsProps<T extends string> {
  options: T[];
  selectedValues: T[] | undefined;
  onToggle: (value: T) => void;
}

const MultiSelectButtons = <T extends string>({ 
  options, 
  selectedValues = [], 
  onToggle 
}: MultiSelectButtonsProps<T>) => {
  const isSelected = (option: T) => selectedValues.includes(option);
  
  return (
    <BaseSelectButtons
      options={options}
      isSelected={isSelected}
      onSelectOption={onToggle}
    />
  );
};

export default MultiSelectButtons;
