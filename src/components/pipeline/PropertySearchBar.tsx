
import React from 'react';
import { Search, X, Hash } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface PropertySearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
}

const PropertySearchBar: React.FC<PropertySearchBarProps> = ({
  searchTerm,
  onSearchChange,
  placeholder = "Rechercher par titre, localisation ou référence..."
}) => {
  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-loro-navy/60" />
      <Input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10 pr-10 h-11 bg-loro-white border-loro-pearl focus:border-loro-sand focus:ring-loro-sand/20 font-futura"
      />
      {searchTerm && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSearchChange('')}
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-loro-pearl"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default PropertySearchBar;
