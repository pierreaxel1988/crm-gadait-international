import React from 'react';
import { Search } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
const SearchBar = () => {
  const isMobile = useIsMobile();
  const handleSearchClick = () => {
    // Ouvrir la recherche ou rediriger vers la page de recherche
    console.log('Search clicked');
    // Implémentation future de la recherche
  };
  return <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button onClick={handleSearchClick} className="rounded-md p-1.5 transition-colors duration-200 hover:bg-white/10">
            <Search className="h-5 w-5 text-white" />
          </button>
        </TooltipTrigger>
        
      </Tooltip>
    </TooltipProvider>;
};
export default SearchBar;