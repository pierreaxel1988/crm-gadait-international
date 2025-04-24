
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TeamMember } from '../components/chat/types/chatTypes';
import { useAuth } from '@/hooks/useAuth';

export const useTeamMembers = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { isAdmin, isCommercial, user } = useAuth();
  
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        console.log('[useTeamMembers] Chargement des membres d\'équipe');
        
        setIsLoading(true);
        setError(null);
        
        // Vérification de la session
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          console.log('[useTeamMembers] Pas de session Supabase active');
          setError(new Error("Vous n'êtes pas authentifié"));
          setIsLoading(false);
          return;
        }
        
        // Toujours récupérer tous les membres d'équipe sans filtre restrictif
        const { data, error: fetchError } = await supabase
          .from('team_members')
          .select('id, name, email')
          .order('name');
        
        if (fetchError) {
          console.error('[useTeamMembers] Erreur Supabase:', fetchError);
          setError(new Error(`Erreur lors du chargement des membres: ${fetchError.message}`));
          return;
        }

        console.log('[useTeamMembers] Résultats de la requête:', data?.length || 0, 'membres trouvés');

        if (data && data.length > 0) {
          setTeamMembers(data);
        } else {
          console.log('[useTeamMembers] Aucun membre trouvé ou tableau vide');
          setError(new Error('Aucun membre d\'équipe trouvé dans la base de données'));
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
