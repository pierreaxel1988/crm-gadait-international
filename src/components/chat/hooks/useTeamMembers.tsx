
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TeamMember } from '../types/chatTypes';

export const useTeamMembers = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const { data, error } = await supabase
          .from('team_members')
          .select('id, name')
          .order('name');

        if (error) {
          console.error('Error fetching team members:', error);
          return;
        }

        if (data) {
          setTeamMembers(data);
        }
      } catch (error) {
        console.error('Unexpected error fetching team members:', error);
      }
    };

    fetchTeamMembers();
  }, []);
  
  return { teamMembers };
};
