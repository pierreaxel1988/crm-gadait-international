
import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLeadSearch, SearchResult } from '@/hooks/useLeadSearch';
import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const SearchBar: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const { results, isLoading } = useLeadSearch(searchTerm);

  // Fermer la recherche si on clique ailleurs (desktop uniquement)
  useEffect(() => {
    if (isMobile) return; // Skip for mobile (handled by Sheet component)
    
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobile]);

  const handleSelectLead = (leadId: string) => {
    setIsSearchOpen(false);
    setSearchTerm('');
    navigate(`/leads/${leadId}?tab=overview`);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Render mobile view with Sheet component
  if (isMobile) {
    return (
      <Sheet open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <SheetTrigger asChild>
          <button 
            onClick={() => setIsSearchOpen(true)} 
            className="rounded-md p-1 text-loro-navy hover:text-loro-hazel transition-colors duration-200"
            aria-label="Rechercher"
          >
            <Search size={18} />
          </button>
        </SheetTrigger>
        <SheetContent side="top" className="p-0 max-h-[80vh] pt-12">
          <div className="p-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-loro-hazel" />
              <input 
                type="text" 
                placeholder="Rechercher un lead..." 
                className="luxury-input w-full pl-10 pr-10 py-3 border-b-2 border-loro-pearl rounded-md shadow-sm focus:border-loro-hazel transition-colors duration-200" 
                autoFocus 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  onClick={handleClearSearch} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-loro-hazel hover:text-loro-navy transition-colors duration-200"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            
            {/* Résultats de recherche pour mobile */}
            {searchTerm.length > 1 && (
              <div className="mt-2 space-y-1 overflow-y-auto max-h-[50vh]">
                {isLoading ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    <div className="inline-block animate-spin mr-2">⏳</div>
                    Recherche en cours...
                  </div>
                ) : results.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Aucun résultat trouvé
                  </div>
                ) : (
                  <ul className="divide-y divide-loro-pearl">
                    {results.map((lead: SearchResult) => (
                      <li 
                        key={lead.id} 
                        className="p-3 hover:bg-gray-50 active:bg-gray-100 cursor-pointer transition-colors duration-150"
                        onClick={() => handleSelectLead(lead.id)}
                      >
                        <div className="font-medium text-base">{lead.name}</div>
                        <div className="flex text-sm text-muted-foreground gap-2 flex-wrap mt-1">
                          {lead.status && (
                            <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs">{lead.status}</span>
                          )}
                          {lead.desiredLocation && (
                            <span className="text-xs truncate">{lead.desiredLocation}</span>
                          )}
                          <div className="flex items-center gap-2 w-full mt-1">
                            {lead.email && (
                              <span className="text-xs truncate flex-1">{lead.email}</span>
                            )}
                            {lead.phone && (
                              <span className="text-xs truncate">{lead.phone}</span>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop view
  return (
    <div className="relative">
      {isSearchOpen ? (
        <div 
          className="relative animate-fade-in" 
          ref={inputRef}
        >
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-loro-hazel" />
            <input 
              type="text" 
              placeholder="Rechercher un lead..." 
              className="luxury-input w-full md:w-72 border-loro-pearl focus:border-loro-hazel pl-10 pr-8 transition-all duration-300 ease-in-out" 
              autoFocus 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button 
              onClick={() => {
                setIsSearchOpen(false);
                setSearchTerm('');
              }} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-loro-hazel hover:text-loro-navy transition-colors duration-200"
            >
              <X size={16} />
            </button>
          </div>
          
          {/* Résultats de recherche pour desktop */}
          {searchTerm.length > 1 && (
            <div className="absolute z-50 w-full mt-1 bg-white rounded-md shadow-luxury border border-loro-pearl max-h-[400px] overflow-y-auto">
              {isLoading ? (
                <div className="p-3 text-center text-sm text-muted-foreground">
                  <div className="inline-block animate-spin mr-2">⏳</div>
                  Recherche en cours...
                </div>
              ) : results.length === 0 ? (
                <div className="p-3 text-center text-sm text-muted-foreground">
                  Aucun résultat trouvé
                </div>
              ) : (
                <ul className="py-1 divide-y divide-loro-pearl/30">
                  {results.map((lead: SearchResult) => (
                    <li 
                      key={lead.id} 
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                      onClick={() => handleSelectLead(lead.id)}
                    >
                      <div className="font-medium">{lead.name}</div>
                      <div className="flex text-xs text-muted-foreground gap-2 flex-wrap mt-1">
                        {lead.status && (
                          <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs">{lead.status}</span>
                        )}
                        {lead.desiredLocation && (
                          <span className="text-xs truncate">{lead.desiredLocation}</span>
                        )}
                        <div className="flex w-full mt-0.5 text-xs text-muted-foreground gap-3">
                          {lead.email && (
                            <span className="truncate flex-1">{lead.email}</span>
                          )}
                          {lead.phone && (
                            <span className="truncate">{lead.phone}</span>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      ) : (
        <button 
          onClick={() => setIsSearchOpen(true)} 
          className="rounded-md p-2 text-loro-navy hover:text-loro-hazel hover:bg-gray-50 transition-all duration-200"
          aria-label="Rechercher"
        >
          <Search size={20} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
