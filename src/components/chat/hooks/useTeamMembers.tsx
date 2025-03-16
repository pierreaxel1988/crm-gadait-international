
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
}

export const useTeamMembers = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const fetchTeamMembers = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('team_members')
          .select('id, name, email')
          .order('name');
          
        if (error) throw error;
        
        setTeamMembers(data || []);
      } catch (error) {
        console.error('Error fetching team members:', error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger la liste des commerciaux."
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTeamMembers();
  }, []);
  
  return {
    teamMembers,
    isLoading
  };
};
