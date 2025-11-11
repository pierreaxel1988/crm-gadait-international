
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export type SortOption = 'price-asc' | 'price-desc' | 'newest' | 'oldest' | 'title-asc';

interface PropertySortProps {
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

const sortOptions = [
  { value: 'newest' as SortOption, label: 'Plus récent' },
  { value: 'price-desc' as SortOption, label: 'Prix décroissant' },
  { value: 'price-asc' as SortOption, label: 'Prix croissant' },
];

const PropertySort: React.FC<PropertySortProps> = ({ currentSort, onSortChange }) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-futura text-loro-navy/70">Trier par:</span>
      <div className="flex gap-1">
        {sortOptions.map((option) => (
          <Button
            key={option.value}
            variant={currentSort === option.value ? "default" : "ghost"}
            size="sm"
            onClick={() => onSortChange(option.value)}
            className={`font-futura transition-all duration-200 ${
              currentSort === option.value
                ? 'bg-loro-sand text-loro-navy hover:bg-loro-sand/90'
                : 'text-loro-navy/70 hover:text-loro-navy hover:bg-loro-white'
            }`}
          >
            {option.label}
            {currentSort === option.value && (
              <ArrowUpDown className="h-3 w-3 ml-1" />
            )}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default PropertySort;
