
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TeamMember } from '../components/chat/types/chatTypes';
import { SPECIFIC_AGENTS } from '@/components/actions/filters/AgentFilterButtons';

export const useTeamMembers = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const { data: membersData, error } = await supabase
          .from('team_members')
          .select('id, name')
          .order('name');

        if (error) {
          console.error('Error fetching team members:', error);
          return;
        }

        // Ensure all specific agents are included
        let allMembers = membersData || [];
        
        // Add any specific agents that aren't already in the database
        SPECIFIC_AGENTS.forEach(agent => {
          const exists = allMembers.some(m => m.id === agent.id);
          if (!exists) {
            allMembers.push({
              id: agent.id,
              name: agent.name
            });
          }
        });
        
        // Sort by name
        allMembers.sort((a, b) => a.name.localeCompare(b.name));
        
        setTeamMembers(allMembers);
      } catch (error) {
        console.error('Unexpected error fetching team members:', error);
      }
    };

    fetchTeamMembers();
  }, []);
  
  return { teamMembers };
};
