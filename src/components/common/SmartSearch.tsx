
import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SmartSearchProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  inputClassName?: string;
  minChars?: number;
  clearButton?: boolean;
  searchIcon?: boolean;
  disabled?: boolean;
}

const SmartSearch: React.FC<SmartSearchProps> = ({
  placeholder,
  value,
  onChange,
  className = '',
  inputClassName = '',
  minChars = 3,
  clearButton = false,
  searchIcon = false,
  disabled = false
}) => {
  const [showClear, setShowClear] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setShowClear(value.length > 0);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  const handleClear = () => {
    onChange('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className={cn('relative', className)}>
      {searchIcon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
      )}

      <input
        ref={inputRef}
        type="text"
        className={cn(
          'w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500',
          searchIcon && 'pl-10',
          clearButton && showClear && 'pr-10',
          inputClassName
        )}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        disabled={disabled}
      />

      {clearButton && showClear && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
          disabled={disabled}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default SmartSearch;
