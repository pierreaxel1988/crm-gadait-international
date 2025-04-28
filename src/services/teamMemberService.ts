
// Define types for team members
import { supabase } from '@/integrations/supabase/client';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role?: string;
  is_admin?: boolean;
}

// Important IDs to never forget - we'll ensure these are consistent
export const JACQUES_ID = "e59037a6-218d-4504-a3ad-d2c399784dc7";
export const PIERRE_AXEL_ID = "ccbc635f-0282-427b-b130-82c1f0fbdbf9"; // Corrected UUID
export const JADE_ID = "acab847b-7ace-4681-989d-86f78549aa69";
export const JEAN_MARC_ID = "af8e053c-8fae-4424-abaa-d79029fd8a11";
export const SHARON_ID = "e564a874-2520-4167-bfa8-26d39f119470";
export const CHRISTELLE_ID = "06e60e2c-4835-4d19-bdf1-5d06f5d2b7e9";
export const CHLOE_ID = "28c03acf-cb78-46b7-8dba-c1edee49c932";
export const CHRISTINE_ID = "af1c9117-f94f-44d0-921f-776dd5fd6f96";
export const OPHELIE_ID = "2d8bae00-a935-439d-8685-0adf238a612e";

// Define the guaranteed team members list with correct IDs and roles
export const GUARANTEED_TEAM_MEMBERS: TeamMember[] = [
  { id: JACQUES_ID, name: 'Jacques Charles', email: 'jacques@gadait-international.com', role: 'commercial' },
  { id: PIERRE_AXEL_ID, name: 'Pierre-Axel Gadait', email: 'pierre@gadait-international.com', role: 'admin', is_admin: true },
  { id: JADE_ID, name: 'Jade Diouane', email: 'jade@gadait-international.com', role: 'commercial' },
  { id: JEAN_MARC_ID, name: 'Jean Marc Perrissol', email: 'jeanmarc@gadait-international.com', role: 'commercial' },
  { id: SHARON_ID, name: 'Sharon Ramdiane', email: 'sharon@gadait-international.com', role: 'commercial' },
  { id: CHRISTELLE_ID, name: 'Christelle Gadait', email: 'christelle@gadait-international.com', role: 'admin', is_admin: true },
  { id: CHLOE_ID, name: 'Chloe Valentin', email: 'chloe@gadait-international.com', role: 'admin', is_admin: true },
  { id: CHRISTINE_ID, name: 'Christine Francoise', email: 'admin@gadait-international.com', role: 'admin', is_admin: true },
  { id: OPHELIE_ID, name: 'Ophelie Durand', email: 'ophelie@gadait-international.com', role: 'commercial' }
];

// Export function to get a team member by ID
export const getTeamMemberById = (id: string): TeamMember | undefined => {
  return GUARANTEED_TEAM_MEMBERS.find(member => member.id === id);
};

// Export function to get team member name by ID
export const getTeamMemberName = (id: string): string => {
  const member = GUARANTEED_TEAM_MEMBERS.find(member => member.id === id);
  return member ? member.name : 'Unknown';
};

// Get team member by email
export const getTeamMemberByEmail = (email: string): TeamMember | undefined => {
  return GUARANTEED_TEAM_MEMBERS.find(member => member.email === email);
};

// Get team member ID by email
export const getTeamMemberId = (email: string | undefined): string | null => {
  if (!email) return null;
  const member = getTeamMemberByEmail(email);
  return member ? member.id : null;
};

// Determine if a team member is an admin
export const isTeamMemberAdmin = (id: string): boolean => {
  const member = getTeamMemberById(id);
  return member?.is_admin === true;
};

// Function to synchronize lead assignments with correct UUIDs
export const synchronizeLeadAssignments = async () => {
  try {
    // Update leads assigned to Pierre-Axel to use the correct UUID
    const { error: pierreAxelError } = await supabase
      .from('leads')
      .update({ assigned_to: PIERRE_AXEL_ID })
      .eq('assigned_to', 'ccbc635f-0282-427b-b130-82c1f0fbbdf9');

    if (pierreAxelError) {
      console.error('Error updating Pierre-Axel assignments:', pierreAxelError);
    } else {
      console.log('Successfully updated Pierre-Axel assignments');
    }

    // Sync other team members if needed...
    return { success: true };
  } catch (error) {
    console.error('Error in synchronizeLeadAssignments:', error);
    throw error;
  }
};

// Fetch all team members from database
export const fetchTeamMembers = async (): Promise<TeamMember[]> => {
  try {
    const { data, error } = await supabase
      .from('team_members')
      .select('*');
      
    if (error) {
      console.error('Error fetching team members:', error);
      // Fallback to guaranteed list if database fetch fails
      return GUARANTEED_TEAM_MEMBERS;
    }
    
    return data || GUARANTEED_TEAM_MEMBERS;
  } catch (error) {
    console.error('Error in fetchTeamMembers:', error);
    // Fallback to guaranteed list on error
    return GUARANTEED_TEAM_MEMBERS;
  }
};
