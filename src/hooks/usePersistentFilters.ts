import { useState, useEffect, useCallback } from 'react';
import { FilterOptions } from '@/components/pipeline/PipelineFilters';

const FILTERS_STORAGE_KEY = 'pipeline-filters';

const defaultFilters: FilterOptions = {
  pipelineType: 'all',
  status: null,
  statuses: [],
  tags: [],
  assignedTo: null,
  minBudget: '',
  maxBudget: '',
  location: '',
  country: '',
  currency: '',
  purchaseTimeframe: null,
  propertyType: null,
  propertyTypes: [],
  nationality: '',
  preferredLanguage: '',
  views: [],
  amenities: [],
  minBedrooms: null,
  maxBedrooms: null,
  financingMethod: '',
  propertyUse: '',
  regions: []
};

export function usePersistentFilters() {
  const [filters, setFiltersState] = useState<FilterOptions>(defaultFilters);
  const [isLoaded, setIsLoaded] = useState(false);

  // Charger les filtres depuis localStorage au démarrage
  useEffect(() => {
    try {
      const savedFilters = localStorage.getItem(FILTERS_STORAGE_KEY);
      if (savedFilters) {
        const parsed = JSON.parse(savedFilters);
        // Fusionner avec les filtres par défaut pour gérer les nouvelles propriétés
        setFiltersState({ ...defaultFilters, ...parsed });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des filtres:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Sauvegarder les filtres dans localStorage à chaque changement
  const setFilters = useCallback((newFilters: FilterOptions | ((prev: FilterOptions) => FilterOptions)) => {
    const updatedFilters = typeof newFilters === 'function' ? newFilters(filters) : newFilters;
    
    setFiltersState(updatedFilters);
    
    try {
      localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(updatedFilters));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des filtres:', error);
    }
  }, [filters]);

  // Effacer tous les filtres (localStorage inclus)
  const clearFilters = useCallback(() => {
    setFiltersState(defaultFilters);
    
    try {
      localStorage.removeItem(FILTERS_STORAGE_KEY);
    } catch (error) {
      console.error('Erreur lors de l\'effacement des filtres:', error);
    }
  }, []);

  // Réinitialiser uniquement l'agent assigné (pour préserver la logique existante)
  const updateAgentFilter = useCallback((agentId: string | null) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      assignedTo: agentId
    }));
  }, [setFilters]);

  return {
    filters,
    setFilters,
    clearFilters,
    updateAgentFilter,
    isLoaded
  };
}