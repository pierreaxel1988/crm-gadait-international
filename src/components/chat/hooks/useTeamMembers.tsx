
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TeamMember } from '../types/chatTypes';
import { useAuth } from '@/hooks/useAuth';

export const useTeamMembers = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { isAdmin, isCommercial, user } = useAuth();
  
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        console.log('[useTeamMembers] Chargement des membres d\'équipe - isAdmin:', isAdmin, 'isCommercial:', isCommercial);
        setIsLoading(true);
        
        let query = supabase
          .from('team_members')
          .select('id, name');
        
        // Pour les commerciaux, filtrer pour ne voir que leur propre entrée
        if (isCommercial && !isAdmin && user?.email) {
          console.log(`[useTeamMembers] Filtrage pour commercial: ${user.email}`);
          query = query.eq('email', user.email);
        } else {
          console.log('[useTeamMembers] Chargement de tous les membres (mode Admin)');
        }
        
        // Exécuter la requête finale
        const { data, error } = await query.order('name');

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
  }, [isAdmin, isCommercial, user?.email]);
  
  return { teamMembers, isLoading, error };
};
