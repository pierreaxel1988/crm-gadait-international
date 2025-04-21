
import { FilterOptions } from '../PipelineFilters';
import { PipelineType } from '@/types/lead';

export type SortBy = 'priority' | 'newest' | 'oldest' | 'mandate';

export interface DesktopPipelineViewProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filtersOpen: boolean;
  toggleFilters: () => void;
  activeFiltersCount: number;
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onClearFilters: () => void;
  columns: any[];
  handleRefresh: () => void;
  isRefreshing: boolean;
  isFilterActive: (filterName: string) => boolean;
  teamMembers: { id: string; name: string }[];
}
