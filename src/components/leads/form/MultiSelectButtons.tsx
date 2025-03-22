
import React from 'react';
import BaseSelectButtons from './BaseSelectButtons';

interface MultiSelectButtonsProps<T extends string> {
  options: readonly T[] | T[];
  selectedValues: T[];
  onChange: (value: T) => void;
  specialOption?: T;
}

const MultiSelectButtons = <T extends string>({
  options,
  selectedValues = [],
  onChange,
  specialOption,
}: MultiSelectButtonsProps<T>) => {
  const isSelected = (option: T) => selectedValues.includes(option);
  
  return (
    <BaseSelectButtons
      options={options}
      isSelected={isSelected}
      onSelectOption={onChange}
      specialOption={specialOption}
    />
  );
};

export default MultiSelectButtons;
