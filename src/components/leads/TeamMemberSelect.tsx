
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

// Définir les types pour les props
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
}

// IDs de tous les membres importants - à ne jamais supprimer de l'interface
const JACQUES_ID = "e59037a6-218d-4504-a3ad-d2c399784dc7";
const PIERRE_AXEL_ID = "ccbc635f-0282-427b-b130-82c1f0fbdbf9";

// Liste des membres garantis pour avoir toujours les données à jour
const GUARANTEED_MEMBERS: Record<string, {name: string, email: string}> = {
  [JACQUES_ID]: {
    name: 'Jacques Charles',
    email: 'jacques@gadait-international.com'
  },
  [PIERRE_AXEL_ID]: {
    name: 'Pierre-Axel Gadait',
    email: 'pierre@gadait-international.com'
  }
};

const TeamMemberSelect = ({ 
  value, 
  onChange, 
  label = "Attribuer à",
  autoSelectPierreAxel = false,
  disabled = false
}: TeamMemberSelectProps) => {
  const isMobile = useIsMobile();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMemberName, setSelectedMemberName] = useState<string | undefined>();

  useEffect(() => {
    const fetchTeamMembers = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('team_members')
          .select('id, name, email')
          .order('name');

        if (error) {
          throw error;
        }

        let membersData = data || [];
        
        // S'assurer que tous les membres garantis sont présents
        Object.entries(GUARANTEED_MEMBERS).forEach(([id, member]) => {
          const memberIndex = membersData.findIndex(m => m.id === id);
          if (memberIndex === -1) {
            membersData.push({
              id,
              name: member.name,
              email: member.email
            });
            console.log(`${member.name} a été ajouté manuellement à la liste des agents`);
          } else {
            // Mettre à jour les informations pour s'assurer qu'elles sont correctes
            membersData[memberIndex].name = member.name;
            membersData[memberIndex].email = member.email;
          }
        });
        
        // Trier les membres par nom
        membersData.sort((a, b) => a.name.localeCompare(b.name));
        
        setTeamMembers(membersData);
        
        // Auto-select Pierre Axel Gadait if requested and no value is already set
        if (autoSelectPierreAxel && !value && membersData.length > 0) {
          const pierreAxel = membersData.find(member => member.id === PIERRE_AXEL_ID);
          
          if (pierreAxel) {
            onChange(pierreAxel.id);
            setSelectedMemberName(pierreAxel.name);
            console.log("Auto-selected Pierre-Axel:", pierreAxel.id);
          }
        }
        
        // Set the name for the already selected member
        if (value && membersData.length > 0) {
          const selectedMember = membersData.find(member => member.id === value);
          if (selectedMember) {
            setSelectedMemberName(selectedMember.name);
            console.log("Found selected member:", selectedMember.name);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des commerciaux:', error);
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
  }, [autoSelectPierreAxel, onChange, value]);

  const handleChange = (newValue: string) => {
    console.log("Selected agent value:", newValue);
    
    // Update selected member name
    if (newValue !== "non_assigné") {
      const selectedMember = teamMembers.find(member => member.id === newValue);
      if (selectedMember) {
        setSelectedMemberName(selectedMember.name);
        console.log("Selected agent name:", selectedMember.name);
      }
    } else {
      setSelectedMemberName(undefined);
    }
    
    // Si "non_assigné" est sélectionné, on passe undefined
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
          <SelectContent searchable>
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
    </div>
  );
};

export default TeamMemberSelect;
