
import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const SearchBar: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <>
      {isSearchOpen ? (
        <div className="relative animate-fade-in">
          <input 
            type="text" 
            placeholder="Search..." 
            className="luxury-input w-full md:w-64 border-loro-pearl font-optima" 
            autoFocus 
            onBlur={() => setIsSearchOpen(false)} 
          />
          <button 
            onClick={() => setIsSearchOpen(false)} 
            className="absolute right-2 top-1/2 -translate-y-1/2 text-loro-hazel hover:text-loro-navy"
          >
            <X size={isMobile ? 14 : 16} />
          </button>
        </div>
      ) : (
        <button 
          onClick={() => setIsSearchOpen(true)} 
          className="rounded-md p-1 md:p-2 text-loro-navy hover:text-loro-hazel transition-colors duration-200"
        >
          <Search size={isMobile ? 18 : 20} />
        </button>
      )}
    </>
  );
};

export default SearchBar;
