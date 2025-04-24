
import React, { useEffect, useState } from 'react';
import { User } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface TeamMemberSelectProps {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  label?: string;
  autoSelectPierreAxel?: boolean;
  disabled?: boolean;
  enforceRlsRules?: boolean;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  is_admin?: boolean;
}

const TeamMemberSelect: React.FC<TeamMemberSelectProps> = ({ 
  value, 
  onChange, 
  label = "Attribuer à",
  autoSelectPierreAxel = false,
  disabled = false,
  enforceRlsRules = false
}) => {
  const isMobile = useIsMobile();
  const { user, isAdmin } = useAuth();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMemberName, setSelectedMemberName] = useState<string | undefined>();
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('Tentative de récupération des membres d\'équipe...');
        
        // Vérifier d'abord la connexion à Supabase
        try {
          const { data: pingData, error: pingError } = await supabase.from('team_members').select('count(*)', { count: 'exact', head: true });
          if (pingError) {
            console.error('Erreur de connexion à Supabase:', pingError);
            throw new Error('Problème de connexion à la base de données');
          }
          console.log('Connexion à Supabase établie, compte:', pingData);
        } catch (pingError) {
          console.error('Erreur lors du ping à Supabase:', pingError);
          setConnectionAttempts(prev => prev + 1);
          if (connectionAttempts < 3) {
            // Attendre un peu et réessayer
            setTimeout(() => fetchTeamMembers(), 1000);
            return;
          }
        }
        
        const { data, error } = await supabase
          .from('team_members')
          .select('id, name, email, is_admin');

        if (error) {
          console.error('Erreur Supabase complète:', error);
          throw error;
        }

        console.log('Réponse Supabase pour les membres d\'équipe:', data);

        if (data && data.length > 0) {
          setTeamMembers(data);
          console.log('Nombre de membres d\'équipe trouvés:', data.length);
          
          if (autoSelectPierreAxel && !value) {
            const pierreAxel = data.find(member => 
              member.name.toLowerCase().includes('pierre-axel'));
            
            if (pierreAxel) {
              onChange(pierreAxel.id);
              setSelectedMemberName(pierreAxel.name);
            }
          }
          
          if (value && data) {
            const selectedMember = data.find(member => member.id === value);
            if (selectedMember) {
              setSelectedMemberName(selectedMember.name);
            }
          }
        } else {
          console.log("Aucun membre d'équipe trouvé dans la réponse");
          setError("Aucun membre d'équipe n'a été trouvé");
        }
      } catch (error) {
        console.error('Erreur détaillée lors du chargement des commerciaux:', error);
        setError("Impossible de charger la liste des commerciaux");
        toast({
          variant: "destructive",
          title: "Erreur de chargement",
          description: "Impossible de charger la liste des commerciaux."
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamMembers();
  }, [autoSelectPierreAxel, onChange, value, connectionAttempts]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!user?.email) return;
      
      try {
        const { data, error } = await supabase
          .from('team_members')
          .select('id')
          .eq('email', user.email)
          .maybeSingle(); // Utiliser maybeSingle au lieu de single pour éviter l'erreur
          
        if (error) {
          console.error("Error fetching current user ID:", error);
          return;
        }
        
        if (data) {
          console.log("ID d'utilisateur actuel trouvé:", data.id);
          setCurrentUserId(data.id);
        } else {
          console.log("Aucun utilisateur trouvé avec l'email:", user.email);
        }
      } catch (error) {
        console.error("Error fetching current user ID:", error);
      }
    };
    
    fetchCurrentUser();
  }, [user]);

  const handleChange = (newValue: string) => {
    if (newValue !== "non_assigné") {
      const selectedMember = teamMembers.find(member => member.id === newValue);
      if (selectedMember) {
        setSelectedMemberName(selectedMember.name);
      }
    } else {
      setSelectedMemberName(undefined);
    }
    
    onChange(newValue === "non_assigné" ? undefined : newValue);
  };

  return (
    <div className="space-y-1 md:space-y-2">
      <Label htmlFor="assigned_to" className={isMobile ? 'text-xs' : ''}>
        {label}
      </Label>
      <div className="relative">
        <Select
          value={value || "non_assigné"}
          onValueChange={handleChange}
          disabled={isLoading || disabled}
        >
          <SelectTrigger className={`w-full ${isMobile ? 'h-8 text-sm' : ''}`} id="assigned_to">
            <div className="flex items-center gap-2">
              <User className="h-3.5 w-3.5" />
              <SelectValue placeholder="Non assigné" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="non_assigné">Non assigné</SelectItem>
            {teamMembers.map((member) => (
              <SelectItem key={member.id} value={member.id}>
                {member.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isLoading && (
          <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-chocolate-dark rounded-full border-t-transparent"></div>
          </div>
        )}
      </div>
      {selectedMemberName && (
        <div className="text-sm text-green-600 mt-1">
          Agent sélectionné: {selectedMemberName}
        </div>
      )}
      {error && (
        <div className="text-xs text-red-600 mt-1">
          {error}
        </div>
      )}
      {teamMembers.length === 0 && !isLoading && !error && (
        <div className="text-xs text-amber-600 mt-1">
          Aucun commercial disponible dans la liste. Vérifiez votre connexion à Supabase.
        </div>
      )}
      {isLoading && (
        <div className="text-xs text-amber-600 mt-1">
          Chargement des commerciaux en cours...
        </div>
      )}
    </div>
  );
};

export default TeamMemberSelect;
