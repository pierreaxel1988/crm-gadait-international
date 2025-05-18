
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from './useDebounce';

export interface SearchResult {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  phoneCountryCode?: string;
  phoneCountryCodeDisplay?: string;
  status?: string;
  desiredLocation?: string;
  pipelineType?: string;
  nationality?: string;
  source?: string;
  taxResidence?: string;
  preferredLanguage?: string;
  propertyReference?: string;
  createdAt?: string;
  tags?: string[];
  budget?: string;
}

export interface PropertyResult {
  id: string;
  title: string;
  price?: number | string;
  location?: string;
  property_type?: string;
  external_id?: string;
}

export function useLeadSearch(initialSearchTerm: string = '') {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    const searchLeads = async () => {
      // Reduced minimum search length to 1 character
      if (!debouncedSearchTerm || debouncedSearchTerm.length < 1) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      
      try {
        // Diviser les termes de recherche en mots pour rechercher prénom/nom séparément
        const searchTerms = debouncedSearchTerm.split(' ').filter(term => term.length > 0);
        
        // Utiliser uniquement les colonnes qui existent dans la base de données
        let query = supabase
          .from('leads')
          .select('id, name, email, phone, status, desired_location, pipeline_type, nationality, source, tax_residence, preferred_language, property_reference, created_at, tags, budget')
          .order('created_at', { ascending: false })
          .limit(20); // Increased limit for more results
        
        // Construction de la clause OR pour la recherche
        let orConditions = [];
        
        // Recherche par email - même avec peu de caractères
        orConditions.push(`email.ilike.%${debouncedSearchTerm}%`);
        
        // Recherche par téléphone - même avec peu de caractères
        orConditions.push(`phone.ilike.%${debouncedSearchTerm}%`);
        
        // Recherche par nom complet
        orConditions.push(`name.ilike.%${debouncedSearchTerm}%`);
        
        // Si nous avons plusieurs termes, rechercher individuellement pour chaque partie du nom
        // même avec seulement 1 caractère
        if (searchTerms.length > 1) {
          for (const term of searchTerms) {
            if (term.length >= 1) {
              orConditions.push(`name.ilike.%${term}%`);
            }
          }
        }
        
        // Appliquer les conditions OR à la requête
        const { data, error } = await query.or(orConditions.join(','));

        if (error) {
          console.error('Error searching leads:', error);
          setResults([]);
        } else if (data) {
          const formattedResults: SearchResult[] = data.map(lead => ({
            id: lead.id,
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            status: lead.status,
            desiredLocation: lead.desired_location,
            pipelineType: lead.pipeline_type,
            nationality: lead.nationality,
            source: lead.source,
            taxResidence: lead.tax_residence,
            preferredLanguage: lead.preferred_language,
            propertyReference: lead.property_reference,
            createdAt: lead.created_at,
            tags: lead.tags,
            budget: lead.budget
          }));
          
          setResults(formattedResults);
        }
      } catch (error) {
        console.error('Unexpected error during search:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    searchLeads();
  }, [debouncedSearchTerm]);

  // Fonction pour rechercher des propriétés
  const searchProperties = async (term: string): Promise<PropertyResult[]> => {
    // Reduced minimum search length to 1 character
    if (!term || term.length < 1) {
      return [];
    }

    try {
      // Utiliser les colonnes qui existent dans la table properties
      const { data, error } = await supabase
        .from('properties')
        .select('id, title, price, location, property_type, external_id')
        .or(`title.ilike.%${term}%, location.ilike.%${term}%, external_id.ilike.%${term}%`)
        .limit(10);

      if (error) {
        console.error('Error searching properties:', error);
        return [];
      }

      return (data || []).map(property => ({
        id: property.id,
        title: property.title,
        price: property.price,
        location: property.location,
        property_type: property.property_type,
        external_id: property.external_id
      }));
    } catch (error) {
      console.error('Unexpected error during property search:', error);
      return [];
    }
  };

  return {
    searchTerm,
    setSearchTerm,
    results,
    isLoading,
    searchProperties
  };
}
