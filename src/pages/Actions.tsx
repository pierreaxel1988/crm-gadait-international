
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

// Define types to match the components' expected props
interface StatusFilterButtonsProps {
  value: string | null;
  onChange: (value: string | null) => void;
}

interface TypeFilterButtonsProps {
  value: string | null;
  onChange: (value: string | null) => void;
}

interface AgentFilterButtonsProps {
  teamMembers: { id: string; name: string; email: string }[];
  value: string | null;
  onChange: (value: string | null) => void;
}

interface ActionsListProps {
  actionsData: any[];
  onActionClick?: (actionId: string, leadId: string) => void;
  onStatusChange?: () => Promise<void>;
}

interface ActionsHeaderProps {
  // Add minimum props required to avoid TypeScript errors
  title?: string;
}

const Actions = () => {
  const navigate = useNavigate();
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

  return (
    <>
      <Navbar />
      <SubNavigation />
      <div className="p-4 md:p-6 max-w-6xl mx-auto">
        <ActionsHeader title="Actions" />
        
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <h3 className="text-sm font-medium mb-2">Filtrer par statut</h3>
            <StatusFilterButtons 
              value={filteredStatus}
              onChange={setFilteredStatus}
            />
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2">Filtrer par type</h3>
            <TypeFilterButtons
              value={filteredType}
              onChange={setFilteredType}
            />
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2">Filtrer par agent</h3>
            <AgentFilterButtons
              teamMembers={teamMembers}
              value={filteredAgentId}
              onChange={setFilteredAgentId}
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-chocolate-dark" />
          </div>
        ) : (
          <ActionsList 
            actionsData={actionsData} 
            onActionClick={handleActionClick}
            onStatusChange={refreshData}
          />
        )}
      </div>
    </>
  );
};

export default Actions;
