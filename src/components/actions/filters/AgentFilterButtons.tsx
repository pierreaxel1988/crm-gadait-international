
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useTeamMemberData } from '@/hooks/useTeamMemberData';
import AgentFilterButton from './AgentFilterButton';

interface AgentFilterButtonsProps {
  agentFilter: string | null;
  setAgentFilter: (agentId: string | null) => void;
  teamMembers: { id: string; name: string }[];
}

const AgentFilterButtons: React.FC<AgentFilterButtonsProps> = ({ 
  agentFilter, 
  setAgentFilter, 
  teamMembers: providedMembers
}) => {
  const {
    localTeamMembers,
    currentUserTeamId,
    userRole,
    isLoading,
    isUserAdmin,
  } = useTeamMemberData(providedMembers);
  
  useEffect(() => {
    if (currentUserTeamId && !agentFilter && userRole === 'commercial') {
      console.log("[AgentFilterButtons] Auto-selecting commercial:", currentUserTeamId);
      setAgentFilter(currentUserTeamId);
    }
  }, [currentUserTeamId, agentFilter, userRole, setAgentFilter]);
  
  const handleFilterClick = (agentId: string | null) => {
    if (userRole === 'commercial' && !isUserAdmin && agentId !== currentUserTeamId && agentId !== null) {
      toast({
        variant: "destructive",
        title: "Accès limité",
        description: "En tant que commercial, vous ne pouvez voir que vos propres leads."
      });
      return;
    }
    
    console.log("[AgentFilterButtons] Setting agent filter to:", agentId);
    setAgentFilter(agentId);
  };
  
  const canSelectAll = isUserAdmin || userRole !== 'commercial';
  const membersToDisplay = localTeamMembers.length > 0 ? localTeamMembers : providedMembers;
  
  return (
    <div>
      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
        <User className="h-4 w-4" /> Agent
      </h4>
      {isLoading ? (
        <div className="text-xs text-amber-600 p-2">Chargement des agents...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {canSelectAll && (
            <Button
              variant={agentFilter === null ? "default" : "outline"}
              size="sm"
              className="text-xs"
              onClick={() => handleFilterClick(null)}
            >
              Tous
            </Button>
          )}
          {membersToDisplay.map(member => (
            <AgentFilterButton
              key={member.id}
              memberId={member.id}
              memberName={member.name}
              isSelected={agentFilter === member.id}
              onClick={() => handleFilterClick(member.id)}
            />
          ))}
          {membersToDisplay.length === 0 && (
            <div className="col-span-2 md:col-span-4 text-xs text-amber-600 p-2">
              Aucun agent disponible. Vérifiez la connexion à Supabase.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AgentFilterButtons;
