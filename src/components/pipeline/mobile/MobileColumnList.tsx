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
const MobileColumnList = ({
  columns,
  expandedColumn = null,
  toggleColumnExpand = () => {},
  activeTab = 'purchase',
  searchTerm,
  filters
}: MobileColumnListProps) => {
  const [activeStatus, setActiveStatus] = useState<LeadStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'newest' | 'oldest' | 'stage' | 'urgency' | 'importance' | 'budget'>('priority');
  const navigate = useNavigate();
  const {
    loadedColumns,
    isLoading,
    teamMembers
  } = useKanbanData(activeTab, 0, filters);
  const filteredColumns = filters ? applyFiltersToColumns(loadedColumns.filter(column => !column.pipelineType || column.pipelineType === activeTab), filters) : loadedColumns.filter(column => !column.pipelineType || column.pipelineType === activeTab);
  useEffect(() => {
    if (filters?.status !== null) {
      setActiveStatus(filters.status);
    }
  }, [filters]);
  const leadsByStatus = activeStatus === 'all' ? filteredColumns.flatMap(column => column.items.map(item => ({
    ...item,
    columnStatus: column.status
  }))) : filteredColumns.filter(column => column.status === activeStatus).flatMap(column => column.items.map(item => ({
    ...item,
    columnStatus: column.status
  })));
  const searchFilteredLeads = searchTerm ? leadsByStatus.filter(lead => lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) || lead.desiredLocation?.toLowerCase().includes(searchTerm.toLowerCase())) : leadsByStatus;
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
  const handleChangeSortBy = (value: 'priority' | 'newest' | 'oldest' | 'stage' | 'urgency' | 'importance' | 'budget') => {
    setSortBy(value);
  };
  return;
};
export default MobileColumnList;