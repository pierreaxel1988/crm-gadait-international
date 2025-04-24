
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { useSelectedAgent } from '@/hooks/useSelectedAgent';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

  // Effectuer un chargement indépendant des membres d'équipe
  useEffect(() => {
    const loadTeamMembers = async () => {
      setIsLoading(true);
      try {
        console.log("[AgentFilter] Chargement direct des membres d'équipe...");
        const { data, error } = await supabase
          .from('team_members')
          .select('id, name')
          .order('name');
          
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
    
    // N'effectuer le chargement que si assignedToOptions est vide
    if (assignedToOptions.length === 0) {
      loadTeamMembers();
    }
  }, [assignedToOptions]);

  // Synchroniser avec le système global d'agent sélectionné
  useEffect(() => {
    if (selectedAgent !== assignedTo) {
      onAssignedToChange(selectedAgent);
    }
  }, [selectedAgent, assignedTo]);

  const handleAgentSelect = (agentId: string | null) => {
    // Mettre à jour à la fois le filtre local et le système global
    onAssignedToChange(agentId);
    handleAgentChange(agentId);
  };

  // Trouver le nom du commercial actuellement sélectionné
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
