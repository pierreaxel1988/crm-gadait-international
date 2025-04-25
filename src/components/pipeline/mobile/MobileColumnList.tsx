import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKanbanData } from '@/hooks/useKanbanData';
import { applyFiltersToColumns } from '@/utils/kanbanFilterUtils';
import { PipelineType } from '@/types/lead';
import { sortLeadsByPriority } from './utils/leadSortUtils';
import LeadListItem from './LeadListItem';
import { SortBy } from '../types/pipelineTypes';
import { FilterOptions } from '@/components/filters/PipelineFilters';

interface MobileColumnListProps {
  columns: any[];
  activeTab: PipelineType;
  searchTerm: string;
  filters: FilterOptions;
}

const MobileColumnList: React.FC<MobileColumnListProps> = ({ columns, activeTab, searchTerm, filters }) => {
  const [sortBy, setSortBy] = useState<SortBy>('priority');
  const navigate = useNavigate();

  const {
    loadedColumns,
    isLoading,
  } = useKanbanData(columns, 0, activeTab);

  const filteredColumns = filters
    ? applyFiltersToColumns(loadedColumns.filter(column =>
        !column.pipelineType || column.pipelineType === activeTab
      ), filters)
    : loadedColumns.filter(column =>
        !column.pipelineType || column.pipelineType === activeTab
      );

  const displayedLeads = filteredColumns.flatMap(column => column.items);

  const searchFilteredLeads = searchTerm
    ? displayedLeads.filter(item =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.desiredLocation?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : displayedLeads;

  const sortedLeads = sortLeadsByPriority(searchFilteredLeads, sortBy);

  const handleLeadClick = (leadId: string) => {
    navigate(`/leads/${leadId}`);
  };

  return (
    <div>
      {filteredColumns.map(column => (
        <div key={column.status} className="mb-6">
          <h2 className="text-lg font-semibold mb-2">{column.title}</h2>
          {sortedLeads.filter(lead => lead.status === column.status).map(lead => (
            <LeadListItem key={lead.id} lead={lead} onClick={() => handleLeadClick(lead.id)} />
          ))}
        </div>
      ))}
    </div>
  );
};

export default MobileColumnList;
