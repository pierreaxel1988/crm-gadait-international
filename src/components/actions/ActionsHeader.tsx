import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, RefreshCcw, SlidersHorizontal, X } from 'lucide-react';
import { TaskType } from '@/components/kanban/KanbanCard';
import { ActionStatus } from '@/types/actionHistory';
import StatusFilterButtons from './filters/StatusFilterButtons';
import TypeFilterButtons from './filters/TypeFilterButtons';
import AgentFilterButtons from './filters/AgentFilterButtons';
interface ActionsHeaderProps {
  isAdmin: boolean;
  statusFilter: ActionStatus | 'all';
  setStatusFilter: (status: ActionStatus | 'all') => void;
  typeFilter: TaskType | 'all';
  setTypeFilter: (type: TaskType | 'all') => void;
  agentFilter: string | null;
  setAgentFilter: (agentId: string | null) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  teamMembers: {
    id: string;
    name: string;
  }[];
  handleRefresh: () => void;
}
const ActionsHeader: React.FC<ActionsHeaderProps> = ({
  isAdmin,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
  agentFilter,
  setAgentFilter,
  searchTerm,
  setSearchTerm,
  teamMembers,
  handleRefresh
}) => {
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Count active filters
  const getActiveFiltersCount = () => {
    let count = 0;
    if (statusFilter !== 'all') count++;
    if (typeFilter !== 'all') count++;
    if (agentFilter !== null) count++;
    return count;
  };
  const activeFiltersCount = getActiveFiltersCount();
  const clearAllFilters = () => {
    setStatusFilter('all');
    setTypeFilter('all');
    setAgentFilter(null);
    setSearchTerm('');
  };
  return <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="tracking-tight font-medium text-zinc-900 text-base">Actions</h1>
        <div className="flex items-center gap-2">
          {activeFiltersCount > 0 && <Button variant="outline" size="icon" className="h-10 w-10" onClick={clearAllFilters} title="Effacer tous les filtres">
              <X className="h-5 w-5" />
            </Button>}
          <Button variant="outline" size="icon" className="h-10 w-10" onClick={handleRefresh} title="Rafraîchir">
            <RefreshCcw className="h-5 w-5" />
          </Button>
          <Button variant={activeFiltersCount > 0 ? "default" : "outline"} size="sm" onClick={() => setFiltersOpen(!filtersOpen)} className="h-10 px-4 relative font-medium">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filtres
            {activeFiltersCount > 0 && <span className="absolute -top-1 -right-1 bg-white text-primary rounded-full h-5 w-5 flex items-center justify-center text-xs">
                {activeFiltersCount}
              </span>}
          </Button>
        </div>
      </div>
      
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input type="search" placeholder="Rechercher une action..." className="pl-9 pr-12 bg-gray-100 border-0" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={handleRefresh}>
          <RefreshCcw className="h-4 w-4" />
        </Button>
      </div>

      {activeFiltersCount > 0 && <div className="flex flex-wrap gap-2 mb-4">
          {statusFilter !== 'all' && <Button variant="secondary" size="sm" className="gap-1" onClick={() => setStatusFilter('all')}>
              {statusFilter === 'todo' && 'À faire'}
              {statusFilter === 'overdue' && 'En retard'}
              {statusFilter === 'done' && 'Terminé'}
              <X className="h-3 w-3" />
            </Button>}
          {typeFilter !== 'all' && <Button variant="secondary" size="sm" className="gap-1" onClick={() => setTypeFilter('all')}>
              {typeFilter} <X className="h-3 w-3" />
            </Button>}
          {agentFilter !== null && isAdmin && <Button variant="secondary" size="sm" className="gap-1" onClick={() => setAgentFilter(null)}>
              {teamMembers.find(m => m.id === agentFilter)?.name || 'Agent'} <X className="h-3 w-3" />
            </Button>}
        </div>}

      {filtersOpen && <div className="p-4 mb-4 bg-gray-50 rounded-lg space-y-4">
          <StatusFilterButtons statusFilter={statusFilter} setStatusFilter={setStatusFilter} />
          
          <TypeFilterButtons typeFilter={typeFilter} setTypeFilter={setTypeFilter} />
          
          {isAdmin && <AgentFilterButtons agentFilter={agentFilter} setAgentFilter={setAgentFilter} teamMembers={teamMembers} />}
          
          <div className="flex justify-end pt-2">
            <Button variant="outline" size="sm" className="mr-2" onClick={clearAllFilters}>
              Réinitialiser
            </Button>
            <Button size="sm" onClick={() => setFiltersOpen(false)}>
              Appliquer
            </Button>
          </div>
        </div>}
    </div>;
};
export default ActionsHeader;