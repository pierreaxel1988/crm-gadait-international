
import { LeadStatus, PipelineType } from '@/types/lead';
import { FilterOptions } from '../PipelineFilters';

export type SortBy = 'priority' | 'newest' | 'oldest';

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

export interface SortingControlsProps {
  sortBy: SortBy;
  onSortChange: (sort: SortBy) => void;
}

export interface LeadsListProps {
  leads: any[];
  isLoading: boolean;
  onLeadClick: (leadId: string) => void;
  onAddLead: () => void;
}
