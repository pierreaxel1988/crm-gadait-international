
import { supabase } from "@/integrations/supabase/client";
import { LeadDetailed } from "@/types/lead";
import { mapToLeadDetailed } from "./utils/leadMappers";

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
 * @param teamMembers Liste des membres d'équipe
 * @returns ID du membre d'équipe ou null
 */
export const getTeamMemberId = (userEmail: string | undefined, teamMembers: any[]): string | null => {
  if (!userEmail) return null;
  
  const teamMember = teamMembers.find(tm => tm.email === userEmail);
  return teamMember ? teamMember.id : null;
};

/**
 * Récupère tous les leads avec les filtres RLS appliqués automatiquement
 */
export const getLeads = async (): Promise<LeadDetailed[]> => {
  try {
    // Exécuter la requête - les politiques RLS sont appliquées automatiquement
    const { data, error } = await supabase
      .from('leads')
      .select('*');

    if (error) {
      console.error("Error fetching leads:", error);
      throw new Error(`Failed to fetch leads: ${error.message}`);
    }

    if (data) {
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
