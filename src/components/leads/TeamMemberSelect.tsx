
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
}) => {
  const isMobile = useIsMobile();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMemberName, setSelectedMemberName] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);

  // Fonction pour charger tous les membres de l'équipe
  const fetchAllTeamMembers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('[TeamMemberSelect] Chargement de tous les membres d\'équipe...');
      
      // Query simple sans filtres ni RLS
      const { data, error } = await supabase
        .from('team_members')
        .select('id, name, email, is_admin');

      if (error) {
        console.error('[TeamMemberSelect] Erreur Supabase:', error);
        throw new Error(`Erreur lors du chargement des commerciaux: ${error.message}`);
      }

      console.log('[TeamMemberSelect] Réponse Supabase:', data);

      if (data && data.length > 0) {
        setTeamMembers(data);
        console.log('[TeamMemberSelect] Membres trouvés:', data.length);
        
        if (autoSelectPierreAxel && !value) {
          const pierreAxel = data.find(member => 
            member.name.toLowerCase().includes('pierre-axel'));
          
          if (pierreAxel) {
            onChange(pierreAxel.id);
            setSelectedMemberName(pierreAxel.name);
          }
        }
        
        if (value) {
          const selectedMember = data.find(member => member.id === value);
          if (selectedMember) {
            setSelectedMemberName(selectedMember.name);
          }
        }
      } else {
        console.log("[TeamMemberSelect] Aucun membre d'équipe trouvé dans la réponse");
        setError("Aucun membre d'équipe n'a été trouvé");
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
    fetchAllTeamMembers();
  }, [autoSelectPierreAxel, value]);

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
