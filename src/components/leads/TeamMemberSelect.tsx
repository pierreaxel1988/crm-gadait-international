
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
}) => {
  const isMobile = useIsMobile();
  const { isAdmin, isCommercial, user } = useAuth();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMemberName, setSelectedMemberName] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [currentUserTeamId, setCurrentUserTeamId] = useState<string | null>(null);

  // Fonction pour charger les membres de l'équipe en fonction du rôle utilisateur
  const fetchTeamMembers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('[TeamMemberSelect] Début du chargement des membres d\'équipe');
      console.log('[TeamMemberSelect] User role - Admin:', isAdmin, 'Commercial:', isCommercial);
      
      // Construire la requête pour récupérer les membres d'équipe
      let query = supabase.from('team_members').select('id, name, email, is_admin');
      
      // Pour les commerciaux qui ne sont pas admin, filtrer pour ne voir que leur propre entrée
      if (isCommercial && !isAdmin && user?.email) {
        console.log(`[TeamMemberSelect] Filtrage pour commercial: ${user.email}`);
        query = query.eq('email', user.email);
        
        // Récupérer également l'ID de l'utilisateur actuel pour l'auto-assignation
        const { data: currentUser } = await supabase
          .from('team_members')
          .select('id')
          .eq('email', user.email)
          .maybeSingle();
          
        if (currentUser) {
          console.log('[TeamMemberSelect] ID utilisateur courant trouvé:', currentUser.id);
          setCurrentUserTeamId(currentUser.id);
        }
      } else {
        console.log('[TeamMemberSelect] Chargement de tous les membres (mode Admin)');
      }
      
      // Exécuter la requête
      const { data, error } = await query.order('name');

      if (error) {
        console.error('[TeamMemberSelect] Erreur Supabase:', error);
        throw new Error(`Erreur lors du chargement des commerciaux: ${error.message}`);
      }

      console.log('[TeamMemberSelect] Réponse Supabase:', data);

      if (data && data.length > 0) {
        setTeamMembers(data);
        console.log('[TeamMemberSelect] Membres trouvés:', data.length);
        
        // Auto-sélection pour les commerciaux qui ne sont pas admin
        if (isCommercial && !isAdmin && currentUserTeamId && !value) {
          console.log('[TeamMemberSelect] Auto-assignation pour commercial:', currentUserTeamId);
          onChange(currentUserTeamId);
          
          const commercialName = data.find(m => m.id === currentUserTeamId)?.name;
          if (commercialName) {
            setSelectedMemberName(commercialName);
          }
        }
        // Auto-sélection de Pierre-Axel pour les admins si demandé
        else if (autoSelectPierreAxel && !value && isAdmin) {
          const pierreAxel = data.find(member => 
            member.name.toLowerCase().includes('pierre-axel'));
          
          if (pierreAxel) {
            console.log('[TeamMemberSelect] Auto-sélection de Pierre-Axel');
            onChange(pierreAxel.id);
            setSelectedMemberName(pierreAxel.name);
          }
        }
        
        // Mettre à jour le nom sélectionné si une valeur est déjà définie
        if (value) {
          const selectedMember = data.find(member => member.id === value);
          if (selectedMember) {
            setSelectedMemberName(selectedMember.name);
          }
        }
      } else {
        console.log("[TeamMemberSelect] Aucun membre d'équipe trouvé dans la réponse");
        
        // Vérifier le nombre total de membres dans la table
        const { count, error: countError } = await supabase
          .from('team_members')
          .select('*', { count: 'exact', head: true });
          
        if (countError) {
          console.error('[TeamMemberSelect] Erreur lors du comptage des membres:', countError);
        } else {
          console.log(`[TeamMemberSelect] Nombre total de membres dans la table: ${count}`);
          if (count === 0) {
            setError("Aucun membre d'équipe n'a été trouvé dans la base de données");
          }
        }
      }
    } catch (error) {
      console.error('[TeamMemberSelect] Erreur détaillée:', error);
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

  useEffect(() => {
    fetchTeamMembers();
  }, [autoSelectPierreAxel, value, isAdmin, isCommercial, user?.email]);

  const handleChange = (newValue: string) => {
    // Pour les commerciaux, vérifier qu'ils ne s'assignent qu'à eux-mêmes
    if (isCommercial && !isAdmin && currentUserTeamId && newValue !== "non_assigné" && newValue !== currentUserTeamId) {
      console.log('[TeamMemberSelect] Commercial tentant d\'assigner à un autre commercial - bloqué');
      toast({
        variant: "destructive",
        title: "Action non autorisée",
        description: "En tant que commercial, vous ne pouvez assigner les leads qu'à vous-même."
      });
      return;
    }
    
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
