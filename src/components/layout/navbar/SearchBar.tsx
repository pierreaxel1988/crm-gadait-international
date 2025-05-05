
import React from 'react';
import { Search } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const SearchBar = () => {
  const isMobile = useIsMobile();
  
  return (
    <button className="rounded-md p-1.5 transition-colors duration-200">
      <Search className="h-5 w-5 text-white" />
    </button>
  );
};

export default SearchBar;
