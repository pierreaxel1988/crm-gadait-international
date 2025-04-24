
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

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
  
  useEffect(() => {
    const loadTeamMembers = async () => {
      setIsLoading(true);
      try {
        console.log("[AgentFilterButtons] Loading team members");
        
        // Si c'est un commercial sans privilèges admin, ne montrer que lui-même
        if (isCommercial && !isAdmin && user?.email) {
          const { data: currentUserData, error } = await supabase
            .from('team_members')
            .select('id, name')
            .eq('email', user.email)
            .maybeSingle();
            
          if (error) {
            throw error;
          }
          
          if (currentUserData) {
            setLocalTeamMembers([currentUserData]);
            setCurrentUserTeamId(currentUserData.id);
            
            // Auto-sélectionner le commercial
            if (!agentFilter) {
              setAgentFilter(currentUserData.id);
            }
          } else {
            console.warn("[AgentFilterButtons] Commercial user not found:", user.email);
            toast({
              variant: "destructive",
              title: "Erreur d'identification",
              description: "Votre compte utilisateur n'est pas correctement configuré.",
            });
          }
        } else {
          // Admin - charge tous les membres
          const { data, error } = await supabase
            .from('team_members')
            .select('id, name')
            .order('name');
            
          if (error) {
            throw error;
          } else if (data) {
            setLocalTeamMembers(data);
            
            // Si l'utilisateur est aussi un commercial, trouver son ID
            if (isCommercial && user?.email) {
              const { data: userData } = await supabase
                .from('team_members')
                .select('id')
                .eq('email', user.email)
                .maybeSingle();
                
              if (userData) {
                setCurrentUserTeamId(userData.id);
                
                // Auto-sélectionner pour les commerciaux
                if (!agentFilter) {
                  setAgentFilter(userData.id);
                }
              }
            }
          }
        }
      } catch (err) {
        console.error("[AgentFilterButtons] Exception:", err);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger la liste des agents."
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    // Utiliser les options si fournies, sinon charger depuis la base
    if (providedMembers.length === 0) {
      loadTeamMembers();
    } else {
      setLocalTeamMembers(providedMembers);
      
      // Si l'utilisateur est un commercial, essayer de trouver son ID
      if (isCommercial && !isAdmin && user?.email) {
        const findUserIdFromEmail = async () => {
          const { data: userData } = await supabase
            .from('team_members')
            .select('id')
            .eq('email', user.email)
            .maybeSingle();
            
          if (userData) {
            setCurrentUserTeamId(userData.id);
            
            // Auto-sélectionner pour les commerciaux
            if (!agentFilter) {
              setAgentFilter(userData.id);
            }
          }
        };
        
        findUserIdFromEmail();
      }
    }
  }, [providedMembers, isAdmin, isCommercial, user?.email]);
  
  const handleFilterClick = (agentId: string | null) => {
    // Pour les commerciaux, bloquer la sélection d'autres agents
    if (isCommercial && !isAdmin && agentId !== currentUserTeamId && agentId !== null) {
      toast({
        variant: "destructive",
        title: "Accès limité",
        description: "En tant que commercial, vous ne pouvez voir que vos propres leads."
      });
      return;
    }
    
    setAgentFilter(agentId);
  };
  
  // Pour les commerciaux non-admin, ne pas montrer le bouton "Tous"
  const canSelectAll = isAdmin || !isCommercial;
  
  // Utiliser les membres locaux pour l'affichage
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
