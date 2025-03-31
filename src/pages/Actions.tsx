
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useActionsData } from '@/hooks/useActionsData';
import { Loader2 } from 'lucide-react';
import ActionsList from '@/components/actions/ActionsList';
import ActionsHeader from '@/components/actions/ActionsHeader';
import Navbar from '@/components/layout/Navbar';
import SubNavigation from '@/components/layout/SubNavigation';
import StatusFilterButtons from '@/components/actions/filters/StatusFilterButtons';
import TypeFilterButtons from '@/components/actions/filters/TypeFilterButtons';
import AgentFilterButtons from '@/components/actions/filters/AgentFilterButtons';
import { useIsMobile } from '@/hooks/use-mobile';

const Actions = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [filteredStatus, setFilteredStatus] = useState<string | null>(null);
  const [filteredType, setFilteredType] = useState<string | null>(null);
  const [filteredAgentId, setFilteredAgentId] = useState<string | null>(null);
  
  const { actionsData, isLoading, teamMembers, refreshData } = useActionsData(
    filteredStatus,
    filteredType,
    filteredAgentId
  );

  const handleActionClick = (actionId: string, leadId: string) => {
    navigate(`/leads/${leadId}?actionId=${actionId}`);
  };

  const handleMarkComplete = async (actionId: string, leadId: string) => {
    // L'implémentation serait ici
    await refreshData();
  };

  return (
    <>
      <Navbar />
      <SubNavigation />
      <div className="p-4 md:p-6 max-w-6xl mx-auto">
        <ActionsHeader 
          isAdmin={false}
          statusFilter={filteredStatus || ''}
          setStatusFilter={(value) => setFilteredStatus(value)}
          typeFilter={filteredType || ''}
          setTypeFilter={(value) => setFilteredType(value)}
          agentFilter={filteredAgentId || ''}
          setAgentFilter={(value) => setFilteredAgentId(value)}
          isLoading={isLoading}
          actionsCount={actionsData.length}
          teamMembers={teamMembers}
          onRefresh={refreshData}
          isRefreshing={false}
        />
        
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <h3 className="text-sm font-medium mb-2">Filtrer par statut</h3>
            <StatusFilterButtons 
              selectedValue={filteredStatus || ''}
              onValueChange={(value) => setFilteredStatus(value === '' ? null : value)}
            />
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2">Filtrer par type</h3>
            <TypeFilterButtons
              selectedValue={filteredType || ''}
              onValueChange={(value) => setFilteredType(value === '' ? null : value)}
            />
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2">Filtrer par agent</h3>
            <AgentFilterButtons
              teamMembers={teamMembers}
              selectedValue={filteredAgentId || ''}
              onValueChange={(value) => setFilteredAgentId(value === '' ? null : value)}
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-chocolate-dark" />
          </div>
        ) : (
          <ActionsList 
            actions={actionsData}
            isLoading={isLoading} 
            onMarkComplete={handleMarkComplete}
            isMobile={isMobile}
          />
        )}
      </div>
    </>
  );
};

export default Actions;
