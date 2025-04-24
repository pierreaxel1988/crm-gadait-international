
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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
  const { isAdmin, isCommercial, user } = useAuth();
  const [localTeamMembers, setLocalTeamMembers] = useState<{ id: string; name: string }[]>(providedMembers);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserTeamId, setCurrentUserTeamId] = useState<string | null>(null);
  
  // Load all team members without filtering
  useEffect(() => {
    const loadTeamMembers = async () => {
      setIsLoading(true);
      try {
        console.log("[AgentFilterButtons] Loading all team members");
        
        // Fetch all team members without filters
        const { data, error } = await supabase
          .from('team_members')
          .select('id, name')
          .order('name');
          
        if (error) {
          console.error("[AgentFilterButtons] Error:", error);
        } else if (data && data.length > 0) {
          console.log("[AgentFilterButtons] Team members loaded:", data.length);
          setLocalTeamMembers(data);
          
          // For commercial users, find their own ID
          if (isCommercial && !isAdmin && user?.email) {
            // Find the current user's team member ID
            const { data: currentUserData } = await supabase
              .from('team_members')
              .select('id')
              .eq('email', user.email)
              .maybeSingle();
              
            if (currentUserData) {
              setCurrentUserTeamId(currentUserData.id);
              console.log("[AgentFilterButtons] Commercial ID:", currentUserData.id);
              
              // Auto-select the commercial user
              if (!agentFilter) {
                setAgentFilter(currentUserData.id);
              }
            }
          }
        }
      } catch (err) {
        console.error("[AgentFilterButtons] Exception:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (providedMembers.length === 0) {
      loadTeamMembers();
    } else {
      setLocalTeamMembers(providedMembers);
      
      // Check if we need to filter provided members for commercial users
      if (isCommercial && !isAdmin && user?.email) {
        // Find current commercial user ID among provided members
        const findUserIdFromEmail = async () => {
          try {
            const { data: currentUser } = await supabase
              .from('team_members')
              .select('id')
              .eq('email', user.email)
              .maybeSingle();
              
            if (currentUser) {
              setCurrentUserTeamId(currentUser.id);
              console.log("[AgentFilterButtons] Commercial ID found:", currentUser.id);
              
              // Auto-select the commercial user
              if (!agentFilter) {
                setAgentFilter(currentUser.id);
              }
            }
          } catch (error) {
            console.error("[AgentFilterButtons] Error finding commercial ID:", error);
          }
        };
        
        findUserIdFromEmail();
      }
    }
  }, [providedMembers, isAdmin, isCommercial, user?.email]);
  
  const handleFilterClick = (agentId: string | null) => {
    // For commercial users, only allow selecting their own ID
    if (isCommercial && !isAdmin && agentId !== currentUserTeamId && agentId !== null) {
      console.log("[AgentFilterButtons] Commercial trying to filter by another agent - blocked");
      return;
    }
    
    setAgentFilter(agentId);
  };
  
  // For commercial users, disable the "All" button
  const canSelectAll = isAdmin || !isCommercial;
  
  // Use local members for rendering
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
            <Button
              key={member.id}
              variant={agentFilter === member.id ? "default" : "outline"}
              size="sm"
              className="text-xs whitespace-normal h-auto py-1.5"
              onClick={() => handleFilterClick(member.id)}
            >
              {member.name}
            </Button>
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
