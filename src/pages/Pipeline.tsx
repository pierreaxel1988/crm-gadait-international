
import React, { useState, useEffect, useMemo } from 'react';
import { Home, Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from '@/hooks/use-mobile';
import FloatingActionButtons from '@/components/ui/FloatingActionButtons';
import { FilterOptions } from '@/components/pipeline/PipelineFilters';
import { supabase } from '@/integrations/supabase/client';
import PipelineHeader from '@/components/pipeline/PipelineHeader';
import PipelineTabContent from '@/components/pipeline/PipelineTabContent';

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

  // Get team members from Supabase with both ID and name
  const [teamMembers, setTeamMembers] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const { data, error } = await supabase
          .from('team_members')
          .select('id, name');
          
        if (error) {
          console.error('Error fetching team members:', error);
          return;
        }
        
        if (data) {
          setTeamMembers(data);
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

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      <PipelineHeader 
        filters={filters}
        onFilterChange={setFilters}
        onClearFilters={handleClearFilters}
        teamMembers={teamMembers}
        isFilterActive={isFilterActive}
        handleRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

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
          <PipelineTabContent 
            contentType="purchase" 
            filters={filters} 
            refreshTrigger={refreshTrigger} 
          />
        </TabsContent>
        
        <TabsContent value="rental" className="mt-0">
          <PipelineTabContent 
            contentType="rental" 
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
