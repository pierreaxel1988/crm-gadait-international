
import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import KanbanCard, { KanbanItem } from '@/components/kanban/KanbanCard';
import { LeadStatus } from '@/components/common/StatusBadge';

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
  expandedColumn: LeadStatus | null;
  toggleColumnExpand: (status: LeadStatus) => void;
  activeTab: string;
}

const MobileColumnList = ({ 
  columns, 
  expandedColumn, 
  toggleColumnExpand,
  activeTab 
}: MobileColumnListProps) => {
  return (
    <div className="space-y-3">
      {columns.map((column) => (
        <MobileColumn
          key={column.status}
          column={column}
          isExpanded={expandedColumn === column.status}
          onToggleExpand={() => toggleColumnExpand(column.status)}
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
  return (
    <div className="bg-white rounded-md border border-slate-200 overflow-hidden">
      <div 
        className="flex items-center justify-between p-3 border-b cursor-pointer"
        onClick={onToggleExpand}
      >
        <div className="flex items-center gap-2">
          <h3 className="font-futura">
            {statusTranslations[column.status]}
          </h3>
          <span className="inline-flex items-center justify-center rounded-full bg-primary/10 text-primary text-xs px-1.5 font-futura">
            {column.items.length}
          </span>
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
