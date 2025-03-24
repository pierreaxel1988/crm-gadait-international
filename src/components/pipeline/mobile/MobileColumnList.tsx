
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import KanbanCard, { KanbanItem } from '@/components/kanban/KanbanCard';
import { LeadStatus } from '@/components/common/StatusBadge';
import { FilterOptions } from '../PipelineFilters';

// Map English status to French translations
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
    items: KanbanItem[];
    pipelineType?: 'purchase' | 'rental';
  }>;
  expandedColumn?: LeadStatus | null;
  toggleColumnExpand?: (status: LeadStatus) => void;
  activeTab?: string;
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
  // Local state for expanded columns if not provided
  const [localExpandedColumn, setLocalExpandedColumn] = useState<LeadStatus | null>(null);
  
  // Use provided or local state
  const currentExpandedColumn = expandedColumn !== undefined ? expandedColumn : localExpandedColumn;
  const handleToggleExpand = (status: LeadStatus) => {
    if (toggleColumnExpand) {
      toggleColumnExpand(status);
    } else {
      setLocalExpandedColumn(currentExpandedColumn === status ? null : status);
    }
  };
  
  return (
    <div className="space-y-3">
      {columns.map((column) => (
        <MobileColumn
          key={column.status}
          column={column}
          isExpanded={currentExpandedColumn === column.status}
          onToggleExpand={() => handleToggleExpand(column.status)}
          activeTab={activeTab}
        />
      ))}
    </div>
  );
};

interface MobileColumnProps {
  column: {
    title: string;
    status: LeadStatus;
    items: KanbanItem[];
    pipelineType?: 'purchase' | 'rental';
  };
  isExpanded: boolean;
  onToggleExpand: () => void;
  activeTab: string;
}

const MobileColumn = ({ column, isExpanded, onToggleExpand, activeTab }: MobileColumnProps) => {
  const navigate = useNavigate();
  
  const handleAddLead = (e: React.MouseEvent) => {
    e.stopPropagation(); // Empêche le déclenchement du toggle lorsqu'on clique sur l'icône
    navigate(`/leads/new?pipeline=${activeTab}&status=${column.status}`);
  };
  
  return (
    <div className="bg-white rounded-md border border-slate-200 overflow-hidden">
      <div 
        className="flex items-center justify-between p-3 border-b cursor-pointer"
        onClick={onToggleExpand}
      >
        <div className="flex items-center gap-2">
          <h3 className="font-futura">
            {statusTranslations[column.status] || column.status}
          </h3>
          <div className="flex items-center">
            <span className="inline-flex items-center justify-center rounded-full bg-primary/10 text-primary text-xs px-1.5 font-futura">
              {column.items.length}
            </span>
            <button 
              onClick={handleAddLead}
              className="ml-1 text-primary hover:text-primary/80"
              aria-label={`Ajouter un lead dans ${statusTranslations[column.status] || column.status}`}
            >
              <PlusCircle className="h-4 w-4" />
            </button>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
      
      {isExpanded && (
        <div className="p-3 space-y-3 animate-fade-in">
          {column.items.length > 0 ? (
            column.items.map((item) => (
              <KanbanCard 
                key={item.id} 
                item={item} 
                pipelineType={activeTab as 'purchase' | 'rental'} 
              />
            ))
          ) : (
            <div className="flex items-center justify-center h-20 border border-dashed border-border rounded-md">
              <p className="text-sm text-muted-foreground font-futura">Aucun lead à cette étape</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MobileColumnList;
