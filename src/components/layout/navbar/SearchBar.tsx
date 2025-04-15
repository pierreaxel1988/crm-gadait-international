
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLeadSearch, SearchResult } from '@/hooks/useLeadSearch';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Search } from 'lucide-react';
import SmartSearch from '@/components/common/SmartSearch';

const SearchBar: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { results, isLoading } = useLeadSearch(searchTerm);

  const handleSelectLead = (lead: SearchResult) => {
    setIsSearchOpen(false);
    setSearchTerm('');
    navigate(`/leads/${lead.id}?tab=overview`);
  };

  const renderLeadItem = (lead: SearchResult) => (
    <>
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
    </>
  );

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
            <SmartSearch
              placeholder="Rechercher un lead..." 
              value={searchTerm}
              onChange={setSearchTerm}
              onSelect={handleSelectLead}
              results={results}
              isLoading={isLoading}
              renderItem={renderLeadItem}
              className="w-full"
              inputClassName="luxury-input w-full pl-10 pr-10 py-3 border-b-2 border-loro-pearl rounded-md shadow-sm focus:border-loro-hazel transition-colors duration-200"
              emptyMessage="Aucun résultat trouvé"
              loadingMessage="Recherche en cours..."
              autoFocus={true}
              minChars={2}
            />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop view
  return (
    <div className="relative">
      {isSearchOpen ? (
        <div className="relative animate-fade-in">
          <SmartSearch
            placeholder="Rechercher un lead..." 
            value={searchTerm}
            onChange={setSearchTerm}
            onSelect={handleSelectLead}
            results={results}
            isLoading={isLoading}
            renderItem={renderLeadItem}
            className="w-full md:w-72"
            inputClassName="luxury-input border-loro-pearl focus:border-loro-hazel pl-10 pr-8 transition-all duration-300 ease-in-out"
            emptyMessage="Aucun résultat trouvé"
            loadingMessage="Recherche en cours..."
            autoFocus={true}
            minChars={1}
            onBlur={() => {
              if (searchTerm === '') {
                setIsSearchOpen(false);
              }
            }}
          />
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
