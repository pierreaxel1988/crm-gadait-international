
import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLeadSearch, SearchResult } from '@/hooks/useLeadSearch';
import { useNavigate } from 'react-router-dom';

const SearchBar: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const { results, isLoading } = useLeadSearch(searchTerm);

  // Fermer la recherche si on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelectLead = (leadId: string) => {
    setIsSearchOpen(false);
    setSearchTerm('');
    navigate(`/leads/${leadId}?tab=overview`);
  };

  return (
    <div className="relative">
      {isSearchOpen ? (
        <div className="relative animate-fade-in" ref={inputRef}>
          <input 
            type="text" 
            placeholder="Rechercher un lead..." 
            className="luxury-input w-full md:w-64 border-loro-pearl font-optima pl-8 pr-8" 
            autoFocus 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-loro-hazel" />
          <button 
            onClick={() => {
              setIsSearchOpen(false);
              setSearchTerm('');
            }} 
            className="absolute right-2 top-1/2 -translate-y-1/2 text-loro-hazel hover:text-loro-navy"
          >
            <X size={isMobile ? 14 : 16} />
          </button>
          
          {/* Résultats de recherche */}
          {searchTerm.length > 1 && (
            <div className="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg border border-loro-pearl max-h-[300px] overflow-y-auto">
              {isLoading ? (
                <div className="p-3 text-center text-sm text-muted-foreground">
                  Recherche en cours...
                </div>
              ) : results.length === 0 ? (
                <div className="p-3 text-center text-sm text-muted-foreground">
                  Aucun résultat trouvé
                </div>
              ) : (
                <ul className="py-1">
                  {results.map((lead: SearchResult) => (
                    <li 
                      key={lead.id} 
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleSelectLead(lead.id)}
                    >
                      <div className="font-medium">{lead.name}</div>
                      <div className="flex text-xs text-muted-foreground gap-2 flex-wrap">
                        {lead.status && (
                          <span className="bg-gray-100 px-1 rounded text-xs">{lead.status}</span>
                        )}
                        {lead.desiredLocation && (
                          <span className="text-xs truncate">{lead.desiredLocation}</span>
                        )}
                        {lead.email && (
                          <span className="text-xs truncate">{lead.email}</span>
                        )}
                        {lead.phone && (
                          <span className="text-xs truncate">{lead.phone}</span>
                        )}
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
          className="rounded-md p-1 md:p-2 text-loro-navy hover:text-loro-hazel transition-colors duration-200"
        >
          <Search size={isMobile ? 18 : 20} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
