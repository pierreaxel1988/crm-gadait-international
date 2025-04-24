
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
  
  // Charger tous les membres d'équipe sans filtrage
  useEffect(() => {
    const loadTeamMembers = async () => {
      setIsLoading(true);
      try {
        console.log("[AgentFilterButtons] Chargement de tous les membres d'équipe");
        
        // Requête sans filtre pour récupérer tous les membres
        const { data, error } = await supabase
          .from('team_members')
          .select('id, name')
          .order('name');
          
        if (error) {
          console.error("[AgentFilterButtons] Erreur:", error);
        } else if (data && data.length > 0) {
          console.log("[AgentFilterButtons] Membres chargés:", data.length);
          setLocalTeamMembers(data);
          
          // Pour les commerciaux, identifier leur propre ID
          if (isCommercial && !isAdmin && user?.email) {
            const currentUser = data.find(member => member.email === user.email);
            if (currentUser) {
              setCurrentUserTeamId(currentUser.id);
              console.log("[AgentFilterButtons] ID du commercial:", currentUser.id);
              
              // Auto-sélectionner le commercial
              if (!agentFilter) {
                setAgentFilter(currentUser.id);
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
      
      // Vérifier s'il faut filtrer les membres fournis pour un commercial
      if (isCommercial && !isAdmin && user?.email) {
        // Trouver l'ID du commercial actuel parmi les membres fournis
        const findUserIdFromEmail = async () => {
          try {
            const { data: currentUser } = await supabase
              .from('team_members')
              .select('id')
              .eq('email', user.email)
              .maybeSingle();
              
            if (currentUser) {
              setCurrentUserTeamId(currentUser.id);
              console.log("[AgentFilterButtons] ID du commercial trouvé:", currentUser.id);
              
              // Auto-sélectionner le commercial
              if (!agentFilter) {
                setAgentFilter(currentUser.id);
              }
            }
          } catch (error) {
            console.error("[AgentFilterButtons] Erreur lors de la recherche de l'ID du commercial:", error);
          }
        };
        
        findUserIdFromEmail();
      }
    }
  }, [providedMembers, isAdmin, isCommercial, user?.email]);
  
  const handleFilterClick = (agentId: string | null) => {
    // Pour les commerciaux, ne permettre que la sélection de leur propre ID
    if (isCommercial && !isAdmin && agentId !== currentUserTeamId && agentId !== null) {
      console.log("[AgentFilterButtons] Commercial tentant de filtrer par un autre agent - bloqué");
      return;
    }
    
    setAgentFilter(agentId);
  };
  
  // Pour les commerciaux, désactiver le bouton "Tous"
  const canSelectAll = isAdmin || !isCommercial;
  
  // Utilisez les membres locaux pour le rendu
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
