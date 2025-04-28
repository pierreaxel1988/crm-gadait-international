
import { supabase } from "@/integrations/supabase/client";
import { LeadDetailed } from "@/types/lead";
import { mapToLeadDetailed } from "./utils/leadMappers";

/**
 * Récupère un lead spécifique par son ID
 * Les politiques RLS sont appliquées automatiquement:
 * - Les admins peuvent voir tous les leads
 * - Les commerciaux peuvent voir uniquement leurs leads assignés
 */
export const getLead = async (id: string): Promise<LeadDetailed | null> => {
  try {
    console.log(`Fetching lead with ID: ${id} (RLS applies)`);
    
    // Récupérer le lead - RLS appliquée automatiquement
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error("Error fetching lead:", error);
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
