
import React, { useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePipelineState } from '@/hooks/usePipelineState';
import MobilePipelineView from '@/components/pipeline/MobilePipelineView';
import DesktopPipelineView from '@/components/pipeline/DesktopPipelineView';
import Navbar from '@/components/layout/Navbar';
import SubNavigation from '@/components/layout/SubNavigation';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

const Pipeline = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  
  // Use the custom hook for state management
  const { 
    activeTab,
    setActiveTab,
    refreshTrigger,
    isRefreshing,
    searchTerm,
    setSearchTerm,
    filtersOpen,
    toggleFilters,
    filters,
    setFilters,
    teamMembers,
    activeFiltersCount,
    isFilterActive,
    handleRefresh,
    handleClearFilters,
    getAllColumns
  } = usePipelineState();

  // Vérifier s'il y a eu une redirection OAuth qui aurait mal abouti
  useEffect(() => {
    const oauthSuccess = localStorage.getItem('oauth_success') === 'true';
    const redirectTarget = localStorage.getItem('oauthRedirectTarget');
    const oauthPending = localStorage.getItem('oauth_pending') === 'true';
    
    // Si nous détectons des indicateurs OAuth sur cette page, c'est que la redirection a échoué
    if (oauthSuccess || redirectTarget || oauthPending) {
      console.log("Détection d'une authentification OAuth inachevée sur la page Pipeline", {
        oauthSuccess,
        hasRedirectTarget: !!redirectTarget,
        oauthPending
      });
      
      // Essayer de rediriger vers la bonne page
      if (redirectTarget) {
        toast({
          title: "Redirection en cours",
          description: "Vous êtes redirigé vers la page des emails après authentification Gmail."
        });
        
        // Petite pause avant redirection
        setTimeout(() => {
          try {
            // Nettoyer les flags avant redirection
            localStorage.removeItem('oauth_pending');
            localStorage.removeItem('oauthRedirectTarget');
            
            // Garder le flag success pour que la page cible sache qu'il y a eu une auth réussie
            // localStorage.setItem('oauth_success', 'true');
            
            // Rediriger vers la cible
            window.location.href = redirectTarget;
          } catch (e) {
            console.error("Erreur lors de la redirection:", e);
            navigate('/leads');
          }
        }, 500);
      } else {
        // Si pas de target, redirection par défaut
        navigate('/leads');
      }
    }
  }, [navigate]);

  useEffect(() => {
    // Force a refresh when the component mounts to ensure data is loaded
    handleRefresh();
  }, []);

  return (
    <>
      <Navbar />
      <SubNavigation />
      <div className="p-3 md:p-6 bg-white min-h-screen">
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
            onClearFilters={handleClearFilters}
            columns={getAllColumns()}
            handleRefresh={handleRefresh}
            isRefreshing={isRefreshing}
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
            onClearFilters={handleClearFilters}
            columns={getAllColumns()}
            handleRefresh={handleRefresh}
            isRefreshing={isRefreshing}
            isFilterActive={isFilterActive}
            teamMembers={teamMembers}
          />
        )}
      </div>
    </>
  );
};

export default Pipeline;
