
import React, { useState, useEffect, useMemo } from 'react';
import { Filter, Plus, Settings, Home, Key, X, RefreshCcw } from 'lucide-react';
import KanbanBoard from '@/components/kanban/KanbanBoard';
import { KanbanItem } from '@/components/kanban/KanbanCard';
import CustomButton from '@/components/ui/CustomButton';
import { LeadStatus } from '@/components/common/StatusBadge';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from '@/hooks/use-mobile';
import FloatingActionButtons from '@/components/ui/FloatingActionButtons';
import PipelineFilters, { FilterOptions } from '@/components/pipeline/PipelineFilters';
import { LeadTag } from '@/components/common/TagBadge';
import TagBadge from '@/components/common/TagBadge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const Kanban = () => {
  const [activeTab, setActiveTab] = useState<string>("purchase");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Initialize filter state
  const [filters, setFilters] = useState<FilterOptions>({
    status: null,
    tags: [],
    assignedTo: null,
    minBudget: '',
    maxBudget: '',
    location: '',
    purchaseTimeframe: null,
    propertyType: null
  });

  // Get unique assigned users from Supabase
  const [assignedUsers, setAssignedUsers] = useState<string[]>([]);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const { data, error } = await supabase
          .from('team_members')
          .select('name');
          
        if (error) {
          console.error('Error fetching team members:', error);
          return;
        }
        
        if (data) {
          setAssignedUsers(data.map(tm => tm.name));
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      }
    };

    fetchTeamMembers();
  }, []);
  
  // Auto-refresh when component mounts to ensure we have the latest data
  useEffect(() => {
    handleRefresh();
  }, []);

  // Check if any filters are active
  const isFilterActive = useMemo(() => {
    return filters.status !== null || 
      filters.tags.length > 0 || 
      filters.assignedTo !== null || 
      filters.minBudget !== '' || 
      filters.maxBudget !== '' || 
      filters.location !== '' || 
      filters.purchaseTimeframe !== null || 
      filters.propertyType !== null;
  }, [filters]);

  // Refresh data
  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshTrigger(prev => prev + 1);
    setTimeout(() => setIsRefreshing(false), 1000); // Visual feedback
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      status: null,
      tags: [],
      assignedTo: null,
      minBudget: '',
      maxBudget: '',
      location: '',
      purchaseTimeframe: null,
      propertyType: null
    });
  };

  // Define columns with empty items (will be populated by KanbanBoard)
  const getPurchaseColumns = () => {
    const statusesToShow = filters.status ? [filters.status] : [
      'New', 'Contacted', 'Qualified', 'Proposal', 'Visit', 'Offer', 'Deposit', 'Signed'
    ] as LeadStatus[];
    
    return statusesToShow.map(status => ({
      title: status,
      status: status as LeadStatus,
      items: [],
    }));
  };

  const getRentalColumns = () => {
    const statusesToShow = filters.status ? [filters.status] : [
      'New', 'Contacted', 'Qualified', 'Visit', 'Proposal', 'Offer', 'Signed'
    ] as LeadStatus[];
    
    return statusesToShow.map(status => ({
      title: status,
      status: status as LeadStatus,
      items: [],
    }));
  };

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold">Pipeline</h1>
          <p className="text-muted-foreground text-sm md:text-base">Drag and drop leads through your sales stages</p>
        </div>
        
        {!isMobile && (
          <div className="flex space-x-3">
            <CustomButton
              variant="outline"
              className="flex items-center gap-1.5"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} /> 
              Actualiser
            </CustomButton>
            <PipelineFilters 
              filters={filters}
              onFilterChange={setFilters}
              onClearFilters={handleClearFilters}
              assignedToOptions={assignedUsers}
              isFilterActive={isFilterActive}
            />
            <CustomButton
              variant="outline"
              className="flex items-center gap-1.5"
            >
              <Settings className="h-4 w-4" /> Customize
            </CustomButton>
            <CustomButton 
              variant="chocolate" 
              className="flex items-center gap-1.5"
              onClick={() => navigate('/leads/new')}
            >
              <Plus className="h-4 w-4" /> New Lead
            </CustomButton>
          </div>
        )}

        {isMobile && (
          <div className="flex space-x-2">
            <CustomButton
              variant="outline"
              className="flex items-center justify-center w-10 h-10 p-0"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </CustomButton>
            <PipelineFilters 
              filters={filters}
              onFilterChange={setFilters}
              onClearFilters={handleClearFilters}
              assignedToOptions={assignedUsers}
              isFilterActive={isFilterActive}
            />
          </div>
        )}
      </div>

      {/* Display active filters */}
      {isFilterActive && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground mr-1">Filtres actifs:</span>
          
          {filters.status && (
            <div className="bg-primary/10 text-primary text-xs rounded-full px-3 py-1 flex items-center gap-1">
              {filters.status}
              <button onClick={() => setFilters({...filters, status: null})}>
                <X className="h-3 w-3 ml-1" />
              </button>
            </div>
          )}
          
          {filters.tags.map(tag => (
            <div key={tag} className="flex items-center">
              <TagBadge tag={tag} className="text-xs" />
              <button 
                onClick={() => setFilters({...filters, tags: filters.tags.filter(t => t !== tag)})}
                className="ml-1 bg-background rounded-full w-4 h-4 flex items-center justify-center"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          
          {filters.assignedTo && (
            <div className="bg-primary/10 text-primary text-xs rounded-full px-3 py-1 flex items-center gap-1">
              {filters.assignedTo}
              <button onClick={() => setFilters({...filters, assignedTo: null})}>
                <X className="h-3 w-3 ml-1" />
              </button>
            </div>
          )}
          
          {(filters.minBudget || filters.maxBudget) && (
            <div className="bg-primary/10 text-primary text-xs rounded-full px-3 py-1 flex items-center gap-1">
              Budget: {filters.minBudget ? `${filters.minBudget}€` : '0€'} - {filters.maxBudget ? `${filters.maxBudget}€` : '∞'}
              <button onClick={() => setFilters({...filters, minBudget: '', maxBudget: ''})}>
                <X className="h-3 w-3 ml-1" />
              </button>
            </div>
          )}
          
          {filters.location && (
            <div className="bg-primary/10 text-primary text-xs rounded-full px-3 py-1 flex items-center gap-1">
              {filters.location}
              <button onClick={() => setFilters({...filters, location: ''})}>
                <X className="h-3 w-3 ml-1" />
              </button>
            </div>
          )}
          
          {filters.purchaseTimeframe && (
            <div className="bg-primary/10 text-primary text-xs rounded-full px-3 py-1 flex items-center gap-1">
              {filters.purchaseTimeframe === 'Moins de trois mois' ? '< 3 mois' : '> 3 mois'}
              <button onClick={() => setFilters({...filters, purchaseTimeframe: null})}>
                <X className="h-3 w-3 ml-1" />
              </button>
            </div>
          )}
          
          {filters.propertyType && (
            <div className="bg-primary/10 text-primary text-xs rounded-full px-3 py-1 flex items-center gap-1">
              {filters.propertyType}
              <button onClick={() => setFilters({...filters, propertyType: null})}>
                <X className="h-3 w-3 ml-1" />
              </button>
            </div>
          )}
          
          {isFilterActive && (
            <button 
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={handleClearFilters}
            >
              Tout effacer
            </button>
          )}
        </div>
      )}

      <Tabs defaultValue="purchase" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 md:mb-6 w-full md:w-[400px] mx-auto">
          <TabsTrigger value="purchase" className="flex items-center gap-2 w-1/2">
            <Home className="h-4 w-4" />
            <span className="truncate">Achat (Purchase)</span>
          </TabsTrigger>
          <TabsTrigger value="rental" className="flex items-center gap-2 w-1/2">
            <Key className="h-4 w-4" />
            <span className="truncate">Location (Rental)</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="purchase" className="mt-0">
          <KanbanBoard 
            columns={getPurchaseColumns()} 
            filters={filters} 
            refreshTrigger={refreshTrigger}
          />
        </TabsContent>
        
        <TabsContent value="rental" className="mt-0">
          <KanbanBoard 
            columns={getRentalColumns()} 
            filters={filters}
            refreshTrigger={refreshTrigger}
          />
        </TabsContent>
      </Tabs>

      {isMobile && (
        <FloatingActionButtons
          onAddAction={() => navigate('/leads/new')}
        />
      )}
    </div>
  );
};

export default Kanban;
