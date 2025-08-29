
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CommandDialog, CommandInput, CommandList, CommandEmpty, Command, CommandGroup, CommandItem } from '@/components/ui/command';
import { useLeadSearch, PropertyResult, SearchResult } from '@/hooks/useLeadSearch';
import { Search, User, Building, Clock, Trash2 } from 'lucide-react';

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GlobalSearch = ({ open, onOpenChange }: GlobalSearchProps) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const { results: leadResults, isLoading: isLeadsLoading, searchProperties, setSearchTerm } = useLeadSearch();
  const [propertyResults, setPropertyResults] = useState<PropertyResult[]>([]);
  const [isPropertiesLoading, setIsPropertiesLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<SearchResult[]>([]);
  
  // Référence pour suivre si le composant est monté
  const isMounted = useRef(true);
  
  // Charger les recherches récentes depuis localStorage au montage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setRecentSearches(parsed);
      } catch (e) {
        console.error('Error parsing recent searches:', e);
      }
    }
    
    // Cleanup function
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Effet pour rechercher les propriétés lorsque la requête change
  useEffect(() => {
    const fetchPropertyResults = async () => {
      if (query.length >= 1) {
        setIsPropertiesLoading(true);
        try {
          const results = await searchProperties(query);
          // Vérifier que le composant est toujours monté avant de mettre à jour l'état
          if (isMounted.current) {
            setPropertyResults(results);
          }
        } catch (error) {
          console.error("Error fetching property results:", error);
          if (isMounted.current) {
            setPropertyResults([]);
          }
        } finally {
          if (isMounted.current) {
            setIsPropertiesLoading(false);
          }
        }
      } else {
        setPropertyResults([]);
      }
    };

    fetchPropertyResults();
  }, [query, searchProperties]);

  const handleSelectLead = (lead: SearchResult) => {
    // Ajouter aux recherches récentes
    const updatedRecent = [lead, ...recentSearches.filter(item => item.id !== lead.id)].slice(0, 5);
    setRecentSearches(updatedRecent);
    localStorage.setItem('recentSearches', JSON.stringify(updatedRecent));
    
    // Naviguer vers la page détaillée du lead
    navigate(`/leads/${lead.id}?tab=actions`);
    onOpenChange(false);
  };

  const handleSelectProperty = (property: PropertyResult) => {
    // Ajouter aux recherches récentes
    const propertyAsLead: SearchResult = {
      id: property.id,
      name: property.title,
      propertyReference: property.external_id
    };
    const updatedRecent = [propertyAsLead, ...recentSearches.filter(item => item.id !== property.id)].slice(0, 5);
    setRecentSearches(updatedRecent);
    localStorage.setItem('recentSearches', JSON.stringify(updatedRecent));
    
    // Naviguer vers la page détaillée de la propriété
    navigate(`/properties/${property.id}`);
    onOpenChange(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <Command className="rounded-lg border shadow-md">
        <CommandInput 
          placeholder="Rechercher des leads, propriétés..." 
          value={query} 
          onValueChange={(value) => {
            setQuery(value);
            setSearchTerm(value);
          }}
          autoFocus
        />
        <CommandList>
          <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>

          {leadResults.length > 0 && (
            <CommandGroup heading="Leads">
              {leadResults.map(lead => (
                <CommandItem
                  key={lead.id}
                  onSelect={() => handleSelectLead(lead)}
                  className="flex items-start gap-2 p-2"
                >
                  <User className="h-4 w-4 shrink-0 opacity-50" />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{lead.name}</span>
                      {lead.deleted_at && (
                        <div className="flex items-center gap-1 text-red-600">
                          <Trash2 className="h-3 w-3" />
                          <span className="text-xs font-medium">Supprimé</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 text-xs text-muted-foreground">
                      {lead.status && (
                        <span className={`px-1 rounded ${
                          lead.status === 'Deleted' ? 'bg-red-100 text-red-700' : 'bg-muted'
                        }`}>
                          {lead.status === 'Deleted' ? 'Supprimé' : lead.status}
                        </span>
                      )}
                      {lead.desiredLocation && (
                        <span className="flex items-center gap-0.5">
                          {lead.desiredLocation}
                        </span>
                      )}
                      {lead.email && (
                        <span className="flex items-center gap-0.5">
                          {lead.email}
                        </span>
                      )}
                      {lead.phone && (
                        <span className="flex items-center gap-0.5">
                          {lead.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {propertyResults.length > 0 && (
            <CommandGroup heading="Propriétés">
              {propertyResults.map(property => (
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

          {query.length < 1 && recentSearches.length > 0 && (
            <CommandGroup heading="Recherches récentes">
              {recentSearches.map(item => (
                <CommandItem
                  key={item.id}
                  onSelect={() => handleSelectLead(item)}
                  className="flex items-center gap-2 p-2"
                >
                  <Clock className="h-4 w-4 opacity-50" />
                  <div className="flex items-center gap-2">
                    <span>{item.name}</span>
                    {item.deleted_at && (
                      <div className="flex items-center gap-1 text-red-600">
                        <Trash2 className="h-3 w-3" />
                        <span className="text-xs font-medium">Supprimé</span>
                      </div>
                    )}
                  </div>
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
