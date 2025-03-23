
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import KanbanCard, { KanbanItem } from '@/components/kanban/KanbanCard';
import SearchInput from '@/components/reports/table/SearchInput';
import { FilterOptions } from '@/components/pipeline/PipelineFilters';
import { LeadStatus } from '@/components/common/StatusBadge';
import { cn } from '@/lib/utils';

interface MobilePipelineViewProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filtersOpen: boolean;
  toggleFilters: () => void;
  activeFiltersCount: number;
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onClearFilters: () => void;
  columns: Array<{
    title: string;
    status: LeadStatus;
    items: KanbanItem[];
    pipelineType?: 'purchase' | 'rental';
  }>;
  handleRefresh: () => void;
  isRefreshing: boolean;
}

const MobilePipelineView = ({
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
}: MobilePipelineViewProps) => {
  const navigate = useNavigate();
  const [expandedColumn, setExpandedColumn] = useState<LeadStatus | null>(null);

  const toggleColumnExpand = (status: LeadStatus) => {
    if (expandedColumn === status) {
      setExpandedColumn(null);
    } else {
      setExpandedColumn(status);
    }
  };

  const handleAddLead = () => {
    navigate(`/leads/new?pipeline=${activeTab}`);
  };

  const getColumnItems = (status: LeadStatus) => {
    const column = columns.find(col => col.status === status);
    return column ? column.items : [];
  };

  return (
    <div className="space-y-4">
      {/* En-tête avec recherche */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <SearchInput
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onClearSearch={() => setSearchTerm('')}
          />
          
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className={cn(
                  "ml-2", 
                  (filtersOpen || activeFiltersCount > 0) && "text-primary border-primary"
                )}
              >
                <Filter className="h-4 w-4" />
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[85vh]">
              <div className="py-6">
                <h3 className="text-lg font-futura mb-4">Filtres</h3>
                {/* Intégrer PipelineFilters ici */}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Navigation par onglets */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="purchase" className="font-futura">Achat</TabsTrigger>
            <TabsTrigger value="rental" className="font-futura">Location</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Vue colonnes */}
      <div className="space-y-3">
        {columns.map((column) => (
          <div 
            key={column.status} 
            className="bg-white rounded-md border border-slate-200 overflow-hidden"
          >
            <div 
              className="flex items-center justify-between p-3 border-b cursor-pointer"
              onClick={() => toggleColumnExpand(column.status)}
            >
              <div className="flex items-center gap-2">
                <h3 className="font-futura">{column.title}</h3>
                <span className="inline-flex items-center justify-center rounded-full bg-primary/10 text-primary text-xs px-1.5 font-futura">
                  {column.items.length}
                </span>
              </div>
              {expandedColumn === column.status ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            
            {expandedColumn === column.status && (
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
        ))}
      </div>

      {/* Bouton flottant pour ajouter un lead */}
      <Drawer>
        <DrawerTrigger asChild>
          <Button
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-loro-terracotta hover:bg-loro-500 p-0 flex items-center justify-center"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-futura">Actions rapides</h3>
            <div className="grid gap-2">
              <Button onClick={handleAddLead} className="w-full justify-start font-futura">
                <Plus className="mr-2 h-4 w-4" />
                Nouveau lead
              </Button>
              <Button variant="outline" onClick={handleRefresh} className="w-full justify-start font-futura">
                {isRefreshing ? "Rafraîchissement..." : "Rafraîchir les données"}
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default MobilePipelineView;
