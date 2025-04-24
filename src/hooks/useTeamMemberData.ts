
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface TeamMember {
  id: string;
  name: string;
  role?: string;
  is_admin?: boolean;
}

interface TeamMemberData {
  localTeamMembers: TeamMember[];
  currentUserTeamId: string | null;
  userRole: string | null;
  isLoading: boolean;
  isUserAdmin: boolean;
}

export const useTeamMemberData = (providedMembers: TeamMember[]) => {
  const { isAdmin, isCommercial, user } = useAuth();
  const [localTeamMembers, setLocalTeamMembers] = useState<TeamMember[]>(providedMembers);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserTeamId, setCurrentUserTeamId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isUserAdmin, setIsUserAdmin] = useState(false);

  useEffect(() => {
    const loadTeamMembers = async () => {
      setIsLoading(true);
      try {
        console.log("[useTeamMemberData] Loading team members");
        
        if (user?.email) {
          // Récupération des données de l'utilisateur courant
          const { data: userData, error: userError } = await supabase
            .from('team_members')
            .select('id, name, role, is_admin')
            .eq('email', user.email)
            .maybeSingle();
            
          if (userError) {
            console.error("[useTeamMemberData] Error fetching user data:", userError);
          } else if (userData) {
            setCurrentUserTeamId(userData.id);
            setUserRole(userData.role);
            
            const isUserCommercial = userData.role === 'commercial';
            const userIsAdmin = userData.is_admin || userData.role === 'admin';
            setIsUserAdmin(userIsAdmin);
            
            // Pour tous les cas, récupérer tous les membres de l'équipe
            // Suppression du filtre restrictif pour les commerciaux
            const { data, error } = await supabase
              .from('team_members')
              .select('id, name, role, is_admin')
              .order('name');
              
            if (error) {
              throw error;
            } else if (data) {
              console.log("[useTeamMemberData] All team members loaded:", data.length);
              setLocalTeamMembers(data);
            }
          } else {
            console.warn("[useTeamMemberData] User not found:", user.email);
            toast({
              variant: "destructive",
              title: "Erreur d'identification",
              description: "Votre compte utilisateur n'est pas correctement configuré.",
            });
            
            // Même si l'utilisateur n'est pas trouvé, on charge quand même tous les membres
            const { data, error } = await supabase
              .from('team_members')
              .select('id, name, role, is_admin')
              .order('name');
              
            if (error) {
              throw error;
            } else if (data) {
              setLocalTeamMembers(data);
            }
          }
        }
      } catch (err) {
        console.error("[useTeamMemberData] Exception:", err);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger la liste des agents."
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (providedMembers.length === 0) {
      loadTeamMembers();
    } else {
      setLocalTeamMembers(providedMembers);
      
      if (user?.email) {
        const findUserInfo = async () => {
          const { data: userData } = await supabase
            .from('team_members')
            .select('id, role, is_admin')
            .eq('email', user.email)
            .maybeSingle();
              
          if (userData) {
            setCurrentUserTeamId(userData.id);
            setUserRole(userData.role);
            setIsUserAdmin(userData.is_admin || userData.role === 'admin');
          }
        };
        
        findUserInfo();
      }
    }
  }, [providedMembers, user?.email]);

  return {
    localTeamMembers,
    currentUserTeamId,
    userRole,
    isLoading,
    isUserAdmin,
  };
};
