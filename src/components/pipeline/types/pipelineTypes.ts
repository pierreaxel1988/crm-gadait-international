
import { LeadStatus } from '@/components/common/StatusBadge';
import { ExtendedKanbanItem } from '@/hooks/useKanbanData';
import { FilterOptions } from '@/components/filters/PipelineFilters';

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
  columns: {
    title: string;
    status: LeadStatus;
    items: ExtendedKanbanItem[];
  }[];
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
  leads: ExtendedKanbanItem[];
  isLoading?: boolean;
  onLeadClick: (id: string) => void;
  onAddLead?: () => void;
}
