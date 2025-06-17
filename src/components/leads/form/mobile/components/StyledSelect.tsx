
import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StyledSelectProps {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
  options: Array<{value: string; label: string}>;
  placeholder?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

const StyledSelect: React.FC<StyledSelectProps> = ({ 
  id, 
  value, 
  onChange, 
  className, 
  options, 
  placeholder, 
  icon,
  disabled = false
}) => {
  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
          {icon}
        </div>
      )}
      <select
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={cn(
          "w-full appearance-none bg-white px-4 py-2.5 pr-10 rounded-lg border border-gray-200 shadow-sm",
          "focus:outline-none focus:ring-2 focus:ring-chocolate-dark focus:border-transparent",
          "text-gray-800 font-futura transition duration-200 ease-in-out",
          "hover:border-gray-300 hover:shadow-md",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          icon && "pl-10",
          className
        )}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
        <ChevronDown className="h-4 w-4 text-gray-500" />
      </div>
    </div>
  );
};

export default StyledSelect;
