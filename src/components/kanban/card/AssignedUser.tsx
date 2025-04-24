
import React, { useEffect, useState } from 'react';
import { User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
        setIsLoading(true);
        try {
          console.log(`[AssignedUser] Chargement des infos pour l'utilisateur: ${assignedToId}`);
          const { data, error } = await supabase
            .from('team_members')
            .select('id, name')
            .eq('id', assignedToId)
            .maybeSingle();
            
          if (error) {
            console.error('[AssignedUser] Erreur:', error);
            return;
          }
          
          if (data) {
            console.log(`[AssignedUser] Info trouvée: ${data.name}`);
            setAssignedToName(data.name);
          } else {
            console.log(`[AssignedUser] Aucune info trouvée pour l'ID: ${assignedToId}`);
            setAssignedToName('Agent inconnu');
          }
        } catch (error) {
          console.error('[AssignedUser] Exception:', error);
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
            {assignedToName === 'Agent inconnu' ? '?' : 
             assignedToName.split(' ').map(part => part[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <span className="text-xs font-futura">
          {isLoading ? 'Chargement...' : assignedToName}
        </span>
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
