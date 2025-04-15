
import React from 'react';
import { Check } from 'lucide-react';
import BaseSelectButtons from './BaseSelectButtons';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface RadioSelectButtonsProps<T extends string> {
  options: T[];
  selectedValue: T | undefined;
  onSelect: (value: T) => void;
  labelMapping?: Record<string, string>;
}

const RadioSelectButtons = <T extends string>({ 
  options, 
  selectedValue, 
  onSelect,
  labelMapping = {} 
}: RadioSelectButtonsProps<T>) => {
  const isMobile = useIsMobile();
  const isSelected = (option: T) => option === selectedValue;
  
  const renderOption = (option: T, isSelected: boolean) => {
    const displayLabel = labelMapping[option] || option;
    
    return (
      <span className="flex items-center gap-1">
        {isSelected && <Check className="h-3 w-3" />}
        <span className={cn(
          "text-sm font-futura",
          isMobile && "text-xs"
        )}>{displayLabel}</span>
      </span>
    );
  };
  
  return (
    <BaseSelectButtons
      options={options}
      isSelected={isSelected}
      onSelectOption={onSelect}
      renderOptionContent={renderOption}
      className={cn(
        "gap-3 mt-2",
        isMobile && "gap-2"
      )}
    />
  );
};

export default RadioSelectButtons;
