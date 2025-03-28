import React, { useState, useEffect } from 'react';
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

const statusTranslations: Record<LeadStatus, string> = {
  'New': 'Nouveaux',
  'Contacted': 'Contactés',
  'Qualified': 'Qualifiés',
  'Proposal': 'Propositions',
  'Visit': 'Visites en cours',
  'Offer': 'Offre en cours',
  'Offre': 'Offre en cours',
  'Deposit': 'Dépôt reçu',
  'Signed': 'Signature finale',
  'Gagné': 'Conclus',
  'Perdu': 'Perdu'
};

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
  const navigate = useNavigate();
  
  const {
    loadedColumns,
    isLoading
  } = useKanbanData(columns, 0, activeTab as PipelineType);
  
  const filteredColumns = filters 
    ? applyFiltersToColumns(loadedColumns.filter(column => 
        !column.pipelineType || column.pipelineType === activeTab
      ), filters)
    : loadedColumns.filter(column => 
        !column.pipelineType || column.pipelineType === activeTab
      );

  useEffect(() => {
    if (filters?.status !== null) {
      setActiveStatus(filters.status);
    }
  }, [filters]);
  
  const allLeads = filteredColumns.flatMap(column => column.items.map(item => ({
    ...item,
    columnStatus: column.status
  })));
  
  const leadCountByStatus = filteredColumns.reduce((acc, column) => {
    acc[column.status] = column.items.length;
    return acc;
  }, {} as Record<string, number>);
  
  const totalLeadCount = allLeads.length;
  
  const displayedLeads = activeStatus === 'all' 
    ? allLeads 
    : allLeads.filter(lead => lead.columnStatus === activeStatus);
  
  const searchFilteredLeads = searchTerm 
    ? displayedLeads.filter(item => 
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.desiredLocation?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : displayedLeads;
  
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
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <h1 className="tracking-tight text-base font-medium">Pipeline</h1>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-md h-10 w-10 bg-white" 
              onClick={handleAddLead}
            >
              <PlusCircle className="h-5 w-5" />
            </Button>
            <Button 
              variant={activeFiltersCount > 0 ? "default" : "outline"} 
              size="sm" 
              onClick={toggleFilters} 
              className="h-10 px-4 rounded-md relative bg-white text-black border border-zinc-200"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filtres
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-zinc-900 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        <div className="relative w-full bg-gray-100 rounded-md flex items-center">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher un lead..."
            className="pl-9 pr-12 bg-gray-100 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

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
      
      <div className="relative flex-1 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden mt-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">Chargement des leads...</p>
          </div>
        ) : (
          <div className="h-full overflow-y-auto p-4">
            {searchFilteredLeads.length === 0 ? (
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
                {searchFilteredLeads.map(lead => (
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
