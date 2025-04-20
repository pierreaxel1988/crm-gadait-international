
import React, { useRef } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onClear: () => void;
  onFocus: () => void;
  onBlur: () => void;
  placeholder?: string;
  inputClassName?: string;
  searchIcon?: boolean;
  clearButton?: boolean;
  autoFocus?: boolean;
  disabled?: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
}

const SearchInput = ({
  value,
  onChange,
  onKeyDown,
  onClear,
  onFocus,
  onBlur,
  placeholder,
  inputClassName,
  searchIcon = true,
  clearButton = true,
  autoFocus = false,
  disabled = false,
  inputRef
}: SearchInputProps) => {
  return (
    <div className="relative">
      {searchIcon && (
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      )}
      <Input
        ref={inputRef}
        type="text"
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        className={cn(
          searchIcon && "pl-9",
          clearButton && value && "pr-8",
          inputClassName
        )}
        autoFocus={autoFocus}
        disabled={disabled}
      />
      {clearButton && value && !disabled && (
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={onClear}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Effacer</span>
        </Button>
      )}
    </div>
  );
};

export default SearchInput;
