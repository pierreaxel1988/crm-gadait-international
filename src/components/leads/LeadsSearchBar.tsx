
import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { useDebounce } from '@/hooks/useDebounce';

interface LeadsSearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchResults?: Array<{
    id: string;
    name: string;
    email?: string;
    phone?: string;
    status?: string;
    desiredLocation?: string;
  }>;
  isLoading?: boolean;
}

const LeadsSearchBar: React.FC<LeadsSearchBarProps> = ({ 
  searchTerm, 
  setSearchTerm, 
  searchResults = [], 
  isLoading = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Ouvrir la liste de résultats quand on tape quelque chose
  useEffect(() => {
    if (debouncedSearchTerm.length > 0) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [debouncedSearchTerm]);

  const handleSelectLead = (leadId: string) => {
    setIsOpen(false);
    navigate(`/leads/${leadId}?tab=overview`);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Rechercher des leads..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="luxury-input pl-10 pr-8 w-full"
          onFocus={() => debouncedSearchTerm.length > 0 && setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        />
        {searchTerm.length > 0 && (
          <button 
            className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground"
            onClick={handleClearSearch}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-[300px] overflow-y-auto">
          {isLoading ? (
            <div className="p-2 text-center text-sm text-muted-foreground">
              Recherche en cours...
            </div>
          ) : searchResults.length === 0 ? (
            <div className="p-2 text-center text-sm text-muted-foreground">
              Aucun résultat trouvé
            </div>
          ) : (
            <ul className="py-1">
              {searchResults.map(lead => (
                <li 
                  key={lead.id} 
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex flex-col"
                  onClick={() => handleSelectLead(lead.id)}
                >
                  <span className="font-medium">{lead.name}</span>
                  <div className="flex text-xs text-muted-foreground space-x-2">
                    {lead.status && <span className="bg-gray-100 px-1 rounded">{lead.status}</span>}
                    {lead.desiredLocation && <span>{lead.desiredLocation}</span>}
                    {lead.email && <span className="truncate">{lead.email}</span>}
                    {lead.phone && <span className="truncate">{lead.phone}</span>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default LeadsSearchBar;
