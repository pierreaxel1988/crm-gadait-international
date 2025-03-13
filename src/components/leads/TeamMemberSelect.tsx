
import React from 'react';
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

// Définir les types pour les props
interface TeamMemberSelectProps {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  label?: string;
}

const TeamMemberSelect = ({ 
  value, 
  onChange, 
  label = "Attribuer à" 
}: TeamMemberSelectProps) => {
  const isMobile = useIsMobile();
  
  // Liste des membres de l'équipe (à remplacer par des données dynamiques)
  const teamMembers = [
    { id: "1", name: "Alexandre Dupont" },
    { id: "2", name: "Sophie Martin" },
    { id: "3", name: "Jean Lafitte" },
  ];

  const handleChange = (newValue: string) => {
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
      </div>
    </div>
  );
};

export default TeamMemberSelect;
