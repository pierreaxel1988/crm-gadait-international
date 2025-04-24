
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
  const [retryCount, setRetryCount] = useState(0);

  // Fonction pour charger tous les membres de l'équipe
  const fetchTeamMembers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('[TeamMemberSelect] Début du chargement des membres d\'équipe - Tentative #', retryCount + 1);
      console.log('[TeamMemberSelect] User role - Admin:', isAdmin, 'Commercial:', isCommercial);
      console.log('[TeamMemberSelect] User email:', user?.email);
      
      // Vérification de la connexion à Supabase
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('[TeamMemberSelect] Pas de session Supabase active');
        setError("Vous n'êtes pas authentifié");
        setIsLoading(false);
        return;
      }
      
      // Récupérer tous les membres d'équipe sans filtre sur le rôle
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
        setTeamMembers(data);
        console.log('[TeamMemberSelect] Membres trouvés:', data.length);
        
        // Si l'utilisateur est un commercial et pas un admin, trouver son ID
        if (isCommercial && !isAdmin && user?.email) {
          const commercialMember = data.find(m => m.email === user.email);
          if (commercialMember) {
            console.log('[TeamMemberSelect] ID trouvé pour le commercial:', commercialMember.id);
            setCurrentUserTeamId(commercialMember.id);
            
            // Pour les commerciaux, proposer l'auto-assignation
            if (!value) {
              console.log('[TeamMemberSelect] Auto-assignation pour commercial:', commercialMember.id);
              onChange(commercialMember.id);
              setSelectedMemberName(commercialMember.name);
              
              // Montrer un toast pour informer
              toast({
                title: "Auto-assignation",
                description: `Le lead sera assigné à vous (${commercialMember.name})`,
              });
            }
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
          } else {
            console.log('[TeamMemberSelect] ID membre sélectionné non trouvé dans les données:', value);
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
      
      if (retryCount < 3) {
        toast({
          variant: "destructive",
          title: "Erreur de chargement",
          description: "Impossible de charger la liste des commerciaux. Nouvelle tentative en cours..."
        });
      }
      
      setRetryCount(prev => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
    
    // Rafraîchir périodiquement si nécessaire
    const intervalId = setInterval(() => {
      if (teamMembers.length === 0 || error) {
        console.log('[TeamMemberSelect] Tentative programmée de rechargement des membres');
        fetchTeamMembers();
      }
    }, 5000); // Toutes les 5 secondes
    
    return () => clearInterval(intervalId);
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
            {teamMembers.length === 0 && (
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
          Aucun commercial disponible dans la liste. Vérification en cours...
          <button 
            onClick={fetchTeamMembers} 
            className="text-blue-600 underline block mt-1"
          >
            Forcer le rechargement
          </button>
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
