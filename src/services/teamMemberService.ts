
// Guaranteed team members list
export const GUARANTEED_TEAM_MEMBERS = [
  {
    id: "f3923d1c-5d1b-4021-8343-95365d29f776",
    name: "Pierre-Axel Gadait",
    email: "pierre@gadait-international.com",
    role: "admin",
    is_admin: true
  },
  {
    id: "3c634555-5df4-4bcd-b347-8e96bcd09f27", 
    name: "Christelle Gadait",
    email: "christelle@gadait-international.com",
    role: "admin",
    is_admin: true
  },
  {
    id: "3b646355-8dc5-4c1d-8a65-177b5d5443f6", 
    name: "Admin",
    email: "admin@gadait-international.com",
    role: "admin",
    is_admin: true
  },
  {
    id: "3c030a64-dd8f-4040-855e-b3eaa921aeaf",
    name: "Ophelie Durand",
    email: "ophelie@gadait-international.com",
    role: "commercial",
    is_admin: false
  },
  {
    id: "612c08e2-0fdc-4513-8e77-4bfa9d957a86",
    name: "Jacques Charles",
    email: "jacques@gadait-international.com",
    role: "commercial",
    is_admin: false
  },
  {
    id: "ce00d664-a232-4285-b0b5-eb2df9db4f43", 
    name: "Jade Diouane",
    email: "jade@gadait-international.com",
    role: "commercial",
    is_admin: false
  },
  {
    id: "632995f6-1391-419f-832c-8580e2408821",
    name: "Jean Marc Perrissol",
    email: "jeanmarc@gadait-international.com",
    role: "commercial",
    is_admin: false
  },
  {
    id: "63214446-0ce1-4cc4-88e1-f047b0ae064e", 
    name: "Sharon Ramdiane",
    email: "sharon@gadait-international.com",
    role: "commercial",
    is_admin: false
  },
  {
    id: "c8762711-92fe-4d49-a927-833966ab04d4",
    name: "Chloé Valentin",
    email: "chloe@gadait-international.com", 
    role: "admin",
    is_admin: true
  }
];

// Constants for specific team member IDs
export const PIERRE_AXEL_ID = "f3923d1c-5d1b-4021-8343-95365d29f776";
export const JADE_ID = "ce00d664-a232-4285-b0b5-eb2df9db4f43";
export const JEAN_MARC_ID = "632995f6-1391-419f-832c-8580e2408821";
export const SHARON_ID = "63214446-0ce1-4cc4-88e1-f047b0ae064e";

/**
 * Get team member ID by email
 * @param email Email to look for
 * @returns Team member ID or null if not found
 */
export const getTeamMemberId = (email: string): string | null => {
  const member = GUARANTEED_TEAM_MEMBERS.find(m => m.email === email);
  return member ? member.id : null;
};

/**
 * Get team member details by email
 * @param email Email to look for
 * @returns Team member object or null if not found
 */
export const getTeamMemberByEmail = (email: string) => {
  return GUARANTEED_TEAM_MEMBERS.find(m => m.email === email) || null;
};

/**
 * Get team member name by ID
 * @param id Team member ID
 * @returns Team member name or "Unknown" if not found
 */
export const getTeamMemberName = (id: string): string => {
  const member = GUARANTEED_TEAM_MEMBERS.find(m => m.id === id);
  return member ? member.name : "Unknown";
};

/**
 * Get team member by ID
 * @param id Team member ID
 * @returns Team member object or undefined if not found
 */
export const getTeamMemberById = (id: string) => {
  return GUARANTEED_TEAM_MEMBERS.find(m => m.id === id);
};

/**
 * Synchronize lead assignments to correct UUIDs
 * This function corrects any incorrect team member IDs in the database
 */
export const synchronizeLeadAssignments = async (): Promise<void> => {
  try {
    console.log("Running lead reassignment synchronization...");
    
    // Import these functions dynamically to avoid circular dependencies
    const { reassignJadeLeads, reassignJeanMarcLeads, reassignSharonLeads } = await import('./leadService');
    
    // Run all reassignment functions
    await Promise.all([
      reassignJadeLeads(),
      reassignJeanMarcLeads(),
      reassignSharonLeads()
    ]);
    
    console.log("Lead assignment synchronization completed successfully");
  } catch (error) {
    console.error("Error synchronizing lead assignments:", error);
  }
};
