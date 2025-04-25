
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TeamMember } from '../types/chatTypes';

// Important IDs to never forget
const JACQUES_ID = "e59037a6-218d-4504-a3ad-d2c399784dc7";
const PIERRE_AXEL_ID = "ccbc635f-0282-427b-b130-82c1f0fbdbf9";
const JADE_ID = "acab847b-7ace-4681-989d-86f78549aa69";
const JEAN_MARC_ID = "af8e053c-8fae-4424-abaa-d79029fd8a11";
const SHARON_ID = "e564a874-2520-4167-bfa8-26d39f119470"; // Sharon's UUID
const CHRISTELLE_ID = "06e60e2c-4835-4d19-bdf1-5d06f5d2b7e9";
const CHLOE_ID = "28c03acf-cb78-46b7-8dba-c1edee49c932";
const CHRISTINE_ID = "af1c9117-f94f-44d0-921f-776dd5fd6f96";
const OPHELIE_ID = "2d8bae00-a935-439d-8685-0adf238a612e";

// Liste des membres garantis
const GUARANTEED_MEMBERS: Record<string, {name: string, email: string}> = {
  [JACQUES_ID]: { name: 'Jacques Charles', email: 'jacques@gadait-international.com' },
  [PIERRE_AXEL_ID]: { name: 'Pierre-Axel Gadait', email: 'pierre@gadait-international.com' },
  [JADE_ID]: { name: 'Jade Diouane', email: 'jade@gadait-international.com' },
  [JEAN_MARC_ID]: { name: 'Jean Marc Perrissol', email: 'jeanmarc@gadait-international.com' },
  [SHARON_ID]: { name: 'Sharon Ramdiane', email: 'sharon@gadait-international.com' },
  [CHRISTELLE_ID]: { name: 'Christelle Gadait', email: 'christelle@gadait-international.com' },
  [CHLOE_ID]: { name: 'Chloe Valentin', email: 'chloe@gadait-international.com' },
  [CHRISTINE_ID]: { name: 'Christine Francoise', email: 'admin@gadait-international.com' },
  [OPHELIE_ID]: { name: 'Ophelie Durand', email: 'ophelie@gadait-international.com' }
};

export const useTeamMembers = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const { data, error } = await supabase
          .from('team_members')
          .select('id, name, email')
          .order('name');

        if (error) {
          console.error('Error fetching team members:', error);
          return;
        }

        let membersData = data || [];
        
        // Ensure all guaranteed members are present
        Object.entries(GUARANTEED_MEMBERS).forEach(([id, member]) => {
          const memberExists = membersData.some(m => m.id === id);
          if (!memberExists) {
            membersData.push({
              id: id,
              name: member.name,
              email: member.email
            });
            console.log(`${member.name} has been manually added to the team members list`);
          }
        });
        
        // Remove duplicates and sort
        const uniqueMembers = Array.from(
          new Map(membersData.map(m => [m.id, m])).values()
        );
        
        uniqueMembers.sort((a, b) => a.name.localeCompare(b.name));

        setTeamMembers(uniqueMembers);
      } catch (error) {
        console.error('Unexpected error fetching team members:', error);
      }
    };

    fetchTeamMembers();
  }, []);
  
  return { teamMembers };
};
