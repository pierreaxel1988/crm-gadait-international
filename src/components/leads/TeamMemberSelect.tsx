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

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!user?.email) return;
      
      try {
        const { data, error } = await supabase
          .from('team_members')
          .select('id')
          .eq('email', user.email)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setCurrentUserId(data.id);
        }
      } catch (error) {
        console.error("Error fetching current user ID:", error);
      }
    };
    
    fetchCurrentUser();
  }, [user]);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('team_members')
          .select('id, name, email, is_admin')
          .order('name');

        if (error) {
          throw error;
        }

        setTeamMembers(data || []);
        
        if (autoSelectPierreAxel && !value && data) {
          const pierreAxel = data.find(member => 
            member.name.toLowerCase().includes('pierre-axel gadait'));
          
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
        
        if (enforceRlsRules && !isAdmin && currentUserId && currentUserId !== value) {
          handleChange(currentUserId);
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
  }, [autoSelectPierreAxel, onChange, value, isAdmin, currentUserId, enforceRlsRules]);

  const handleChange = (newValue: string) => {
    if (enforceRlsRules && !isAdmin && currentUserId && newValue !== "non_assigné" && newValue !== currentUserId) {
      toast({
        variant: "destructive",
        title: "Action non autorisée",
        description: "En tant que commercial, vous ne pouvez assigner les leads qu'à vous-même."
      });
      
      if (!value || value === "non_assigné") {
        newValue = currentUserId;
      } else {
        return;
      }
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
          disabled={isLoading || disabled || (enforceRlsRules && !isAdmin && !!currentUserId)}
        >
          <SelectTrigger className={`w-full ${isMobile ? 'h-8 text-sm' : ''}`} id="assigned_to">
            <div className="flex items-center gap-2">
              <User className="h-3.5 w-3.5" />
              <SelectValue placeholder="Non assigné" />
            </div>
          </SelectTrigger>
          <SelectContent>
            {(!enforceRlsRules || isAdmin) && <SelectItem value="non_assigné">Non assigné</SelectItem>}
            {teamMembers.map((member) => {
              if (enforceRlsRules && !isAdmin && member.id !== currentUserId) {
                return null;
              }
              return (
                <SelectItem key={member.id} value={member.id}>
                  {member.name}
                </SelectItem>
              );
            })}
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
      {!isAdmin && enforceRlsRules && currentUserId && (
        <div className="text-xs text-amber-600 mt-1">
          En tant que commercial, vous ne pouvez créer que des leads assignés à vous-même.
        </div>
      )}
    </div>
  );
};

export default TeamMemberSelect;
