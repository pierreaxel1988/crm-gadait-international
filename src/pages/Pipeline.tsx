
import React, { useEffect, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePipelineState } from '@/hooks/usePipelineState';
import MobilePipelineView from '@/components/pipeline/MobilePipelineView';
import DesktopPipelineView from '@/components/pipeline/DesktopPipelineView';
import Navbar from '@/components/layout/Navbar';
import SubNavigation from '@/components/layout/SubNavigation';
import { useSelectedAgent } from '@/hooks/useSelectedAgent';
import LoadingScreen from '@/components/layout/LoadingScreen';
import ComponentLoader from '@/components/common/ComponentLoader';
import { toast } from '@/hooks/use-toast';
import { usePipelineData } from '@/hooks/usePipelineData';
import { PipelineType } from '@/types/lead';
import { checkSupabaseConnection, isOfflineMode, setOfflineMode } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { WifiOff, RefreshCw } from 'lucide-react';

const Pipeline = () => {
  const isMobile = useIsMobile();
  
  const { 
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    filtersOpen,
    toggleFilters,
    filters,
    setFilters,
    activeFiltersCount,
    isFilterActive,
    handleClearFilters,
  } = usePipelineState();

  const { selectedAgent, handleAgentChange } = useSelectedAgent();

  // Check Supabase connection on initial load
  useEffect(() => {
    const checkConnection = async () => {
      const isConnected = await checkSupabaseConnection();
      if (!isConnected && !isOfflineMode) {
        toast({
          title: "Mode hors ligne activé",
          description: "L'application fonctionne maintenant en mode hors ligne car la connexion à la base de données a échoué.",
          variant: "destructive"
        });
      }
    };
    
    checkConnection();
  }, []);

  // Update agent filter when selected agent changes
  useEffect(() => {
    if (selectedAgent !== filters.assignedTo) {
      setFilters(prev => ({
        ...prev,
        assignedTo: selectedAgent
      }));
    }
  }, [selectedAgent, filters.assignedTo, setFilters]);

  // Listen for agent selection changes from other components
  useEffect(() => {
    const handleAgentSelectionChange = (e: CustomEvent) => {
      const newAgent = e.detail.selectedAgent;
      if (newAgent !== selectedAgent) {
        handleAgentChange(newAgent);
      }
    };

    window.addEventListener('agent-selection-changed', handleAgentSelectionChange as EventListener);
    return () => {
      window.removeEventListener('agent-selection-changed', handleAgentSelectionChange as EventListener);
    };
  }, [selectedAgent, handleAgentChange]);

  // Use the optimized hook for fetching pipeline data
  const {
    columns,
    teamMembers,
    isLoading,
    isError,
    isConnectionError,
    isOfflineMode: pipelineOfflineMode,
    refetch,
    toggleOfflineMode
  } = usePipelineData(activeTab as PipelineType, filters, searchTerm);

  const handleClearAllFilters = () => {
    window.dispatchEvent(new Event('filters-cleared'));
    handleClearFilters();
  };

  const handleRefresh = () => {
    if (isOfflineMode) {
      // Tenter de rétablir la connexion
      setOfflineMode(false);
      setTimeout(() => {
        refetch();
      }, 300);
    } else {
      refetch();
    }
  };
  
  // Composant pour afficher le mode hors ligne
  const OfflineModeAlert = () => (
    <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-4">
      <div className="flex items-center">
        <WifiOff className="h-5 w-5 text-orange-500 mr-2" />
        <div>
          <p className="text-sm font-medium text-orange-800">
            Mode hors ligne actif
          </p>
          <p className="text-xs text-orange-700 mt-1">
            Certaines fonctionnalités sont limitées et vous visualisez des données de démonstration.
          </p>
        </div>
        <Button 
          onClick={handleRefresh} 
          size="sm" 
          variant="outline" 
          className="ml-auto text-xs bg-orange-50 border-orange-200 hover:bg-orange-100 text-orange-800"
        >
          <RefreshCw className="h-3 w-3 mr-1" /> Reconnecter
        </Button>
      </div>
    </div>
  );
  
  try {
    return (
      <>
        <Navbar />
        <SubNavigation />
        <div className="p-3 md:p-6 bg-white min-h-screen">
          {isOfflineMode && <OfflineModeAlert />}
          
          <ComponentLoader isLoading={isLoading && !isOfflineMode}>
            {isMobile ? (
              <MobilePipelineView
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filtersOpen={filtersOpen}
                toggleFilters={toggleFilters}
                activeFiltersCount={activeFiltersCount}
                filters={filters}
                onFilterChange={setFilters}
                onClearFilters={handleClearAllFilters}
                columns={columns}
                handleRefresh={handleRefresh}
                isRefreshing={isLoading}
                isFilterActive={isFilterActive}
                teamMembers={teamMembers}
              />
            ) : (
              <DesktopPipelineView
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filtersOpen={filtersOpen}
                toggleFilters={toggleFilters}
                activeFiltersCount={activeFiltersCount}
                filters={filters}
                onFilterChange={setFilters}
                onClearFilters={handleClearAllFilters}
                columns={columns}
                handleRefresh={handleRefresh}
                isRefreshing={isLoading}
                isFilterActive={isFilterActive}
                teamMembers={teamMembers}
              />
            )}
          </ComponentLoader>
        </div>
      </>
    );
  } catch (error) {
    console.error('Error rendering Pipeline:', error);
    toast({
      title: "Erreur de chargement",
      description: "Une erreur s'est produite lors du chargement de la page Pipeline.",
      variant: "destructive"
    });
    return <LoadingScreen />;
  }
};

export default Pipeline;
