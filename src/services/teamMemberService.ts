
// Define types for team members
export interface TeamMember {
  id: string;
  name: string;
  email: string;
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

// Define the guaranteed team members list with correct IDs
export const GUARANTEED_TEAM_MEMBERS: TeamMember[] = [
  { id: JACQUES_ID, name: 'Jacques Charles', email: 'jacques@gadait-international.com' },
  { id: PIERRE_AXEL_ID, name: 'Pierre-Axel Gadait', email: 'pierre@gadait-international.com' },
  { id: JADE_ID, name: 'Jade Diouane', email: 'jade@gadait-international.com' },
  { id: JEAN_MARC_ID, name: 'Jean Marc Perrissol', email: 'jeanmarc@gadait-international.com' },
  { id: SHARON_ID, name: 'Sharon Ramdiane', email: 'sharon@gadait-international.com' },
  { id: CHRISTELLE_ID, name: 'Christelle Gadait', email: 'christelle@gadait-international.com' },
  { id: CHLOE_ID, name: 'Chloe Valentin', email: 'chloe@gadait-international.com' },
  { id: CHRISTINE_ID, name: 'Christine Francoise', email: 'admin@gadait-international.com' },
  { id: OPHELIE_ID, name: 'Ophelie Durand', email: 'ophelie@gadait-international.com' }
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
