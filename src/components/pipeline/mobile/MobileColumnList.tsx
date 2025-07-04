import React, { useState, useEffect } from 'react';
import { PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LeadStatus } from '@/components/common/StatusBadge';
import { FilterOptions } from '../PipelineFilters';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PipelineType } from '@/types/lead';
import { useKanbanData } from '@/hooks/useKanbanData';
import LeadListItem from './LeadListItem';
import { applyFiltersToColumns } from '@/utils/kanbanFilterUtils';
import { sortLeadsByPriority } from './utils/leadSortUtils';
import LoadingScreen from '@/components/layout/LoadingScreen';

const statusTranslations: Record<LeadStatus, string> = {
  'New': 'Nouveaux',
  'Contacted': 'Contactés',
  'Qualified': 'Qualifiés',
  'Proposal': 'Propositions',
  'Visit': 'Visites en cours',
  'Offre': 'Offre en cours',
  'Deposit': 'Dépôt reçu',
  'Signed': 'Signature finale',
  'Gagné': 'Conclus',
  'Perdu': 'Perdu',
  'Deleted': 'Supprimé'
};

interface MobileColumnListProps {
  columns: Array<{
    title: string;
    status: LeadStatus;
    items: any[];
    pipelineType?: PipelineType;
  }>;
  expandedColumn?: LeadStatus | null;
  toggleColumnExpand?: (status: LeadStatus) => void;
  activeTab?: PipelineType;
  searchTerm?: string;
  filters?: FilterOptions;
}

const MobileColumnList = ({ columns, expandedColumn = null, toggleColumnExpand = () => {}, activeTab = 'purchase', searchTerm, filters }: MobileColumnListProps) => {
  const [activeStatus, setActiveStatus] = useState<LeadStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'newest' | 'oldest'>('priority');
  const navigate = useNavigate();
  
  const {
    loadedColumns,
    isLoading,
    teamMembers
  } = useKanbanData(activeTab, 0, filters);
  
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

  const leadsByStatus = activeStatus === 'all' 
    ? filteredColumns.flatMap(column => column.items.map(item => ({
        ...item,
        columnStatus: column.status
      })))
    : filteredColumns
        .filter(column => column.status === activeStatus)
        .flatMap(column => column.items.map(item => ({
          ...item,
          columnStatus: column.status
        })));
  
  const searchFilteredLeads = searchTerm
    ? leadsByStatus.filter(lead => 
        lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.desiredLocation?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : leadsByStatus;
    
  const sortedLeads = sortLeadsByPriority(searchFilteredLeads, sortBy);

  useEffect(() => {
    console.log('Team Members in MobileColumnList:', teamMembers);
    console.log('First few leads:', sortedLeads.slice(0, 3).map(lead => ({
      name: lead.name,
      assignedTo: lead.assignedTo,
      assignedToName: teamMembers?.find(m => m.id === lead.assignedTo)?.name
    })));
  }, [teamMembers, sortedLeads]);

  const leadCountByStatus = filteredColumns.reduce((acc, column) => {
    const countForStatus = column.items.length;
    
    acc[column.status] = countForStatus;
    return acc;
  }, {} as Record<string, number>);
  
  const totalLeadCount = leadsByStatus.length;

  const handleAddLead = (status: LeadStatus) => {
    navigate(`/leads/new?pipeline=${activeTab}&status=${status}`);
  };

  const handleLeadClick = (leadId: string) => {
    navigate(`/leads/${leadId}?tab=criteria`);
  };
  
  const handleChangeSortBy = (value: 'priority' | 'newest' | 'oldest') => {
    setSortBy(value);
  };

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <LoadingScreen fullscreen={false} />
        </div>
      ) : (
        <>
          <div className="sticky top-[calc(var(--header-height)-1px)] pt-3 pb-3 z-40 bg-gray-50">
            <div className="overflow-x-auto pb-1">
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

            <div className="flex flex-col md:flex-row md:items-center gap-2 bg-gray-50 rounded-lg p-2 mt-2">
              <div className="flex items-center justify-between md:w-auto">
                <span className="text-sm font-medium text-gray-700">Trier par:</span>
                <div className="flex space-x-1 flex-wrap">
                  <button 
                    onClick={() => handleChangeSortBy('priority')}
                    className={`px-2 py-1 text-xs rounded-md ${sortBy === 'priority' 
                      ? 'bg-zinc-900 text-white' 
                      : 'bg-gray-100 text-gray-600'}`}
                  >
                    Priorité
                  </button>
                  <button 
                    onClick={() => handleChangeSortBy('newest')}
                    className={`px-2 py-1 text-xs rounded-md ${sortBy === 'newest' 
                      ? 'bg-zinc-900 text-white' 
                      : 'bg-gray-100 text-gray-600'}`}
                  >
                    Plus récent
                  </button>
                  <button 
                    onClick={() => handleChangeSortBy('oldest')}
                    className={`px-2 py-1 text-xs rounded-md ${sortBy === 'oldest' 
                      ? 'bg-zinc-900 text-white' 
                      : 'bg-gray-100 text-gray-600'}`}
                  >
                    Plus ancien
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-px">
            {sortedLeads.length === 0 ? (
              <div className="flex items-center justify-center h-40 border border-dashed border-border rounded-md bg-white">
                <div className="text-center">
                  <p className="text-sm text-zinc-900 font-medium">Aucun lead trouvé</p>
                  <button 
                    onClick={() => handleAddLead(activeStatus === 'all' ? 'New' : activeStatus)} 
                    className="mt-2 text-zinc-900 hover:text-zinc-700 text-sm flex items-center justify-center mx-auto"
                  >
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Ajouter un lead
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-slate-200 divide-y shadow-sm">
                {sortedLeads.map(lead => {
                  if (lead.name && lead.name.includes("HEINRICH SCHEMBERG")) {
                    console.log("Found HEINRICH SCHEMBERG:", lead);
                    console.log("Team members:", teamMembers);
                    console.log("Assigned agent:", 
                      teamMembers?.find(member => member.id === lead.assignedTo)?.name);
                  }
                  
                  return (
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
                      assignedTo={lead.assignedTo ? 
                        teamMembers?.find(member => member.id === lead.assignedTo)?.name : 
                        undefined}
                      onClick={handleLeadClick}
                    />
                  );
                })}
              </div>
            )}
          </div>
          
          <div className="fixed bottom-20 right-6 z-50 md:hidden">
            <button 
              onClick={() => handleAddLead(activeStatus === 'all' ? 'New' : activeStatus)} 
              className="text-white h-14 w-14 rounded-full flex items-center justify-center shadow-lg transition-colors bg-zinc-900 hover:bg-zinc-800"
            >
              <PlusCircle className="h-6 w-6" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default MobileColumnList;
