
import React from 'react';
import { useKanbanData } from '@/hooks/useKanbanData';
import KanbanBoard from '@/components/kanban/KanbanBoard';
import { PipelineType } from '@/types/lead';
import { FilterOptions } from '../types/filterTypes';

interface MobileColumnListProps {
  columns: any[];
  activeTab: PipelineType;
  searchTerm?: string;
  filters?: FilterOptions;
}

const MobileColumnList: React.FC<MobileColumnListProps> = ({ columns, activeTab, searchTerm, filters }) => {
  const { loadedColumns, isLoading, refreshTrigger } = useKanbanData(
    columns, 
    0, 
    activeTab,
    searchTerm
  );
  
  console.log(`MobileColumnList for ${activeTab} - ${loadedColumns.length} columns`);
  
  return (
    <KanbanBoard 
      columns={loadedColumns}
      pipelineType={activeTab} 
      filters={filters}
      refreshTrigger={refreshTrigger}
      isLoading={isLoading}
      className="pb-20"
    />
  );
};

export default MobileColumnList;
