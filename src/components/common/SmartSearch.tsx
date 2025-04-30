import React, { useState, useRef, useEffect } from 'react';
import { Search, X, ArrowUp, ArrowDown } from 'lucide-react';
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
  onClear?: () => void; // Added onClear prop
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

  // Synchroniser la valeur externe avec l'état interne
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Transmettre la valeur débounced au parent
  useEffect(() => {
    if (debouncedValue !== value) {
      onChange(debouncedValue);
    }
  }, [debouncedValue, onChange, value]);

  // Gérer l'ouverture et la fermeture du dropdown
  useEffect(() => {
    if (debouncedValue.length >= minChars) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [debouncedValue, minChars]);

  // Détecter les clics en dehors pour fermer le dropdown
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

  // Navigation au clavier dans les résultats
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;
    
    // Flèche bas - sélectionner l'élément suivant
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < results.length - 1 ? prev + 1 : prev
      );
    }
    
    // Flèche haut - sélectionner l'élément précédent
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
    }
    
    // Entrée - sélectionner l'élément actuel
    else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      if (results[selectedIndex] && onSelect) {
        onSelect(results[selectedIndex]);
        setIsOpen(false);
      }
    }
    
    // Escape - fermer le dropdown
    else if (e.key === 'Escape') {
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
    // Call onClear if provided
    if (onClear) {
      onClear();
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
