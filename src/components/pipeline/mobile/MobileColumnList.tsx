
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
import { useAuth } from '@/hooks/useAuth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

const MobileColumnList = ({
  columns,
  expandedColumn = null,
  toggleColumnExpand = () => {},
  activeTab = 'purchase',
  searchTerm,
  filters
}: MobileColumnListProps) => {
  const [activeStatus, setActiveStatus] = useState<LeadStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'newest' | 'oldest'>('priority');
  const [selectedCommercial, setSelectedCommercial] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isCommercial, isAdmin } = useAuth();
  
  const {
    loadedColumns,
    isLoading,
    teamMembers
  } = useKanbanData(columns, 0, activeTab);
  
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

  // First, filter by status
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
  
  // Then filter by commercial if one is selected
  const leadsByCommercial = selectedCommercial 
    ? leadsByStatus.filter(lead => lead.assignedToId === selectedCommercial)
    : leadsByStatus;

  // Apply search filter
  const searchFilteredLeads = searchTerm
    ? leadsByCommercial.filter(lead => 
        lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.desiredLocation?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : leadsByCommercial;
    
  // Apply smart sorting based on priority
  const sortedLeads = sortLeadsByPriority(searchFilteredLeads, sortBy);

  // Calculate counts for each status after commercial filtering
  const leadCountByStatus = filteredColumns.reduce((acc, column) => {
    const countForStatus = selectedCommercial
      ? column.items.filter(item => item.assignedToId === selectedCommercial).length
      : column.items.length;
    
    acc[column.status] = countForStatus;
    return acc;
  }, {} as Record<string, number>);
  
  const totalLeadCount = selectedCommercial
    ? leadsByStatus.filter(lead => lead.assignedToId === selectedCommercial).length
    : leadsByStatus.length;

  const handleAddLead = (status: LeadStatus) => {
    navigate(`/leads/new?pipeline=${activeTab}&status=${status}`);
  };

  const handleLeadClick = (leadId: string) => {
    // Navigate to lead detail page with criteria tab preselected
    navigate(`/leads/${leadId}?tab=criteria`);
  };
  
  const handleChangeSortBy = (value: 'priority' | 'newest' | 'oldest') => {
    setSortBy(value);
  };

  const handleCommercialChange = (value: string) => {
    setSelectedCommercial(value === "all" ? null : value);
  };

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <p className="text-sm text-muted-foreground">Chargement des leads...</p>
        </div>
      ) : (
        <>
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

          <div className="flex flex-col md:flex-row md:items-center gap-2 bg-gray-50 rounded-lg p-2 mb-2">
            <div className="flex items-center justify-between md:w-auto">
              <span className="text-sm font-medium text-gray-700">Trier par:</span>
              <div className="flex space-x-2">
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
            
            {isAdmin && teamMembers && teamMembers.length > 0 && (
              <div className="flex items-center mt-2 md:mt-0 md:ml-auto">
                <div className="w-full">
                  <Select value={selectedCommercial || "all"} onValueChange={handleCommercialChange}>
                    <SelectTrigger className="w-full text-xs h-8 px-2">
                      <SelectValue placeholder="Filtrer par commercial" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les commerciaux</SelectItem>
                      {teamMembers.map(member => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
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
