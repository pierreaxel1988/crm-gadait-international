
import React, { useState } from 'react';
import { useActionsData } from '@/hooks/useActionsData';
import { ActionsList } from '@/components/actions/ActionsList';
import ActionsHeader from '@/components/actions/ActionsHeader';
import Navbar from '@/components/layout/Navbar';
import SubNavigation from '@/components/layout/SubNavigation';
import { useIsMobile } from '@/hooks/use-mobile';

const Actions = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [filters, setFilters] = useState<any>({});
  const { actions, isLoading, error, markActionComplete } = useActionsData(refreshTrigger, filters);
  const isMobile = useIsMobile();

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  return (
    <>
      <Navbar />
      <SubNavigation />
      <div className="p-3 md:p-6 pb-20 md:pb-6">
        <ActionsHeader 
          onFilterChange={handleFilterChange} 
          filters={filters} 
          onRefresh={handleRefresh} 
        />
        <div className="mt-4">
          <ActionsList 
            actions={actions} 
            isLoading={isLoading} 
            error={error} 
            onMarkComplete={markActionComplete} 
          />
        </div>
      </div>
    </>
  );
};

export default Actions;
