
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { useSelectedAgent } from '@/hooks/useSelectedAgent';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

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
        console.log("[AgentFilter] Loading all team members");
        
        // Si c'est un commercial et pas un admin, il ne peut voir que lui-même
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
            setTeamMembers([currentUserData]);
            setCurrentUserTeamId(currentUserData.id);
            console.log("[AgentFilter] Commercial ID:", currentUserData.id);
            
            // Auto-sélectionner le commercial
            handleAgentSelect(currentUserData.id);
          } else {
            console.warn("[AgentFilter] Commercial user not found:", user.email);
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
            console.log("[AgentFilter] Team members loaded:", data.length);
            setTeamMembers(data);
            
            // Si l'utilisateur est un commercial mais qu'on charge quand même tous les membres (cas spécial)
            if (isCommercial && user?.email) {
              const currentUserData = data.find(member => member.email === user.email);
              if (currentUserData) {
                setCurrentUserTeamId(currentUserData.id);
              }
            }
          }
        }
      } catch (err) {
        console.error("[AgentFilter] Exception:", err);
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
    if (assignedToOptions.length === 0) {
      loadTeamMembers();
    } else {
      setTeamMembers(assignedToOptions);
      
      // Pour les commerciaux, trouver leur ID s'il n'est pas déjà défini
      if (isCommercial && !isAdmin && user?.email && !currentUserTeamId) {
        const findUserTeamMember = async () => {
          const { data } = await supabase
            .from('team_members')
            .select('id')
            .eq('email', user.email)
            .maybeSingle();
            
          if (data) {
            setCurrentUserTeamId(data.id);
            
            // Auto-sélectionner pour les commerciaux
            if (!assignedTo) {
              handleAgentSelect(data.id);
            }
          }
        };
        
        findUserTeamMember();
      }
    }
  }, [assignedToOptions, isAdmin, isCommercial, user?.email]);

  // Mise à jour du filtre quand l'agent sélectionné change
  useEffect(() => {
    if (selectedAgent !== assignedTo) {
      onAssignedToChange(selectedAgent);
    }
  }, [selectedAgent, assignedTo]);

  const handleAgentSelect = (agentId: string | null) => {
    // Pour les commerciaux, bloquer la sélection d'autres agents
    if (isCommercial && !isAdmin && agentId !== currentUserTeamId && agentId !== null) {
      toast({
        variant: "destructive",
        title: "Accès limité",
        description: "En tant que commercial, vous ne pouvez voir que vos propres leads."
      });
      return;
    }
    
    onAssignedToChange(agentId);
    handleAgentChange(agentId);
  };

  const selectedAgentName = assignedTo 
    ? teamMembers.find(member => member.id === assignedTo)?.name || 'Inconnu'
    : null;

  // Pour les commerciaux non-admin, ne pas montrer le bouton "Tous"
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
