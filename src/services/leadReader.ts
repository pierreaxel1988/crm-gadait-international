
import { supabase } from "@/integrations/supabase/client";
import { LeadDetailed } from "@/types/lead";
import { mapToLeadDetailed } from "./utils/leadMappers";
import { isUserAdmin, getTeamMemberId } from "./leadCore";

/**
 * Récupère un lead spécifique par son ID
 * Les admins peuvent voir tous les leads
 * Les commerciaux peuvent voir uniquement leurs leads assignés
 */
export const getLead = async (id: string): Promise<LeadDetailed | null> => {
  try {
    // Récupérer la session utilisateur actuelle
    const { data: sessionData } = await supabase.auth.getSession();
    const userEmail = sessionData?.session?.user?.email;
    const isAdmin = isUserAdmin(userEmail);
    
    console.log(`Fetching lead with ID: ${id} (isAdmin: ${isAdmin})`);
    
    // Construire la requête
    let query = supabase
      .from('leads')
      .select('*')
      .eq('id', id);
    
    // Si l'utilisateur est un commercial, vérifier que le lead lui est assigné
    if (!isAdmin && userEmail) {
      const teamMemberId = getTeamMemberId(userEmail);
      
      if (teamMemberId) {
        console.log(`Filtering for commercial: ${userEmail} (ID: ${teamMemberId})`);
        query = query.eq('assigned_to', teamMemberId);
      }
    }
    
    // Exécuter la requête
    const { data, error } = await query.single();

    if (error) {
      console.error("Error fetching lead:", error);
      
      // Si l'erreur est due à l'absence de résultat pour un commercial, c'est normal
      if (error.code === 'PGRST116' && !isAdmin) {
        console.log("Commercial tried to access a lead not assigned to them");
        return null;
      }
      
      throw new Error(`Failed to fetch lead: ${error.message}`);
    }

    if (data) {
      return mapToLeadDetailed(data);
    }

    return null;
  } catch (error) {
    console.error("Error in getLead:", error);
    throw error;
  }
};
