
import React from 'react';
import BaseSelectButtons from './BaseSelectButtons';

interface RadioSelectButtonsProps<T extends string> {
  options: T[];
  selectedValue: T | undefined;
  onSelect: (value: T) => void;
}

const RadioSelectButtons = <T extends string>({ 
  options, 
  selectedValue, 
  onSelect 
}: RadioSelectButtonsProps<T>) => {
  const isSelected = (option: T) => option === selectedValue;
  
  return (
    <BaseSelectButtons
      options={options}
      isSelected={isSelected}
      onSelectOption={onSelect}
    />
  );
};

export default RadioSelectButtons;
