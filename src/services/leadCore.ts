
import { supabase } from "@/integrations/supabase/client";
import { LeadDetailed } from "@/types/lead";
import { mapToLeadDetailed } from "./utils/leadMappers";
import { GUARANTEED_TEAM_MEMBERS, getTeamMemberId } from "./teamMemberService";

// Emails autorisés pour les rôles administratifs et commerciaux
const adminEmails = [
  'pierre@gadait-international.com',
  'christelle@gadait-international.com',
  'admin@gadait-international.com',
  'chloe@gadait-international.com'
];

const commercialEmails = [
  'jade@gadait-international.com',
  'ophelie@gadait-international.com',
  'jeanmarc@gadait-international.com',
  'jacques@gadait-international.com',
  'sharon@gadait-international.com'
];

/**
 * Vérifie si un utilisateur est administrateur
 * @param userEmail Email de l'utilisateur
 * @returns Boolean indiquant si l'utilisateur est admin
 */
export const isUserAdmin = (userEmail: string | undefined): boolean => {
  return adminEmails.includes(userEmail || '');
};

/**
 * Vérifie si un utilisateur est commercial
 * @param userEmail Email de l'utilisateur
 * @returns Boolean indiquant si l'utilisateur est commercial
 */
export const isUserCommercial = (userEmail: string | undefined): boolean => {
  return commercialEmails.includes(userEmail || '');
};

/**
 * Récupère tous les leads avec filtrage basé sur le rôle utilisateur
 * Les admins voient tous les leads, les commerciaux uniquement leurs leads assignés
 */
export const getLeads = async (): Promise<LeadDetailed[]> => {
  try {
    console.log("Fetching leads with role-based filtering");
    
    // Récupérer la session utilisateur actuelle
    const { data: sessionData } = await supabase.auth.getSession();
    const userEmail = sessionData?.session?.user?.email;
    const isAdmin = isUserAdmin(userEmail);
    
    // Construire la requête
    let query = supabase.from('leads').select('*');
    
    // Si l'utilisateur est un commercial, filtrer pour ne montrer que ses leads assignés
    if (!isAdmin && userEmail) {
      const teamMemberId = getTeamMemberId(userEmail);
      
      if (teamMemberId) {
        console.log(`Filtering leads for commercial: ${userEmail} (ID: ${teamMemberId})`);
        query = query.eq('assigned_to', teamMemberId);
      }
    }
    
    // Exécuter la requête
    const { data, error } = await query;

    if (error) {
      console.error("Error fetching leads:", error);
      throw new Error(`Failed to fetch leads: ${error.message}`);
    }

    if (data) {
      console.log(`Retrieved ${data.length} leads based on user role`);
      return data.map(lead => mapToLeadDetailed(lead));
    }

    return [];
  } catch (error) {
    console.error("Error in getLeads:", error);
    throw error;
  }
};

export { getLead } from "./leadReader";
export { createLead } from "./leadCreator";
export { updateLead, deleteLead } from "./leadUpdater";
export { convertToSimpleLead } from "./utils/leadMappers";

export type { LeadDetailed };
