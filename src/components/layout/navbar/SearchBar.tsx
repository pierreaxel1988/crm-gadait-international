
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import GlobalSearch from '@/components/search/GlobalSearch';

const SearchBar = () => {
  const isMobile = useIsMobile();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleSearchClick = () => {
    setIsSearchOpen(true);
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              onClick={handleSearchClick} 
              className="rounded-md p-1.5 transition-transform duration-200 hover:scale-110"
            >
              <Search className="h-5 w-5 text-white" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Rechercher (Ctrl+K)</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <GlobalSearch open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </>
  );
};

export default SearchBar;
