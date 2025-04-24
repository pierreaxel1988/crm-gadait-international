
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
  const [userRole, setUserRole] = useState<string | null>(null);
  
  // Effet séparé pour gérer l'auto-sélection
  useEffect(() => {
    // Si l'ID du commercial est défini mais qu'aucun filtre n'est actif, appliquer le filtre
    if (currentUserTeamId && !agentFilter && userRole === 'commercial') {
      console.log("[AgentFilterButtons] Auto-selecting commercial:", currentUserTeamId);
      setAgentFilter(currentUserTeamId);
    }
  }, [currentUserTeamId, agentFilter, userRole, setAgentFilter]);
  
  useEffect(() => {
    const loadTeamMembers = async () => {
      setIsLoading(true);
      try {
        console.log("[AgentFilterButtons] Loading team members");
        console.log("[AgentFilterButtons] Debug - isCommercial:", isCommercial, "isAdmin:", isAdmin, "user:", user?.email);
        
        // D'abord, obtenez le rôle de l'utilisateur à partir de la base de données
        if (user?.email) {
          const { data: userData, error: userError } = await supabase
            .from('team_members')
            .select('id, name, role, is_admin')
            .eq('email', user.email)
            .maybeSingle();
            
          if (userError) {
            console.error("[AgentFilterButtons] Error fetching user data:", userError);
          } else if (userData) {
            console.log("[AgentFilterButtons] User data:", userData);
            setCurrentUserTeamId(userData.id);
            setUserRole(userData.role);
            
            // Déterminer si l'utilisateur est commercial ou admin basé sur les données de la DB
            const isUserCommercial = userData.role === 'commercial';
            const isUserAdmin = userData.is_admin || userData.role === 'admin';
            
            // Si c'est uniquement un commercial (sans droits admin)
            if (isUserCommercial && !isUserAdmin) {
              console.log("[AgentFilterButtons] Setting up for commercial:", userData.name);
              setLocalTeamMembers([userData]);
            } else {
              // Admin ou commercial avec droits admin - charger tous les membres
              console.log("[AgentFilterButtons] Loading for admin or commercial with admin rights");
              const { data, error } = await supabase
                .from('team_members')
                .select('id, name, role, is_admin')
                .order('name');
                
              if (error) {
                console.error("[AgentFilterButtons] Error fetching team members:", error);
                throw error;
              } else if (data) {
                console.log("[AgentFilterButtons] Loaded team members:", data.length);
                setLocalTeamMembers(data);
              }
            }
          } else {
            console.warn("[AgentFilterButtons] User not found:", user.email);
            toast({
              variant: "destructive",
              title: "Erreur d'identification",
              description: "Votre compte utilisateur n'est pas correctement configuré.",
            });
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
      console.log("[AgentFilterButtons] Using provided members:", providedMembers.length);
      setLocalTeamMembers(providedMembers);
      
      // Si nous avons un utilisateur, essayer de trouver son ID et rôle
      if (user?.email) {
        const findUserInfo = async () => {
          console.log("[AgentFilterButtons] Finding user info for:", user.email);
          
          const { data: userData } = await supabase
            .from('team_members')
            .select('id, role, is_admin')
            .eq('email', user.email)
            .maybeSingle();
              
          if (userData) {
            console.log("[AgentFilterButtons] Found user info:", userData);
            setCurrentUserTeamId(userData.id);
            setUserRole(userData.role);
            
            // Si commercial et pas de filtre actif, auto-sélectionner
            if (userData.role === 'commercial' && !userData.is_admin && !agentFilter) {
              console.log("[AgentFilterButtons] Auto-selecting agent filter for commercial");
              setAgentFilter(userData.id);
            }
          } else {
            console.warn("[AgentFilterButtons] User not found in database:", user.email);
          }
        };
        
        findUserInfo();
      }
    }
  }, [providedMembers, isAdmin, isCommercial, user?.email, agentFilter]);
  
  const handleFilterClick = (agentId: string | null) => {
    // Pour les commerciaux sans droits admin, bloquer la sélection d'autres agents
    if (userRole === 'commercial' && !isAdmin && agentId !== currentUserTeamId && agentId !== null) {
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
  
  // Pour les commerciaux non-admin, ne pas montrer le bouton "Tous"
  const canSelectAll = isAdmin || userRole !== 'commercial';
  
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
