
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
        console.log('[useTeamMembers] User email:', user?.email);
        
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
        
        // Toujours récupérer tous les membres d'équipe
        let query = supabase
          .from('team_members')
          .select('id, name, email');
          
        // Si l'utilisateur est un commercial sans droits d'admin, filtrer pour son propre email
        if (isCommercial && !isAdmin && user?.email) {
          console.log(`[useTeamMembers] Filtrage pour commercial: ${user.email}`);
          query = query.eq('email', user.email);
        }
        
        // Exécuter la requête finale
        const { data, error: fetchError } = await query.order('name');

        if (fetchError) {
          console.error('[useTeamMembers] Erreur Supabase:', fetchError);
          setError(new Error(`Erreur lors du chargement des membres: ${fetchError.message}`));
          return;
        }

        // Consigner les résultats pour diagnostic
        console.log('[useTeamMembers] Résultats de la requête:', data);

        if (data && data.length > 0) {
          console.log('[useTeamMembers] Membres trouvés:', data.length);
          setTeamMembers(data);
        } else {
          console.log('[useTeamMembers] Aucun membre trouvé ou tableau vide');
          
          // Récupérer le nombre total de membres pour diagnostic
          const { count, error: countError } = await supabase
            .from('team_members')
            .select('*', { count: 'exact', head: true });
            
          if (countError) {
            console.error('[useTeamMembers] Erreur lors du comptage des membres:', countError);
          } else {
            console.log(`[useTeamMembers] Nombre total de membres dans la table: ${count}`);
            if (count === 0) {
              setError(new Error('Aucun membre d\'équipe trouvé dans la base de données'));
            } else if (isCommercial && !isAdmin && user?.email) {
              // Si c'est un commercial, essayer sans filtre comme dernier recours
              console.log('[useTeamMembers] Tentative sans filtre pour un commercial');
              const { data: allData } = await supabase
                .from('team_members')
                .select('id, name, email')
                .order('name');
                
              if (allData && allData.length > 0) {
                console.log('[useTeamMembers] Membres trouvés sans filtre:', allData.length);
                const userMember = allData.filter(m => m.email === user.email);
                if (userMember.length > 0) {
                  console.log('[useTeamMembers] Membre trouvé pour l\'utilisateur:', userMember[0].name);
                  setTeamMembers(userMember);
                } else {
                  setTeamMembers([]);
                }
              }
            }
          }
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
    
    // Ajouter un interval pour rafraîchir les données toutes les 10 secondes en cas d'échec
    const intervalId = setInterval(() => {
      if (teamMembers.length === 0 && error) {
        console.log('[useTeamMembers] Tentative de rechargement des membres après erreur');
        setError(null); // Réinitialiser l'erreur avant de réessayer
        fetchTeamMembers();
      }
    }, 10000);
    
    return () => clearInterval(intervalId);
  }, [isAdmin, isCommercial, user?.email]);
  
  return { teamMembers, isLoading, error };
};
