
import React, { useEffect, useState } from 'react';
import { User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SPECIFIC_AGENTS } from '@/components/actions/filters/AgentFilterButtons';

interface AssignedUserProps {
  assignedToId?: string;
  onAssignClick: (e: React.MouseEvent) => void;
}

const AssignedUser = ({ assignedToId, onAssignClick }: AssignedUserProps) => {
  const [assignedToName, setAssignedToName] = useState<string>('Non assigné');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  useEffect(() => {
    const fetchTeamMemberInfo = async () => {
      if (assignedToId) {
        // Vérifier d'abord dans SPECIFIC_AGENTS pour éviter une requête inutile
        const specificAgent = SPECIFIC_AGENTS.find(agent => agent.id === assignedToId);
        if (specificAgent) {
          console.log("Agent trouvé dans SPECIFIC_AGENTS:", specificAgent.name);
          setAssignedToName(specificAgent.name);
          return;
        }
        
        setIsLoading(true);
        try {
          console.log("Recherche de l'agent avec ID:", assignedToId);
          const { data, error } = await supabase
            .from('team_members')
            .select('id, name')
            .eq('id', assignedToId)
            .single();
            
          if (error) {
            console.error('Error fetching team member info:', error);
            return;
          }
          
          if (data) {
            console.log("Agent trouvé dans la base:", data.name);
            setAssignedToName(data.name);
          }
        } catch (error) {
          console.error('Unexpected error fetching team member info:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchTeamMemberInfo();
  }, [assignedToId]);
  
  // Now properly check for assignedToId to determine whether to show the assigned user or the assign button
  if (assignedToId) {
    return (
      <div className="flex items-center">
        <Avatar className="h-5 w-5 mr-1">
          <AvatarFallback className="text-[9px] font-futura">
            {assignedToName.split(' ').map(part => part[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <span className="text-xs font-futura">{assignedToName}</span>
      </div>
    );
  }
  
  return (
    <button 
      onClick={onAssignClick}
      className="text-xs font-futura text-primary hover:underline flex items-center"
    >
      <User className="h-3 w-3 mr-1" />
      Assigner
    </button>
  );
};

export default AssignedUser;
