
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

  // Fonction pour charger tous les membres de l'équipe - SIMPLIFIÉE
  const fetchTeamMembers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('[TeamMemberSelect] Chargement des membres d\'équipe');
      
      // Vérification de la connexion à Supabase
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('[TeamMemberSelect] Pas de session Supabase active');
        setError("Vous n'êtes pas authentifié");
        setIsLoading(false);
        return;
      }
      
      // IMPORTANT: Récupération de TOUS les membres d'équipe sans aucun filtre
      const { data, error: fetchError } = await supabase
        .from('team_members')
        .select('id, name, email, is_admin')
        .order('name');

      if (fetchError) {
        console.error('[TeamMemberSelect] Erreur Supabase:', fetchError);
        throw new Error(`Erreur lors du chargement des commerciaux: ${fetchError.message}`);
      }

      console.log('[TeamMemberSelect] Données brutes reçues:', data);

      if (data && data.length > 0) {
        // Utiliser TOUTES les données retournées sans filtrage supplémentaire
        setTeamMembers(data);
        console.log('[TeamMemberSelect] Membres trouvés:', data.length);
        
        // Si l'utilisateur est un commercial et pas un admin, trouver son ID
        if (isCommercial && !isAdmin && user?.email) {
          const commercialMember = data.find(m => m.email === user.email);
          if (commercialMember) {
            console.log('[TeamMemberSelect] ID trouvé pour le commercial:', commercialMember.id);
            setCurrentUserTeamId(commercialMember.id);
            
            // Auto-assignation uniquement si aucune valeur n'est définie
            if (!value) {
              console.log('[TeamMemberSelect] Auto-assignation pour commercial:', commercialMember.id);
              onChange(commercialMember.id);
              setSelectedMemberName(commercialMember.name);
            }
          }
        }
        
        // Auto-sélection de Pierre-Axel si demandé
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
        setError("Aucun membre d'équipe n'a été trouvé dans la base de données");
      }
    } catch (error) {
      console.error('[TeamMemberSelect] Erreur détaillée:', error);
      setError("Impossible de charger la liste des commerciaux");
    } finally {
      setIsLoading(false);
    }
  };

  // Chargement des données au montage du composant
  useEffect(() => {
    fetchTeamMembers();
  }, [autoSelectPierreAxel, isAdmin, isCommercial, user?.email]);
  
  // Effet pour actualiser lorsque value change
  useEffect(() => {
    if (value && teamMembers.length > 0) {
      const selectedMember = teamMembers.find(member => member.id === value);
      if (selectedMember) {
        setSelectedMemberName(selectedMember.name);
      }
    }
  }, [value, teamMembers]);

  const handleChange = (newValue: string) => {
    // Valider la sélection pour les commerciaux
    if (isCommercial && !isAdmin && newValue !== "non_assigné" && newValue !== currentUserTeamId) {
      toast({
        variant: "destructive",
        title: "Permission refusée",
        description: "En tant que commercial, vous ne pouvez assigner qu'à vous-même."
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
            {teamMembers.length === 0 && !isLoading && (
              <SelectItem value="no_members" disabled>
                Aucun commercial disponible
              </SelectItem>
            )}
            {isLoading && (
              <SelectItem value="loading" disabled>
                Chargement des commerciaux...
              </SelectItem>
            )}
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
        <div className="text-xs text-red-600 mt-1 flex flex-col">
          <span>{error}</span>
          <button 
            onClick={fetchTeamMembers} 
            className="text-blue-600 underline text-xs mt-1 self-start"
          >
            Réessayer de charger les commerciaux
          </button>
        </div>
      )}
      {teamMembers.length === 0 && !isLoading && !error && (
        <div className="text-xs text-amber-600 mt-1">
          Aucun commercial disponible dans la liste.
          <button 
            onClick={fetchTeamMembers} 
            className="text-blue-600 underline block mt-1"
          >
            Forcer le rechargement
          </button>
        </div>
      )}
    </div>
  );
};

export default TeamMemberSelect;
