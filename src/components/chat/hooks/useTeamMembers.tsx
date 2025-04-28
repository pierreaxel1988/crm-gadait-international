
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TeamMember } from '../types/chatTypes';
import { GUARANTEED_TEAM_MEMBERS } from '@/services/teamMemberService';

export const useTeamMembers = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const { data, error } = await supabase
          .from('team_members')
          .select('id, name, email, role, is_admin')
          .order('name');

        if (error) {
          console.error('Error fetching team members:', error);
          return;
        }

        // Start with the guaranteed members
        let allMembers = [...GUARANTEED_TEAM_MEMBERS];
        
        // Add any additional members from the database that aren't already in the guaranteed list
        if (data) {
          data.forEach(dbMember => {
            // Only add if not already in the guaranteed list
            if (!allMembers.some(m => m.id === dbMember.id)) {
              allMembers.push(dbMember);
            }
          });
        }
        
        // Remove duplicates by creating a Map with IDs as keys
        const uniqueMembers = Array.from(
          new Map(allMembers.map(m => [m.id, m])).values()
        );
        
        // Sort members alphabetically
        uniqueMembers.sort((a, b) => a.name.localeCompare(b.name));
        
        setTeamMembers(uniqueMembers);
      } catch (error) {
        console.error('Unexpected error fetching team members:', error);
      }
    };

    fetchTeamMembers();
  }, []);
  
  return { teamMembers };
};
