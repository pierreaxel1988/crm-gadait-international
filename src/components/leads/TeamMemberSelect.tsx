
import React, { useEffect, useState } from 'react';
import { Check, User, ChevronDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { GUARANTEED_TEAM_MEMBERS } from '@/services/teamMemberService';

// Important IDs that must be preserved
const JADE_ID = "acab847b-7ace-4681-989d-86f78549aa69"; // Jade's correct UUID
const JEAN_MARC_ID = "af8e053c-8fae-4424-abaa-d79029fd8a11"; // Jean Marc's correct UUID

interface TeamMemberSelectProps {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}

const TeamMemberSelect: React.FC<TeamMemberSelectProps> = ({
  value,
  onChange,
  label = "Responsable du suivi",
  placeholder = "Sélectionner un agent",
  disabled = false
}) => {
  const [selectedMemberName, setSelectedMemberName] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState(GUARANTEED_TEAM_MEMBERS);

  // Convert legacy IDs to proper UUIDs
  useEffect(() => {
    // Convert string IDs to the correct UUIDs if needed
    if (value === 'jade-diouane') {
      console.log("Converting 'jade-diouane' to proper UUID:", JADE_ID);
      onChange(JADE_ID);
    } else if (value === 'jean-marc-perrissol') {
      console.log("Converting 'jean-marc-perrissol' to proper UUID:", JEAN_MARC_ID);
      onChange(JEAN_MARC_ID);
    }
  }, [value, onChange]);

  // Find selected member name for display
  useEffect(() => {
    if (value) {
      const member = teamMembers.find(m => m.id === value);
      if (member) {
        console.log("Found selected member:", member.name);
        setSelectedMemberName(member.name);
      } else {
        // Chercher dans les membres garantis au cas où le membre n'est pas encore chargé
        const guaranteedMember = GUARANTEED_TEAM_MEMBERS.find(m => m.id === value);
        if (guaranteedMember) {
          setSelectedMemberName(guaranteedMember.name);
        } else {
          setSelectedMemberName(null);
        }
      }
    } else {
      setSelectedMemberName(null);
    }
  }, [value, teamMembers]);

  const handleValueChange = (newValue: string) => {
    console.log("Selected agent value:", newValue);
    const member = teamMembers.find(m => m.id === newValue);
    if (member) {
      console.log("Selected agent name:", member.name);
    }
    onChange(newValue);
  };

  return (
    <Select
      value={value || ""}
      onValueChange={handleValueChange}
      disabled={disabled}
    >
      <SelectTrigger className="w-full flex bg-white font-futura">
        <SelectValue placeholder={placeholder}>
          <div className="flex items-center">
            {value && (
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                {selectedMemberName || placeholder}
              </div>
            )}
            {!value && placeholder}
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-64 font-futura">
        <SelectGroup>
          {teamMembers.map(member => (
            <SelectItem 
              key={member.id} 
              value={member.id}
              className="flex items-center cursor-pointer py-1.5"
            >
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                {member.name}
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default TeamMemberSelect;
