
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import GlobalSearch from '@/components/search/GlobalSearch';

const SearchBar = () => {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  // Handler to open the global search dialog
  const handleSearchClick = () => {
    setOpen(true);
  };

  // Effect to handle keyboard shortcut (Ctrl+K or Cmd+K)
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || e.key === '/') {
        e.preventDefault();
        setOpen(prevOpen => !prevOpen);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              onClick={handleSearchClick} 
              className="rounded-md p-1.5 transition-transform duration-200 hover:scale-110"
              aria-label="Rechercher"
            >
              <Search className="h-5 w-5 text-white" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <div className="flex items-center gap-1">
              <span>Rechercher</span>
              <kbd className="bg-muted px-1.5 text-xs rounded">Ctrl K</kbd>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <GlobalSearch open={open} onOpenChange={setOpen} />
    </>
  );
};

export default SearchBar;
