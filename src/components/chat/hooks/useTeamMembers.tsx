
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TeamMember } from '../types/chatTypes';

// IDs importants à ne jamais oublier
const JACQUES_ID = "e59037a6-218d-4504-a3ad-d2c399784dc7";
const PIERRE_AXEL_ID = "ccbc635f-0282-427b-b130-82c1f0fbdbf9";

// Liste des membres garantis
const GUARANTEED_MEMBERS: Record<string, {name: string}> = {
  [JACQUES_ID]: { name: 'Jacques Charles' },
  [PIERRE_AXEL_ID]: { name: 'Pierre-Axel Gadait' },
  "chloe-valentin": { name: 'Chloe Valentin' },
  "christelle-gadait": { name: 'Christelle Gadait' },
  "christine-francoise": { name: 'Christine Francoise' },
  "jade-diouane": { name: 'Jade Diouane' },
  "jean-marc-perrissol": { name: 'Jean Marc Perrissol' },
  "sharon-ramdiane": { name: 'Sharon Ramdiane' },
  "ophelie-durand": { name: 'Ophelie Durand' }
};

export const useTeamMembers = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const { data, error } = await supabase
          .from('team_members')
          .select('id, name')
          .order('name');

        if (error) {
          console.error('Error fetching team members:', error);
          return;
        }

        let membersData = data || [];
        
        // S'assurer que tous les membres garantis sont présents
        Object.entries(GUARANTEED_MEMBERS).forEach(([id, member]) => {
          const memberExists = membersData.some(m => m.name === member.name);
          if (!memberExists) {
            membersData.push({
              id: id,
              name: member.name
            });
            console.log(`${member.name} a été ajouté manuellement à la liste des agents (hook)`);
          }
        });
        
        // Trier les membres par nom
        membersData.sort((a, b) => a.name.localeCompare(b.name));

        if (membersData) {
          setTeamMembers(membersData);
        }
      } catch (error) {
        console.error('Unexpected error fetching team members:', error);
      }
    };

    fetchTeamMembers();
  }, []);
  
  return { teamMembers };
};
