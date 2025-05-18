
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CommandDialog, CommandInput, CommandList, CommandEmpty, Command, CommandGroup, CommandItem } from '@/components/ui/command';
import { useLeadSearch, PropertyResult, SearchResult } from '@/hooks/useLeadSearch';
import { Search, User, Building, Clock, Mail, Phone, Tag } from 'lucide-react';

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SearchResults {
  leads: SearchResult[];
  properties: PropertyResult[];
  recentSearches: SearchResult[];
}

const GlobalSearch = ({ open, onOpenChange }: GlobalSearchProps) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const { searchTerm, setSearchTerm, results: leadResults, searchProperties } = useLeadSearch();
  const [recentSearches, setRecentSearches] = useState<SearchResult[]>([]);
  const [allResults, setAllResults] = useState<SearchResults>({
    leads: [],
    properties: [],
    recentSearches: []
  });
  
  // Update the search term when the query changes
  useEffect(() => {
    setSearchTerm(query);
  }, [query, setSearchTerm]);

  // Search for properties when the query changes
  useEffect(() => {
    const fetchPropertyResults = async () => {
      // Search with just 1 character
      if (query.length >= 1) {
        try {
          const propertyResults = await searchProperties(query);
          setAllResults(prev => ({
            ...prev,
            properties: propertyResults,
            leads: leadResults
          }));
        } catch (error) {
          console.error("Error fetching property results:", error);
          setAllResults(prev => ({
            ...prev,
            properties: [],
            leads: leadResults
          }));
        }
      } else {
        setAllResults(prev => ({
          ...prev,
          properties: [],
          leads: []
        }));
      }
    };

    fetchPropertyResults();
  }, [query, leadResults, searchProperties]);

  // Load recent searches from localStorage when component mounts
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setRecentSearches(parsed);
        setAllResults(prev => ({
          ...prev,
          recentSearches: parsed
        }));
      } catch (e) {
        console.error('Error parsing recent searches:', e);
      }
    }
  }, []);

  const handleSelectLead = (lead: SearchResult) => {
    // Add to recent searches
    const updatedRecent = [lead, ...recentSearches.filter(item => item.id !== lead.id)].slice(0, 5);
    setRecentSearches(updatedRecent);
    localStorage.setItem('recentSearches', JSON.stringify(updatedRecent));
    
    // Navigate to lead detail page
    navigate(`/leads/${lead.id}?tab=overview`);
    onOpenChange(false);
  };

  const handleSelectProperty = (property: PropertyResult) => {
    // Add to recent searches
    const propertyAsLead: SearchResult = {
      id: property.id,
      name: property.title,
      propertyReference: property.external_id
    };
    const updatedRecent = [propertyAsLead, ...recentSearches.filter(item => item.id !== property.id)].slice(0, 5);
    setRecentSearches(updatedRecent);
    localStorage.setItem('recentSearches', JSON.stringify(updatedRecent));
    
    // Navigate to property detail page
    navigate(`/properties/${property.id}`);
    onOpenChange(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <Command className="rounded-lg border shadow-md">
        <CommandInput 
          placeholder="Rechercher des leads, propriétés..." 
          value={query} 
          onValueChange={setQuery} 
          autoFocus
        />
        <CommandList>
          <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>

          {allResults.leads.length > 0 && (
            <CommandGroup heading="Leads">
              {allResults.leads.map(lead => (
                <CommandItem
                  key={lead.id}
                  onSelect={() => handleSelectLead(lead)}
                  className="flex items-start gap-2 p-2"
                >
                  <User className="h-4 w-4 shrink-0 opacity-50" />
                  <div className="flex flex-col">
                    <span className="font-medium">{lead.name}</span>
                    <div className="flex flex-wrap gap-1 text-xs text-muted-foreground">
                      {lead.status && <span className="bg-muted px-1 rounded">{lead.status}</span>}
                      {lead.desiredLocation && (
                        <span className="flex items-center gap-0.5">
                          {lead.desiredLocation}
                        </span>
                      )}
                      {lead.email && (
                        <span className="flex items-center gap-0.5">
                          <Mail className="h-3 w-3" />
                          {lead.email}
                        </span>
                      )}
                      {lead.phone && (
                        <span className="flex items-center gap-0.5">
                          <Phone className="h-3 w-3" />
                          {lead.phone}
                        </span>
                      )}
                      {lead.tags && lead.tags.length > 0 && (
                        <span className="flex items-center gap-0.5">
                          <Tag className="h-3 w-3" />
                          {lead.tags.join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {allResults.properties.length > 0 && (
            <CommandGroup heading="Propriétés">
              {allResults.properties.map(property => (
                <CommandItem
                  key={property.id}
                  onSelect={() => handleSelectProperty(property)}
                  className="flex items-start gap-2 p-2"
                >
                  <Building className="h-4 w-4 shrink-0 opacity-50" />
                  <div className="flex flex-col">
                    <span className="font-medium">{property.title}</span>
                    <div className="flex flex-wrap gap-1 text-xs text-muted-foreground">
                      {property.external_id && <span className="bg-muted px-1 rounded">Réf: {property.external_id}</span>}
                      {property.price && <span>{typeof property.price === 'number' ? property.price.toLocaleString() + ' €' : property.price}</span>}
                      {property.location && <span>{property.location}</span>}
                      {property.property_type && <span>{property.property_type}</span>}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {query.length < 1 && allResults.recentSearches.length > 0 && (
            <CommandGroup heading="Recherches récentes">
              {allResults.recentSearches.map(item => (
                <CommandItem
                  key={item.id}
                  onSelect={() => handleSelectLead(item)}
                  className="flex items-center gap-2 p-2"
                >
                  <Clock className="h-4 w-4 opacity-50" />
                  <span>{item.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  );
};

export default GlobalSearch;
