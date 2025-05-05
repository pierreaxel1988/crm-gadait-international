
import React from 'react';
import { Search } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const SearchBar = () => {
  const isMobile = useIsMobile();
  
  return (
    <button className="rounded-md p-1.5 transition-colors duration-200">
      <Search className={cn(
        "h-5 w-5",
        isMobile ? "text-white" : "text-loro-navy"
      )} />
    </button>
  );
};

export default SearchBar;
