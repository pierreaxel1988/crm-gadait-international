
import React, { useState, useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { X, Filter } from 'lucide-react';
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
import { useDebounce } from '@/hooks/useDebounce';

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
  'Perdu': 'Perdu',
  'Gagné': 'Conclus'
};

const statusOrder = ['New', 'Contacted', 'Qualified', 'Proposal', 'Visit', 'Offer', 'Offre', 'Deposit', 'Signed', 'Perdu', 'Gagné'];

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
  teamMembers,
  refreshTrigger
}) => {
  const [activeStatus, setActiveStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortBy>('priority');
  const navigate = useNavigate();
  
  // Debounce search term like in Actions page
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const pipelines = [
    { label: "Achat", value: "purchase" },
    { label: "Location", value: "rental" },
    { label: "Propriétaires", value: "owners" },
  ];

  const {
    loadedColumns,
    isLoading,
  } = useKanbanData(activeTab as PipelineType, refreshTrigger, filters);

  const filteredColumns = filters 
    ? applyFiltersToColumns(loadedColumns.filter(column => 
        !column.pipelineType || column.pipelineType === activeTab
      ), filters)
    : loadedColumns.filter(column => 
        !column.pipelineType || column.pipelineType === activeTab
      );

  // Enhanced client-side search filtering like Actions page
  const filteredLeadsWithSearch = useMemo(() => {
    const leadsByStatus = filteredColumns.flatMap(column => column.items.map(item => ({
      ...item,
      columnStatus: column.status
    })));
    
    const displayedLeads = activeStatus === 'all' 
      ? leadsByStatus 
      : leadsByStatus.filter(lead => lead.columnStatus === activeStatus);
    
    // Enhanced search filtering like Actions page
    if (!debouncedSearchTerm) return displayedLeads;
    
    const searchLower = debouncedSearchTerm.toLowerCase();
    return displayedLeads.filter(item => 
      item.name?.toLowerCase().includes(searchLower) ||
      item.email?.toLowerCase().includes(searchLower) ||
      item.phone?.toLowerCase().includes(searchLower) ||
      item.desiredLocation?.toLowerCase().includes(searchLower) ||
      item.nationality?.toLowerCase().includes(searchLower) ||
      item.source?.toLowerCase().includes(searchLower)
    );
  }, [filteredColumns, activeStatus, debouncedSearchTerm]);
    
  const sortedLeads = sortLeadsByPriority(filteredLeadsWithSearch, sortBy);
  
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
  
  const totalLeadCount = filteredLeadsWithSearch.length;

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
              {filteredColumns
                .sort((a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status))
                .map(column => 
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

      {/* Full screen filters sheet for all devices */}
      {filtersOpen && (
        <Sheet open={filtersOpen} onOpenChange={toggleFilters}>
          <SheetContent side="bottom" className="h-screen w-full p-0 rounded-t-none bg-white">
            <div className="flex flex-col h-full">
              <SheetHeader className="px-6 py-4 border-b bg-white sticky top-0 z-10">
                <div className="flex items-center justify-between">
                  <SheetTitle className="text-lg font-medium text-gray-900">Filtres</SheetTitle>
                  <SheetClose asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <X className="h-4 w-4" />
                      <span className="sr-only">Fermer</span>
                    </Button>
                  </SheetClose>
                </div>
              </SheetHeader>
              <ScrollArea className="flex-1 px-6 bg-white">
                <div className="py-4">
                  <PipelineFilters 
                    filters={filters}
                    onFilterChange={onFilterChange}
                    onClearFilters={onClearFilters}
                    assignedToOptions={teamMembers}
                    isFilterActive={isFilterActive}
                    isMobile={false}
                    onApplyFilters={handleApplyFilters}
                  />
                </div>
              </ScrollArea>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
};

export default DesktopPipelineView;
