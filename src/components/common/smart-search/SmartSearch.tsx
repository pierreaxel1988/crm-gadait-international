
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
import SearchInput from './SearchInput';
import SearchResults from './SearchResults';
import type { SmartSearchProps } from './types';

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
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debouncedValue = useDebounce(inputValue, 300);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (debouncedValue !== value) {
      onChange(debouncedValue);
    }
  }, [debouncedValue, onChange, value]);

  useEffect(() => {
    if (debouncedValue.length >= minChars && !disabled) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [debouncedValue, minChars, disabled]);

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || disabled) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < results.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      if (results[selectedIndex] && onSelect) {
        onSelect(results[selectedIndex]);
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      if (onBlur) onBlur();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setSelectedIndex(-1);
  };

  const handleClear = () => {
    setInputValue('');
    onChange('');
    setIsOpen(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleItemClick = (item: any) => {
    if (onSelect) {
      onSelect(item);
    }
    setIsOpen(false);
  };

  const handleInputBlur = () => {
    if (onBlur) {
      setTimeout(() => {
        onBlur();
      }, 200);
    }
  };

  return (
    <div className={cn("relative w-full", className)}>
      <SearchInput
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onClear={handleClear}
        onFocus={() => !disabled && inputValue.length >= minChars && setIsOpen(true)}
        onBlur={handleInputBlur}
        placeholder={placeholder}
        inputClassName={inputClassName}
        searchIcon={searchIcon}
        clearButton={clearButton}
        autoFocus={autoFocus}
        disabled={disabled}
        inputRef={inputRef}
      />

      <SearchResults
        isOpen={isOpen && inputValue.length >= minChars && !disabled}
        results={results}
        isLoading={isLoading}
        selectedIndex={selectedIndex}
        loadingMessage={loadingMessage}
        emptyMessage={emptyMessage}
        renderItem={renderItem || ((item: any) => JSON.stringify(item))}
        onItemClick={handleItemClick}
        dropdownRef={dropdownRef}
      />
    </div>
  );
};

export default SmartSearch;
