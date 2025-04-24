
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TeamMember } from '../types/chatTypes';

export const useTeamMembers = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        console.log('[useTeamMembers] Chargement des membres d\'équipe...');
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('team_members')
          .select('id, name')
          .order('name');

        if (error) {
          console.error('[useTeamMembers] Erreur Supabase:', error);
          setError(new Error(`Erreur lors du chargement des membres: ${error.message}`));
          return;
        }

        if (data) {
          console.log('[useTeamMembers] Membres trouvés:', data.length);
          setTeamMembers(data);
        } else {
          console.log('[useTeamMembers] Aucun membre trouvé');
          setTeamMembers([]);
        }
      } catch (err) {
        const error = err as Error;
        console.error('[useTeamMembers] Exception:', error);
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamMembers();
  }, []);
  
  return { teamMembers, isLoading, error };
};
