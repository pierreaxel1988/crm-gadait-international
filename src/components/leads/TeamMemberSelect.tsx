
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
import { useTeamMembers } from '@/components/chat/hooks/useTeamMembers';
import { PIERRE_AXEL_ID } from '@/services/teamMemberService';

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
  const { teamMembers } = useTeamMembers();
  const [selectedMemberName, setSelectedMemberName] = useState<string | null>(null);
  
  // Log team members to help debug
  useEffect(() => {
    console.log("TeamMemberSelect - Available team members:", teamMembers);
  }, [teamMembers]);
  
  // Log when value changes
  useEffect(() => {
    console.log("TeamMemberSelect - Selected value:", value);
    
    // Ensure we're using the correct Pierre Axel ID
    if (value && value !== PIERRE_AXEL_ID && teamMembers.find(m => m.id === value)?.name === 'Pierre-Axel Gadait') {
      console.log("Converting to correct Pierre Axel ID");
      onChange(PIERRE_AXEL_ID);
    }
  }, [value, teamMembers, onChange]);

  // Find selected member name for display
  useEffect(() => {
    if (value) {
      const member = teamMembers.find(m => m.id === value);
      if (member) {
        setSelectedMemberName(member.name);
      } else {
        setSelectedMemberName(null);
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

  // Make sure we only have unique team members for display
  const uniqueMembers = Array.from(
    new Map(teamMembers.map(member => [member.id, member])).values()
  ).sort((a, b) => a.name.localeCompare(b.name));

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
          {uniqueMembers.map(member => (
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
