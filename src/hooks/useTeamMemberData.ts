
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
            setIsUserAdmin(userData.is_admin || userData.role === 'admin');
          }
          
          // Récupération de TOUS les membres d'équipe sans filtrage restrictif
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
