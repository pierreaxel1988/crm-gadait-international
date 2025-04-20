
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface SearchResultsProps {
  isOpen: boolean;
  results: any[];
  isLoading: boolean;
  selectedIndex: number;
  loadingMessage: string;
  emptyMessage: string;
  renderItem: (item: any) => React.ReactNode;
  onItemClick: (item: any) => void;
  dropdownRef: React.RefObject<HTMLDivElement>;
}

const SearchResults = ({
  isOpen,
  results,
  isLoading,
  selectedIndex,
  loadingMessage,
  emptyMessage,
  renderItem,
  onItemClick,
  dropdownRef
}: SearchResultsProps) => {
  if (!isOpen) return null;

  return (
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
                onClick={() => onItemClick(item)}
                className={cn(
                  "px-3 py-2 cursor-pointer",
                  selectedIndex === index ? "bg-gray-100" : "hover:bg-gray-50"
                )}
              >
                {renderItem(item)}
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default SearchResults;
