
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { useLeadSearch, SearchResult } from '@/hooks/useLeadSearch';
import { Loader2, User, Home, Phone, Mail, Tag, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

type GlobalSearchProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type PropertyResult = {
  id: string;
  title?: string;
  reference?: string;
  price?: number;
  location?: string;
  type?: string;
};

type SearchResults = {
  leads: SearchResult[];
  properties: PropertyResult[];
  recentSearches: SearchResult[];
};

const GlobalSearch: React.FC<GlobalSearchProps> = ({ open, onOpenChange }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [allResults, setAllResults] = useState<SearchResults>({
    leads: [],
    properties: [],
    recentSearches: []
  });
  const [isLoadingProperties, setIsLoadingProperties] = useState(false);
  const { results: leadResults, isLoading: isLoadingLeads } = useLeadSearch(searchQuery);
  const [recentSearches, setRecentSearches] = useState<SearchResult[]>([]);

  // Load recent searches from localStorage
  useEffect(() => {
    const storedRecentSearches = localStorage.getItem('recentSearches');
    if (storedRecentSearches) {
      try {
        setRecentSearches(JSON.parse(storedRecentSearches));
      } catch (error) {
        console.error('Error parsing recent searches:', error);
      }
    }
  }, []);

  // Save a search to recent searches
  const saveToRecentSearches = (result: SearchResult) => {
    const updatedRecentSearches = [
      result,
      ...recentSearches.filter(item => item.id !== result.id).slice(0, 4)
    ];
    setRecentSearches(updatedRecentSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedRecentSearches));
  };

  // Search for properties
  useEffect(() => {
    const searchProperties = async () => {
      if (searchQuery.length < 2) {
        setAllResults(prev => ({ ...prev, properties: [] }));
        return;
      }

      setIsLoadingProperties(true);
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('id, title, price, location, property_type, reference')
          .or(`title.ilike.%${searchQuery}%, reference.ilike.%${searchQuery}%, location.ilike.%${searchQuery}%`)
          .limit(5);

        if (error) {
          console.error('Error searching properties:', error);
          setAllResults(prev => ({ ...prev, properties: [] }));
          return;
        }

        if (data) {
          const formattedProperties: PropertyResult[] = data.map(prop => ({
            id: prop.id,
            title: prop.title,
            reference: prop.reference,
            price: prop.price,
            location: prop.location,
            type: prop.property_type
          }));
          
          setAllResults(prev => ({ ...prev, properties: formattedProperties }));
        }
      } catch (error) {
        console.error('Error in property search:', error);
        setAllResults(prev => ({ ...prev, properties: [] }));
      } finally {
        setIsLoadingProperties(false);
      }
    };

    searchProperties();
  }, [searchQuery]);

  // Update all results when lead results change
  useEffect(() => {
    setAllResults(prev => ({ ...prev, leads: leadResults, recentSearches }));
  }, [leadResults, recentSearches]);

  // Handle selecting a result
  const handleSelectResult = (result: any, type: 'lead' | 'property') => {
    if (type === 'lead') {
      saveToRecentSearches(result);
      navigate(`/leads/${result.id}?tab=overview`);
    } else if (type === 'property') {
      navigate(`/properties/${result.id}`);
    }
    onOpenChange(false);
  };

  // Handle keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput 
        placeholder="Rechercher un lead, une propriété..." 
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <CommandList>
        <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>
        
        {/* Recent Searches */}
        {recentSearches.length > 0 && searchQuery.length === 0 && (
          <CommandGroup heading="Recherches récentes">
            {recentSearches.map((result) => (
              <CommandItem
                key={`recent-${result.id}`}
                onSelect={() => handleSelectResult(result, 'lead')}
              >
                <User className="mr-2 h-4 w-4" />
                <span>{result.name}</span>
                {result.email && (
                  <span className="ml-2 text-xs text-muted-foreground truncate">{result.email}</span>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        
        {/* Loading states */}
        {(isLoadingLeads || isLoadingProperties) && (
          <div className="py-6 text-center">
            <Loader2 className="h-5 w-5 animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground mt-2">Recherche en cours...</p>
          </div>
        )}
        
        {/* Leads Results */}
        {allResults.leads.length > 0 && (
          <CommandGroup heading="Leads">
            {allResults.leads.map((lead) => (
              <CommandItem
                key={`lead-${lead.id}`}
                onSelect={() => handleSelectResult(lead, 'lead')}
                className="flex items-start py-2"
              >
                <div className="mr-2 mt-0.5">
                  <User className="h-4 w-4" />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="font-medium">{lead.name}</span>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-1">
                    {lead.email && (
                      <span className="flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        <span className="truncate max-w-[150px]">{lead.email}</span>
                      </span>
                    )}
                    {lead.phone && (
                      <span className="flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        <span>{lead.phone}</span>
                      </span>
                    )}
                    {lead.status && (
                      <span className="flex items-center">
                        <Tag className="h-3 w-3 mr-1" />
                        <span>{lead.status}</span>
                      </span>
                    )}
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        
        {/* Properties Results */}
        {allResults.properties.length > 0 && (
          <>
            {allResults.leads.length > 0 && <CommandSeparator />}
            <CommandGroup heading="Propriétés">
              {allResults.properties.map((property) => (
                <CommandItem
                  key={`property-${property.id}`}
                  onSelect={() => handleSelectResult(property, 'property')}
                  className="flex items-start py-2"
                >
                  <div className="mr-2 mt-0.5">
                    <Home className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="font-medium">
                      {property.reference || property.title || 'Propriété sans nom'}
                    </span>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-1">
                      {property.location && (
                        <span>{property.location}</span>
                      )}
                      {property.type && (
                        <span>{property.type}</span>
                      )}
                      {property.price && (
                        <span>{new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: 'EUR'
                        }).format(property.price)}</span>
                      )}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
        
        {/* Quick Actions */}
        {searchQuery.length === 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Actions rapides">
              <CommandItem onSelect={() => {
                navigate('/leads/new');
                onOpenChange(false);
              }}>
                <User className="mr-2 h-4 w-4" />
                <span>Nouveau lead</span>
              </CommandItem>
              <CommandItem onSelect={() => {
                navigate('/import-lead');
                onOpenChange(false);
              }}>
                <User className="mr-2 h-4 w-4" />
                <span>Importer un lead</span>
              </CommandItem>
              <CommandItem onSelect={() => {
                navigate('/calendar');
                onOpenChange(false);
              }}>
                <Calendar className="mr-2 h-4 w-4" />
                <span>Voir le calendrier</span>
              </CommandItem>
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
};

export default GlobalSearch;
