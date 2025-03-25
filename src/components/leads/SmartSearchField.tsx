
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { countryMatchesSearch } from '@/components/chat/utils/nationalityUtils';

interface SmartSearchFieldProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: string[];
  className?: string;
  maxResults?: number;
  searchPlaceholder?: string;
}

const SmartSearchField: React.FC<SmartSearchFieldProps> = ({
  id,
  value,
  onChange,
  placeholder,
  options,
  className = '',
  maxResults = 10,
  searchPlaceholder = 'Rechercher...'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Filter options based on search term
  const filteredOptions = options.filter(option => 
    countryMatchesSearch(option, searchTerm)
  ).slice(0, maxResults);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Toggle search dropdown
  const handleSearchIconClick = () => {
    setSearchTerm(value || '');
    setShowResults(!showResults);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full font-futura ${className}`}
        />
        
        <div 
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer"
          onClick={handleSearchIconClick}
        >
          <Search className="h-4 w-4" />
        </div>
      </div>
      
      {showResults && (
        <div className="mt-1 p-2 border rounded-md bg-background shadow-sm max-h-60 overflow-y-auto z-50 absolute w-full">
          <div className="mb-2">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full text-sm"
              autoFocus
            />
          </div>
          <div className="space-y-1">
            {filteredOptions.map(option => (
              <div 
                key={option}
                className="p-2 hover:bg-accent rounded-md cursor-pointer text-sm"
                onClick={() => {
                  onChange(option);
                  setShowResults(false);
                }}
              >
                {option}
              </div>
            ))}
            {filteredOptions.length === 0 && (
              <div className="p-2 text-sm text-muted-foreground">
                Aucun résultat trouvé
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartSearchField;
