
import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchInputProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
}

const SearchInput = ({ searchTerm, onSearchChange, onClearSearch }: SearchInputProps) => {
  return (
    <div className="relative">
      <Input
        type="text"
        placeholder="Rechercher un agent..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10 border border-gray-200 rounded-md font-louisvuitton"
      />
      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
      {searchTerm && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 h-6 w-6"
          onClick={onClearSearch}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default SearchInput;
