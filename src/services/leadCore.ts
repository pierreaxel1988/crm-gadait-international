
import { supabase } from "@/integrations/supabase/client";
import { LeadDetailed } from "@/types/lead";
import { mapToLeadDetailed } from "./utils/leadMappers";
import { useAuth } from "@/hooks/useAuth";

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

export const getLeads = async (): Promise<LeadDetailed[]> => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;
    const userEmail = user?.email;
    
    // Récupérer tous les membres de l'équipe
    const { data: teamMembers, error: teamError } = await supabase
      .from('team_members')
      .select('*');
      
    if (teamError) {
      console.error("Error fetching team members:", teamError);
      throw new Error(`Failed to fetch team members: ${teamError.message}`);
    }
    
    const isAdmin = isUserAdmin(userEmail);
    const isCommercial = isUserCommercial(userEmail);
    
    // Préparer la requête pour récupérer les leads
    let query = supabase.from('leads').select('*');
    
    // Si c'est un commercial mais pas un admin, filtrer les leads par l'ID du commercial
    if (isCommercial && !isAdmin) {
      const currentTeamMemberId = getTeamMemberId(userEmail, teamMembers || []);
      
      if (currentTeamMemberId) {
        console.log(`Filtering leads for commercial: ${userEmail} (ID: ${currentTeamMemberId})`);
        query = query.eq('assigned_to', currentTeamMemberId);
      } else {
        console.warn(`Commercial user (${userEmail}) not found in team_members table`);
      }
    }
    
    // Exécuter la requête
    const { data, error } = await query;

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
