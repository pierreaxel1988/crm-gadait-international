
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
  const [localTeamMembers, setLocalTeamMembers] = useState<{ id: string; name: string }[]>(providedMembers);
  const [isLoading, setIsLoading] = useState(false);
  
  // Charger les membres d'équipe directement si nécessaire
  useEffect(() => {
    const loadTeamMembers = async () => {
      if (providedMembers.length > 0) return; // Ne pas charger si déjà fourni
      
      setIsLoading(true);
      try {
        console.log("[AgentFilterButtons] Chargement des membres d'équipe...");
        const { data, error } = await supabase
          .from('team_members')
          .select('id, name')
          .order('name');
          
        if (error) {
          console.error("[AgentFilterButtons] Erreur:", error);
        } else if (data && data.length > 0) {
          console.log("[AgentFilterButtons] Membres chargés:", data.length);
          setLocalTeamMembers(data);
        }
      } catch (err) {
        console.error("[AgentFilterButtons] Exception:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTeamMembers();
  }, [providedMembers]);
  
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
          <Button
            variant={agentFilter === null ? "default" : "outline"}
            size="sm"
            className="text-xs"
            onClick={() => setAgentFilter(null)}
          >
            Tous
          </Button>
          {membersToDisplay.map(member => (
            <Button
              key={member.id}
              variant={agentFilter === member.id ? "default" : "outline"}
              size="sm"
              className="text-xs whitespace-normal h-auto py-1.5"
              onClick={() => setAgentFilter(member.id)}
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
