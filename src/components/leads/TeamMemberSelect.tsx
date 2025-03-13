
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { useIsMobile } from '@/hooks/use-mobile';

interface TeamMember {
  id: string;
  name: string;
  email: string;
}

interface TeamMemberSelectProps {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  label?: string;
  required?: boolean;
}

const TeamMemberSelect = ({ value, onChange, label = "Attribuer à", required = false }: TeamMemberSelectProps) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const { data, error } = await supabase
          .from('team_members')
          .select('id, name, email')
          .order('name');

        if (error) throw error;
        setTeamMembers(data || []);
      } catch (err) {
        console.error("Erreur lors du chargement des membres de l'équipe:", err);
        setError("Impossible de charger les membres de l'équipe");
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, []);

  if (error) {
    return <div className="text-red-500 text-sm">{error}</div>;
  }

  return (
    <div className="space-y-1 md:space-y-2">
      <Label htmlFor="assigned_to" className={isMobile ? 'text-xs' : ''}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {loading ? (
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Chargement des membres...</span>
        </div>
      ) : (
        <Select 
          value={value} 
          onValueChange={(val) => onChange(val || undefined)}
        >
          <SelectTrigger className={isMobile ? 'h-8 text-sm' : ''}>
            <SelectValue placeholder="Sélectionner un membre" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Non attribué</SelectItem>
            {teamMembers.map((member) => (
              <SelectItem key={member.id} value={member.id}>
                {member.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};

export default TeamMemberSelect;
