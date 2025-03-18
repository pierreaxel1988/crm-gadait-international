
import React, { useState } from 'react';
import { ChevronRight, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Drawer, DrawerContent, DrawerTrigger, DrawerClose } from '@/components/ui/drawer';
import { Card, CardContent } from '@/components/ui/card';
import { FilterOptions } from './PipelineFilters';
import { LeadStatus } from '@/components/common/StatusBadge';
import KanbanCard, { KanbanItem } from '@/components/kanban/KanbanCard';
import StatusBadge from '@/components/kanban/card/StatusBadge';

interface MobilePipelineViewProps {
  columns: {
    title: string;
    status: LeadStatus;
    items: KanbanItem[];
  }[];
  filters: FilterOptions;
  pipelineType: 'purchase' | 'rental';
  onToggleFilters: () => void;
  activeFilters: number;
}

const MobilePipelineView: React.FC<MobilePipelineViewProps> = ({
  columns,
  filters,
  pipelineType,
  onToggleFilters,
  activeFilters
}) => {
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus | null>(null);
  
  // Get items for the selected status
  const selectedItems = selectedStatus
    ? columns.find(col => col.status === selectedStatus)?.items || []
    : [];

  // Non-empty columns first, then alphabetically
  const sortedColumns = [...columns].sort((a, b) => {
    // First sort by whether they have items (non-empty first)
    if (a.items.length > 0 && b.items.length === 0) return -1;
    if (a.items.length === 0 && b.items.length > 0) return 1;
    // Then sort alphabetically
    return a.title.localeCompare(b.title);
  });

  return (
    <div className="mt-2">
      {/* Display filter button */}
      <div className="flex items-center justify-between mb-3">
        <Button variant="outline" size="sm" onClick={onToggleFilters} className={`flex items-center gap-1.5 ${activeFilters > 0 ? 'border-blue-500 text-blue-500' : ''}`}>
          <Filter className="h-4 w-4" />
          Filtres
          {activeFilters > 0 && (
            <span className="ml-1 rounded-full bg-blue-500 text-white text-xs px-1.5 py-0.5">
              {activeFilters}
            </span>
          )}
        </Button>
      </div>

      {/* Stage selection cards */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {sortedColumns.map((column) => (
          <Card 
            key={column.status}
            className={`border cursor-pointer transition-all ${selectedStatus === column.status ? 'border-blue-500 shadow-md' : 'border-border'}`}
            onClick={() => setSelectedStatus(column.status)}
          >
            <CardContent className="p-3 flex flex-col items-center">
              <div className="flex items-center justify-between w-full">
                <StatusBadge status={column.status} />
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-xs font-medium text-primary">
                  {column.items.length}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Drawer for viewing stage contents */}
      {selectedStatus && (
        <Drawer>
          <DrawerTrigger asChild>
            <Button className="w-full mb-4 flex items-center justify-between">
              <span>Voir {columns.find(col => col.status === selectedStatus)?.title} ({selectedItems.length})</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </DrawerTrigger>
          <DrawerContent className="px-4 pb-6">
            <div className="p-4 flex justify-between items-center border-b">
              <h3 className="text-lg font-medium">
                {columns.find(col => col.status === selectedStatus)?.title} 
                <span className="ml-2 inline-flex items-center justify-center rounded-full bg-primary/10 px-2 text-xs font-medium text-primary">
                  {selectedItems.length}
                </span>
              </h3>
              <DrawerClose asChild>
                <Button variant="ghost" size="sm">Fermer</Button>
              </DrawerClose>
            </div>
            
            <div className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto px-1">
              {selectedItems.length > 0 ? (
                selectedItems.map((item) => (
                  <KanbanCard 
                    key={item.id} 
                    item={item} 
                    pipelineType={pipelineType}
                  />
                ))
              ) : (
                <div className="flex items-center justify-center h-24 border border-dashed border-border rounded-md">
                  <p className="text-sm text-muted-foreground">Aucun lead à cette étape</p>
                </div>
              )}
            </div>
            
            <div className="mt-4">
              <Button 
                className="w-full"
                onClick={() => navigate('/leads/new')}
              >
                Ajouter un lead
              </Button>
            </div>
          </DrawerContent>
        </Drawer>
      )}

      {/* Message when no status is selected */}
      {!selectedStatus && (
        <div className="flex flex-col items-center justify-center p-8 border border-dashed border-border rounded-md">
          <p className="text-muted-foreground text-center mb-4">
            Sélectionnez une étape du pipeline pour voir les leads
          </p>
          <Button 
            variant="outline"
            onClick={() => navigate('/leads/new')}
          >
            Ajouter un nouveau lead
          </Button>
        </div>
      )}
    </div>
  );
};

export default MobilePipelineView;
