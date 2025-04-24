
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

  // Charger tous les membres d'équipe sans filtrage
  useEffect(() => {
    const loadTeamMembers = async () => {
      setIsLoading(true);
      try {
        console.log("[AgentFilter] Chargement de tous les membres d'équipe");
        
        // Requête sans filtre pour récupérer tous les membres
        const { data, error } = await supabase
          .from('team_members')
          .select('id, name, email')
          .order('name');
          
        if (error) {
          console.error("[AgentFilter] Erreur lors du chargement des membres:", error);
        } else if (data) {
          console.log("[AgentFilter] Membres chargés:", data.length);
          setTeamMembers(data);
          
          // Pour les commerciaux, identifier leur propre ID
          if (isCommercial && !isAdmin && user?.email) {
            // Instead of directly comparing email, we need to fetch the current user's team member ID
            const { data: currentUserData } = await supabase
              .from('team_members')
              .select('id')
              .eq('email', user.email)
              .maybeSingle();
              
            if (currentUserData) {
              setCurrentUserTeamId(currentUserData.id);
              console.log("[AgentFilter] ID du commercial actuel:", currentUserData.id);
              
              // Auto-sélectionner le commercial
              if (!assignedTo) {
                handleAgentSelect(currentUserData.id);
              }
            }
          }
        }
      } catch (error) {
        console.error("[AgentFilter] Exception:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Utiliser les options fournies ou charger depuis Supabase si vide
    if (assignedToOptions.length === 0) {
      loadTeamMembers();
    } else {
      setTeamMembers(assignedToOptions);
      console.log("[AgentFilter] Utilisation des options fournies:", assignedToOptions.length);
    }
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
