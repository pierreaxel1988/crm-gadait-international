
import { useEffect } from 'react';
import { FilterOptions } from '@/components/pipeline/types/filterTypes';

export const usePersistentFilters = (
  filters: FilterOptions,
  setFilters: (filters: FilterOptions) => void
) => {
  // Load filters from localStorage on mount
  useEffect(() => {
    const savedFilters = localStorage.getItem('pipelineFilters');
    if (savedFilters) {
      try {
        const parsedFilters = JSON.parse(savedFilters);
        setFilters(parsedFilters);
      } catch (error) {
        console.error('Error parsing saved filters:', error);
      }
    }
  }, []);

  // Save filters to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('pipelineFilters', JSON.stringify(filters));
  }, [filters]);
};
