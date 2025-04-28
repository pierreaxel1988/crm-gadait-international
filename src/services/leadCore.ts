
import { supabase } from "@/integrations/supabase/client";
import { LeadDetailed } from "@/types/lead";
import { mapToLeadDetailed } from "./utils/leadMappers";
import { GUARANTEED_TEAM_MEMBERS } from "./teamMemberService";

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
 * Récupère l'ID du membre d'équipe correspondant à l'email
 * @param userEmail Email de l'utilisateur
 * @returns ID du membre d'équipe ou null
 */
export const getTeamMemberId = (userEmail: string | undefined): string | null => {
  if (!userEmail) return null;
  
  // Utiliser la liste garantie de membres d'équipe pour assurer la cohérence des ID
  const teamMember = GUARANTEED_TEAM_MEMBERS.find(tm => tm.email === userEmail);
  return teamMember ? teamMember.id : null;
};

/**
 * Récupère tous les leads avec les filtres RLS appliqués automatiquement
 * Les RLS garantissent que:
 * - Les admins voient tous les leads
 * - Les commerciaux voient uniquement leurs leads assignés
 */
export const getLeads = async (): Promise<LeadDetailed[]> => {
  try {
    console.log("Fetching leads with RLS policies applied");
    
    // Exécuter la requête - les politiques RLS sont appliquées automatiquement
    const { data, error } = await supabase
      .from('leads')
      .select('*');

    if (error) {
      console.error("Error fetching leads:", error);
      throw new Error(`Failed to fetch leads: ${error.message}`);
    }

    if (data) {
      console.log(`Retrieved ${data.length} leads according to RLS policies`);
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
