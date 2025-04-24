
import { supabase } from "@/integrations/supabase/client";
import { LeadDetailed } from "@/types/lead";
import { mapToLeadDetailed } from "./utils/leadMappers";

export const getLeads = async (): Promise<LeadDetailed[]> => {
  try {
    // Get the current authenticated user
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;
    
    if (!user) {
      console.log("[leadReader] No authenticated user found");
      return [];
    }
    
    console.log("[leadReader] Fetching leads for user:", user.email);
    
    // With RLS enabled, we can simply fetch all leads - RLS will handle the filtering
    const { data, error } = await supabase.from('leads').select('*');

    if (error) {
      console.error("[leadReader] Error fetching leads:", error);
      throw new Error(`Failed to fetch leads: ${error.message}`);
    }

    if (data) {
      console.log(`[leadReader] Found ${data.length} leads`);
      return data.map(lead => mapToLeadDetailed(lead));
    }

    return [];
  } catch (error) {
    console.error("[leadReader] Error in getLeads:", error);
    throw error;
  }
};

export const getLead = async (id: string): Promise<LeadDetailed | null> => {
  try {
    // Get the current authenticated user
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;
    
    if (!user) {
      console.log("[leadReader] No authenticated user found for single lead");
      return null;
    }
    
    console.log(`[leadReader] Fetching lead ${id} for user:`, user.email);
    
    // With RLS enabled, we can simply fetch the lead - RLS will handle the permissions
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error("[leadReader] Error fetching lead:", error);
      throw new Error(`Failed to fetch lead: ${error.message}`);
    }
    
    if (!data) {
      console.log(`[leadReader] Lead ${id} not found`);
      return null;
    }
    
    console.log(`[leadReader] Lead ${id} found:`, data);
    return mapToLeadDetailed(data);
  } catch (error) {
    console.error("[leadReader] Error in getLead:", error);
    throw error;
  }
};
