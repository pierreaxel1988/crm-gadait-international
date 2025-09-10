
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';

interface SmartSearchProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSelect?: (item: any) => void;
  results?: any[];
  isLoading?: boolean;
  renderItem?: (item: any) => React.ReactNode;
  emptyMessage?: string;
  loadingMessage?: string;
  minChars?: number;
  className?: string;
  inputClassName?: string;
  searchIcon?: boolean;
  clearButton?: boolean;
  autoFocus?: boolean;
  onBlur?: () => void;
  onClear?: () => void;
}

const SmartSearch: React.FC<SmartSearchProps> = ({
  placeholder = "Rechercher...",
  value,
  onChange,
  onSelect,
  results = [],
  isLoading = false,
  renderItem,
  emptyMessage = "Aucun résultat trouvé",
  loadingMessage = "Recherche en cours...",
  minChars = 2,
  className,
  inputClassName,
  searchIcon = true,
  clearButton = true,
  autoFocus = false,
  onBlur,
  onClear
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debouncedValue = useDebounce(inputValue, 300);
  
  // Sync external value with internal state, but only when they differ
  useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value);
    }
  }, [value]);

  // Debounce input changes to parent
  useEffect(() => {
    if (debouncedValue !== value) {
      console.log('SmartSearch - sending to parent:', debouncedValue);
      onChange(debouncedValue);
    }
  }, [debouncedValue, onChange, value]);

  // Handle dropdown open/close based on input length
  useEffect(() => {
    setIsOpen(inputValue.length >= minChars);
  }, [inputValue, minChars]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) && 
        inputRef.current && 
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        if (onBlur) onBlur();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onBlur]);

  // Keyboard navigation handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;
    
    // Arrow down - select next item
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < results.length - 1 ? prev + 1 : prev
      );
    }
    
    // Arrow up - select previous item
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
    }
    
    // Enter - select current item
    else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      if (results[selectedIndex] && onSelect) {
        onSelect(results[selectedIndex]);
        setIsOpen(false);
      }
    }
    
    // Escape - close dropdown
    else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      if (onBlur) onBlur();
    }
  }, [isOpen, results, selectedIndex, onSelect, onBlur]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('SmartSearch - input changed:', e.target.value);
    setInputValue(e.target.value);
    setSelectedIndex(-1);
  }, []);

  const handleClear = useCallback(() => {
    setInputValue('');
    onChange('');
    setIsOpen(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
    if (onClear) {
      onClear();
    }
  }, [onChange, onClear]);

  const handleItemClick = useCallback((item: any) => {
    if (onSelect) {
      onSelect(item);
    }
    setIsOpen(false);
  }, [onSelect]);

  const handleInputBlur = useCallback(() => {
    // Use a short delay to allow clicks on list items to be detected
    if (onBlur) {
      setTimeout(() => {
        onBlur();
      }, 200);
    }
  }, [onBlur]);

  return (
    <div className={cn("relative w-full", className)}>
      <div className="relative">
        {searchIcon && (
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        )}
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => inputValue.length >= minChars && setIsOpen(true)}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          className={cn(
            searchIcon && "pl-9",
            clearButton && inputValue && "pr-8",
            inputClassName
          )}
          autoFocus={autoFocus}
        />
        {clearButton && inputValue && (
          <Button
            variant="ghost"
            size="icon"
            type="button"
            onClick={handleClear}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Effacer</span>
          </Button>
        )}
      </div>

      {isOpen && (inputValue.length >= minChars) && (
        <div 
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 overflow-hidden"
        >
          {isLoading ? (
            <div className="p-3 text-center text-sm text-muted-foreground">
              {loadingMessage}
            </div>
          ) : results.length === 0 ? (
            <div className="p-3 text-center text-sm text-muted-foreground">
              {emptyMessage}
            </div>
          ) : (
            <ScrollArea className="max-h-[300px]">
              <div className="py-1">
                {results.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => handleItemClick(item)}
                    className={cn(
                      "px-3 py-2 cursor-pointer",
                      selectedIndex === index ? "bg-gray-100" : "hover:bg-gray-50"
                    )}
                  >
                    {renderItem ? renderItem(item) : JSON.stringify(item)}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      )}
    </div>
  );
};

export default SmartSearch;
