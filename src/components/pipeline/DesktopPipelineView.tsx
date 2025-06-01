import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet } from '@/components/ui/sheet';
import PipelineFilters from './PipelineFilters';
import { useKanbanData } from '@/hooks/useKanbanData';
import { useNavigate } from 'react-router-dom';
import { applyFiltersToColumns } from '@/utils/kanbanFilterUtils';
import PipelineHeader from './PipelineHeader';
import { sortLeadsByPriority } from './mobile/utils/leadSortUtils';
import SortingControls from './components/SortingControls';
import LeadsList from './components/LeadsList';
import AddLeadButton from './components/AddLeadButton';
import { DesktopPipelineViewProps, SortBy } from './types/pipelineTypes';
import { PipelineType } from '@/types/lead';

const statusTranslations: Record<string, string> = {
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
  const [activeStatus, setActiveStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortBy>('priority');
  const navigate = useNavigate();

  const pipelines = [
    { label: "Achat", value: "purchase" },
    { label: "Location", value: "rental" },
    { label: "Propriétaires", value: "owners" },
  ];

  const {
    loadedColumns,
    isLoading,
  } = useKanbanData();

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

  const leadCountByStatus = filteredColumns.reduce((acc, column) => {
    const countForStatus = column.items.length;
    acc[column.status] = countForStatus;
    return acc;
  }, {} as Record<string, number>);
  
  const totalLeadCount = leadsByStatus.length;

  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-20 bg-white pb-4 border-b space-y-4">
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
          <TabsList className="bg-gray-100 p-1 rounded-xl w-fit">
            {pipelines.map(pipeline => (
              <TabsTrigger
                key={pipeline.value}
                value={pipeline.value}
                className="flex-1 rounded-lg text-sm font-medium text-zinc-700 data-[state=active]:text-zinc-900 data-[state=active]:bg-white"
              >
                {pipeline.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        
        <div className="overflow-x-auto pb-3">
          <Tabs 
            value={activeStatus} 
            onValueChange={setActiveStatus} 
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
      </div>
      
      <SortingControls 
        sortBy={sortBy} 
        onSortChange={setSortBy} 
      />
      
      <div className="overflow-y-auto">
        <LeadsList 
          leads={sortedLeads}
          isLoading={isLoading}
          onLeadClick={handleLeadClick}
          onAddLead={handleAddLead}
          teamMembers={teamMembers}
        />
      </div>
      
      <AddLeadButton onClick={handleAddLead} />
      
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
