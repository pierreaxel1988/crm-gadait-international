
import { useState, useEffect } from 'react';
import { FilterOptions } from '@/components/filters/PipelineFilters';

const FILTERS_STORAGE_KEY = 'pipeline_filters';

const getStoredFilters = (): FilterOptions | null => {
  try {
    const stored = localStorage.getItem(FILTERS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error reading stored filters:', error);
    return null;
  }
};

export const usePersistentFilters = (initialFilters: FilterOptions) => {
  const [filters, setFilters] = useState<FilterOptions>(() => {
    const storedFilters = getStoredFilters();
    return storedFilters || initialFilters;
  });

  useEffect(() => {
    try {
      localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filters));
    } catch (error) {
      console.error('Error storing filters:', error);
    }
  }, [filters]);

  const clearFilters = () => {
    localStorage.removeItem(FILTERS_STORAGE_KEY);
    setFilters(initialFilters);
  };

  return {
    filters,
    setFilters,
    clearFilters
  };
};
