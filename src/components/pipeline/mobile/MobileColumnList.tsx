
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LeadListItem from './LeadListItem';
import { PipelineType } from '@/types/lead';
import { formatDateTime } from '@/utils/dateFormatters';

interface MobileColumnListProps {
  columns: any[];
  activeTab: PipelineType;
  searchTerm: string;
  filters: any;
}

const MobileColumnList = ({ columns, activeTab, searchTerm, filters }: MobileColumnListProps) => {
  const navigate = useNavigate();
  const [expandedColumns, setExpandedColumns] = useState<{ [key: string]: boolean }>({});
  
  const toggleColumn = (columnId: string) => {
    setExpandedColumns(prevState => ({
      ...prevState,
      [columnId]: !prevState[columnId]
    }));
  };
  
  const handleLeadClick = (leadId: string) => {
    navigate(`/leads/${leadId}?tab=criteria`);
  };
  
  // Filtrer pour n'afficher que les colonnes qui contiennent des leads
  const nonEmptyColumns = columns.filter(column => 
    column.items && column.items.length > 0
  );
  
  return (
    <div className="divide-y divide-zinc-100">
      {nonEmptyColumns.map(column => {
        const isExpanded = expandedColumns[column.id] !== false;
        const columnItems = column.items || [];
        
        return (
          <div key={column.id} className="mb-4">
            <div 
              className="flex justify-between items-center py-2 px-1"
              onClick={() => toggleColumn(column.id)}
            >
              <h2 className="text-sm font-medium text-zinc-800">
                {column.title} <span className="text-zinc-500">({columnItems.length})</span>
              </h2>
              <button className="text-zinc-400 focus:outline-none">
                {isExpanded ? '▲' : '▼'}
              </button>
            </div>
            
            {isExpanded && columnItems.map((item: any) => (
              <LeadListItem
                key={item.id}
                id={item.id}
                name={item.name}
                columnStatus={column.id}
                budget={item.budget}
                currency={item.currency}
                desiredLocation={item.desiredLocation}
                taskType={item.taskType}
                createdAt={item.createdAt}
                nextFollowUpDate={item.nextFollowUpDate}
                phone={item.phone}
                email={item.email}
                assignedTo={item.assignedToName}
                onClick={handleLeadClick}
                tags={item.tags} // Ajout des tags
              />
            ))}
          </div>
        );
      })}
      
      {nonEmptyColumns.length === 0 && (
        <div className="py-8 flex flex-col items-center justify-center text-center">
          <p className="text-zinc-500">
            Aucun lead ne correspond aux filtres sélectionnés
          </p>
        </div>
      )}
    </div>
  );
};

export default MobileColumnList;
