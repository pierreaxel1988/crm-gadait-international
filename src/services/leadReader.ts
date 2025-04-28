
import { supabase } from "@/integrations/supabase/client";
import { LeadDetailed } from "@/types/lead";
import { mapToLeadDetailed } from "./utils/leadMappers";

/**
 * Récupère un lead spécifique par son ID
 * Les politiques RLS sont appliquées automatiquement
 */
export const getLead = async (id: string): Promise<LeadDetailed | null> => {
  try {
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
