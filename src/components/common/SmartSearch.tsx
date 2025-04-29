
import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
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
  // New props for dropdown functionality
  results?: any[];
  isLoading?: boolean;
  onSelect?: (item: any) => void;
  renderItem?: (item: any) => React.ReactNode;
  emptyMessage?: string;
  loadingMessage?: string;
  autoFocus?: boolean;
  onBlur?: () => void;
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
  disabled = false,
  // New props with defaults
  results = [],
  isLoading = false,
  onSelect,
  renderItem,
  emptyMessage = 'No results found',
  loadingMessage = 'Loading...',
  autoFocus = false,
  onBlur
}) => {
  const [showClear, setShowClear] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setShowClear(value.length > 0);
  }, [value]);

  useEffect(() => {
    // Show results dropdown if there's a value and it meets minimum chars
    setShowResults(
      Boolean(value) && 
      value.length >= minChars && 
      (isLoading || results.length > 0 || Boolean(emptyMessage))
    );
  }, [value, results, minChars, isLoading, emptyMessage]);

  useEffect(() => {
    // Handle clicks outside to close the dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) && 
        inputRef.current && 
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  const handleItemClick = (item: any) => {
    if (onSelect) {
      onSelect(item);
      setShowResults(false);
    }
  };

  const handleInputFocus = () => {
    // Only show results if there's a value and it meets minimum chars
    if (value && value.length >= minChars) {
      setShowResults(true);
    }
  };

  const handleInputBlur = () => {
    // Don't hide results immediately to allow clicking on results
    if (onBlur) {
      onBlur();
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
        autoFocus={autoFocus}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
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

      {/* Results dropdown */}
      {showResults && (results.length > 0 || isLoading || Boolean(emptyMessage)) && (
        <div 
          ref={dropdownRef}
          className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {isLoading ? (
            <div className="p-3 flex items-center justify-center text-sm text-gray-500">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {loadingMessage}
            </div>
          ) : results.length > 0 ? (
            <div>
              {results.map((item, index) => (
                <div 
                  key={index} 
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleItemClick(item)}
                >
                  {renderItem ? renderItem(item) : String(item)}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 text-sm text-gray-500">
              {emptyMessage}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SmartSearch;
