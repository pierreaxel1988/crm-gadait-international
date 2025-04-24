
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

  // Charger les membres d'équipe en fonction du rôle
  useEffect(() => {
    const loadTeamMembers = async () => {
      setIsLoading(true);
      try {
        console.log("[AgentFilter] Chargement des membres d'équipe - isAdmin:", isAdmin, "isCommercial:", isCommercial);
        
        let query = supabase
          .from('team_members')
          .select('id, name');
          
        // Pour les commerciaux, filtrer pour ne voir que leur propre entrée
        if (isCommercial && !isAdmin && user?.email) {
          console.log(`[AgentFilter] Filtrage pour commercial: ${user.email}`);
          query = query.eq('email', user.email);
          
          // Récupérer l'ID du commercial actuel
          const { data: currentUser } = await supabase
            .from('team_members')
            .select('id')
            .eq('email', user.email)
            .maybeSingle();
            
          if (currentUser) {
            setCurrentUserTeamId(currentUser.id);
            console.log("[AgentFilter] ID du commercial actuel:", currentUser.id);
            
            // Auto-sélectionner le commercial
            if (!assignedTo) {
              handleAgentSelect(currentUser.id);
            }
          }
        }
        
        // Exécuter la requête finale
        const { data, error } = await query.order('name');
          
        if (error) {
          console.error("[AgentFilter] Erreur lors du chargement des membres:", error);
        } else if (data) {
          console.log("[AgentFilter] Membres chargés:", data.length);
          setTeamMembers(data);
        }
      } catch (error) {
        console.error("[AgentFilter] Exception:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTeamMembers();
  }, [assignedToOptions, isAdmin, isCommercial, user?.email]);

  // Synchroniser avec le système global d'agent sélectionné
  useEffect(() => {
    if (selectedAgent !== assignedTo) {
      onAssignedToChange(selectedAgent);
    }
    
    // Pour les commerciaux, forcer la sélection de leur propre ID
    if (isCommercial && !isAdmin && currentUserTeamId && assignedTo !== currentUserTeamId) {
      console.log("[AgentFilter] Forçage de la sélection pour le commercial:", currentUserTeamId);
      handleAgentSelect(currentUserTeamId);
    }
  }, [selectedAgent, assignedTo, isCommercial, isAdmin, currentUserTeamId]);

  const handleAgentSelect = (agentId: string | null) => {
    // Pour les commerciaux, ne permettre que la sélection de leur propre ID
    if (isCommercial && !isAdmin && agentId !== currentUserTeamId && agentId !== null) {
      console.log("[AgentFilter] Commercial tentant de filtrer par un autre agent - bloqué");
      return;
    }
    
    // Mettre à jour à la fois le filtre local et le système global
    onAssignedToChange(agentId);
    handleAgentChange(agentId);
  };

  // Trouver le nom du commercial actuellement sélectionné
  const selectedAgentName = assignedTo 
    ? teamMembers.find(member => member.id === assignedTo)?.name || 'Inconnu'
    : null;

  // Pour les commerciaux, désactiver le bouton "Tous"
  const canSelectAll = isAdmin || !isCommercial;

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
          {canSelectAll && (
            <Button
              variant={assignedTo === null ? "default" : "outline"}
              size="sm"
              className="text-xs"
              onClick={() => handleAgentSelect(null)}
            >
              Tous
            </Button>
          )}
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
