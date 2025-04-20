import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search, SlidersHorizontal, RotateCcw } from 'lucide-react';
import PipelineFilters, { FilterOptions } from './PipelineFilters';
import { LeadStatus } from '@/components/common/StatusBadge';
import { useKanbanData } from '@/hooks/useKanbanData';
import { PipelineType } from '@/types/lead';
import LeadListItem from './mobile/LeadListItem';
import { useNavigate } from 'react-router-dom';
import { applyFiltersToColumns } from '@/utils/kanbanFilterUtils';
import PipelineHeader from './PipelineHeader';
import { sortLeadsByPriority } from './mobile/utils/leadSortUtils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const statusTranslations: Record<LeadStatus, string> = {
  'New': 'Nouveaux',
  'Contacted': 'Contactés',
  'Qualified': 'Qualifiés',
  'Proposal': 'Propositions',
  'Visit': 'Visites en cours',
  'Offer': 'Offre en cours',
  'Offer': 'Offre en cours',
  'Deposit': 'Dépôt reçu',
  'Signed': 'Signature finale',
  'Gagné': 'Conclus',
  'Perdu': 'Perdu'
};

interface DesktopPipelineViewProps {
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

const DesktopPipelineView: React.FC<DesktopPipelineViewProps> = ({
  activeTab,
  setActiveTab,
  searchTerm,
  setSearchTerm,
  filtersOpen,
  toggleFilters,
  activeFiltersCount,
  filters,
  onFilterChange,
  onClearFilters,
  columns,
  handleRefresh,
  isRefreshing,
  isFilterActive,
  teamMembers
}) => {
  const [activeStatus, setActiveStatus] = useState<LeadStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'newest' | 'oldest'>('priority');
  const navigate = useNavigate();
  
  const {
    loadedColumns,
    isLoading,
  } = useKanbanData(columns, 0, activeTab as PipelineType);
  
  const filteredColumns = filters 
    ? applyFiltersToColumns(loadedColumns.filter(column => 
        !column.pipelineType || column.pipelineType === activeTab
      ), filters)
    : loadedColumns.filter(column => 
        !column.pipelineType || column.pipelineType === activeTab
      );

  const leadsByStatus = filteredColumns.flatMap(column => column.items.map(item => ({
    ...item,
    columnStatus: column.status
  })));
  
  const displayedLeads = activeStatus === 'all' 
    ? leadsByStatus 
    : leadsByStatus.filter(lead => lead.columnStatus === activeStatus);
  
  const searchFilteredLeads = searchTerm 
    ? displayedLeads.filter(item => 
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.desiredLocation?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : displayedLeads;
    
  const sortedLeads = sortLeadsByPriority(searchFilteredLeads, sortBy);
  
  const leadCountByStatus = filteredColumns.reduce((acc, column) => {
    const countForStatus = column.items.length;
    acc[column.status] = countForStatus;
    return acc;
  }, {} as Record<string, number>);
  
  const totalLeadCount = leadsByStatus.length;
  
  const handleAddLead = () => {
    navigate(`/leads/new?pipeline=${activeTab}&status=${activeStatus === 'all' ? 'New' : activeStatus}`);
  };
  
  const handleLeadClick = (leadId: string) => {
    navigate(`/leads/${leadId}`);
  };
  
  const handleApplyFilters = () => {
    handleRefresh();
    toggleFilters();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-170px)]">
      <PipelineHeader
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onToggleFilters={toggleFilters}
        filtersOpen={filtersOpen}
        activeFilters={activeFiltersCount}
        isFilterActive={isFilterActive}
        filters={filters}
        onFilterChange={onFilterChange}
        onClearFilters={onClearFilters}
        teamMembers={teamMembers}
        handleRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-4">
        <TabsList className="bg-gray-100 p-1 rounded-xl w-80">
          <TabsTrigger 
            value="purchase" 
            className="flex-1 rounded-lg text-sm font-medium text-zinc-700 data-[state=active]:text-zinc-900 data-[state=active]:bg-white"
          >
            Achat
          </TabsTrigger>
          <TabsTrigger 
            value="rental" 
            className="flex-1 rounded-lg text-sm font-medium text-zinc-700 data-[state=active]:text-zinc-900 data-[state=active]:bg-white"
          >
            Location
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="overflow-x-auto pb-3">
        <Tabs 
          value={activeStatus === 'all' ? 'all' : activeStatus} 
          onValueChange={value => setActiveStatus(value as LeadStatus | 'all')} 
          className="w-full"
        >
          <TabsList className="inline-flex w-auto p-1 h-10 bg-gray-100 rounded-full">
            <TabsTrigger 
              value="all" 
              className="rounded-full px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              Tous ({totalLeadCount})
            </TabsTrigger>
            {filteredColumns.map(column => 
              leadCountByStatus[column.status] > 0 && (
                <TabsTrigger 
                  key={column.status} 
                  value={column.status} 
                  className="rounded-full px-4 whitespace-nowrap data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  {statusTranslations[column.status]} ({leadCountByStatus[column.status]})
                </TabsTrigger>
              )
            )}
          </TabsList>
        </Tabs>
      </div>
      
      <div className="flex flex-wrap gap-3 items-center justify-between bg-gray-50 rounded-lg p-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Trier par:</span>
          <div className="flex space-x-2">
            <button 
              onClick={() => setSortBy('priority')}
              className={`px-3 py-1 rounded-md ${sortBy === 'priority' 
                ? 'bg-zinc-900 text-white' 
                : 'bg-gray-100 text-gray-600'}`}
            >
              Priorité
            </button>
            <button 
              onClick={() => setSortBy('newest')}
              className={`px-3 py-1 rounded-md ${sortBy === 'newest' 
                ? 'bg-zinc-900 text-white' 
                : 'bg-gray-100 text-gray-600'}`}
            >
              Plus récent
            </button>
            <button 
              onClick={() => setSortBy('oldest')}
              className={`px-3 py-1 rounded-md ${sortBy === 'oldest' 
                ? 'bg-zinc-900 text-white' 
                : 'bg-gray-100 text-gray-600'}`}
            >
              Plus ancien
            </button>
          </div>
        </div>
      </div>
      
      <div className="relative flex-1 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">Chargement des leads...</p>
          </div>
        ) : (
          <div className="h-full overflow-y-auto p-4">
            {sortedLeads.length === 0 ? (
              <div className="flex items-center justify-center h-40 border border-dashed border-border rounded-md bg-white">
                <div className="text-center">
                  <p className="text-sm text-zinc-900 font-medium">Aucun lead trouvé</p>
                  <button 
                    onClick={handleAddLead} 
                    className="mt-2 text-zinc-900 hover:text-zinc-700 text-sm flex items-center justify-center mx-auto"
                  >
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Ajouter un lead
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-slate-200 divide-y shadow-sm">
                {sortedLeads.map(lead => (
                  <LeadListItem 
                    key={lead.id}
                    id={lead.id}
                    name={lead.name}
                    columnStatus={lead.columnStatus}
                    budget={lead.budget}
                    currency={lead.currency}
                    desiredLocation={lead.desiredLocation}
                    taskType={lead.taskType}
                    createdAt={lead.createdAt}
                    nextFollowUpDate={lead.nextFollowUpDate}
                    phone={lead.phone}
                    email={lead.email}
                    onClick={handleLeadClick}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="fixed bottom-6 right-6 z-50 hidden md:block">
        <button 
          onClick={handleAddLead} 
          className="text-white h-14 w-14 rounded-full flex items-center justify-center shadow-lg transition-colors bg-zinc-900 hover:bg-zinc-800"
        >
          <PlusCircle className="h-6 w-6" />
        </button>
      </div>
      
      {filtersOpen && (
        <Sheet open={filtersOpen} onOpenChange={toggleFilters}>
          <PipelineFilters 
            filters={filters}
            onFilterChange={onFilterChange}
            onClearFilters={onClearFilters}
            assignedToOptions={teamMembers}
            isFilterActive={isFilterActive}
            isMobile={false}
            onApplyFilters={handleApplyFilters}
          />
        </Sheet>
      )}
    </div>
  );
};

export default DesktopPipelineView;
