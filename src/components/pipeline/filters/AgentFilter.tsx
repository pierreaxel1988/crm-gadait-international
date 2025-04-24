
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { useSelectedAgent } from '@/hooks/useSelectedAgent';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface TeamMember {
  id: string;
  name: string;
}

interface AgentFilterProps {
  assignedTo: string | null;
  onAssignedToChange: (assignedTo: string | null) => void;
  assignedToOptions: TeamMember[];
}

const AgentFilter = ({ assignedTo, onAssignedToChange, assignedToOptions }: AgentFilterProps) => {
  const { selectedAgent, handleAgentChange } = useSelectedAgent();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(assignedToOptions);
  const [isLoading, setIsLoading] = useState(false);
  const { isAdmin, isCommercial, user } = useAuth();
  const [currentUserTeamId, setCurrentUserTeamId] = useState<string | null>(null);

  useEffect(() => {
    const loadTeamMembers = async () => {
      setIsLoading(true);
      try {
        console.log("[AgentFilter] Chargement de tous les membres d'équipe");
        
        // Chargement de tous les membres sans restriction
        const { data, error } = await supabase
          .from('team_members')
          .select('id, name')
          .order('name');
          
        if (error) {
          console.error("[AgentFilter] Erreur:", error);
        } else if (data) {
          console.log("[AgentFilter] Membres chargés:", data.length);
          setTeamMembers(data);
          
          // Pour les commerciaux, identifier leur propre ID
          if (isCommercial && !isAdmin && user?.email) {
            const { data: currentUserData } = await supabase
              .from('team_members')
              .select('id')
              .eq('email', user.email)
              .maybeSingle();
              
            if (currentUserData) {
              setCurrentUserTeamId(currentUserData.id);
              console.log("[AgentFilter] ID du commercial actuel:", currentUserData.id);
              
              // Auto-sélectionner le commercial si aucun agent n'est sélectionné
              if (!assignedTo) {
                handleAgentSelect(currentUserData.id);
              }
            }
          }
        }
      } catch (err) {
        console.error("[AgentFilter] Exception:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Utiliser les options fournies ou charger depuis Supabase si vide
    if (assignedToOptions.length === 0) {
      loadTeamMembers();
    } else {
      setTeamMembers(assignedToOptions);
    }
  }, [assignedToOptions, isAdmin, isCommercial, user?.email]);

  useEffect(() => {
    if (selectedAgent !== assignedTo) {
      onAssignedToChange(selectedAgent);
    }
  }, [selectedAgent, assignedTo]);

  const handleAgentSelect = (agentId: string | null) => {
    onAssignedToChange(agentId);
    handleAgentChange(agentId);
  };

  const selectedAgentName = assignedTo 
    ? teamMembers.find(member => member.id === assignedTo)?.name || 'Inconnu'
    : null;

  return (
    <div>
      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
        <User className="h-4 w-4" /> Agent assigné
        {selectedAgentName && (
          <span className="ml-1 text-primary font-medium">: {selectedAgentName}</span>
        )}
      </h4>
      {isLoading ? (
        <div className="text-xs text-amber-600">Chargement des agents...</div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={assignedTo === null ? "default" : "outline"}
            size="sm"
            className="text-xs"
            onClick={() => handleAgentSelect(null)}
          >
            Tous
          </Button>
          {teamMembers.map((member) => (
            <Button
              key={member.id}
              variant={assignedTo === member.id ? "default" : "outline"}
              size="sm"
              className="text-xs"
              onClick={() => handleAgentSelect(member.id)}
            >
              {member.name}
            </Button>
          ))}
          {teamMembers.length === 0 && (
            <div className="col-span-2 text-xs text-amber-600 p-2">
              Aucun agent disponible. Vérifiez la connexion à Supabase.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AgentFilter;
