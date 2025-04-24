
import { supabase } from "@/integrations/supabase/client";
import { LeadDetailed } from "@/types/lead";
import { mapToLeadDetailed } from "./utils/leadMappers";
import { useAuth } from "@/hooks/useAuth";

/**
 * Fetches all leads from the database, with filtering based on user role
 */
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
    
    // Définition des emails admin et commerciaux
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
    
    const isUserAdmin = adminEmails.includes(user.email || '');
    const isUserCommercial = commercialEmails.includes(user.email || '');
    
    console.log("[leadReader] User roles - Admin:", isUserAdmin, "Commercial:", isUserCommercial);
    
    // Base query
    let query = supabase.from('leads').select('*');
    
    // Si c'est un commercial, filtre pour n'afficher que ses leads
    if (isUserCommercial && !isUserAdmin) {
      // Trouver l'ID du commercial correspondant
      const { data: teamMember, error: teamError } = await supabase
        .from('team_members')
        .select('id')
        .eq('email', user.email)
        .maybeSingle();
        
      if (teamError) {
        console.error("[leadReader] Error fetching team member:", teamError);
        throw new Error(`Failed to fetch team member: ${teamError.message}`);
      }
      
      if (teamMember) {
        console.log("[leadReader] Filtering leads for commercial:", user.email, "with ID:", teamMember.id);
        query = query.eq('assigned_to', teamMember.id);
      } else {
        console.log("[leadReader] Commercial user not found in team_members table");
        return []; // Si le commercial n'est pas trouvé dans la table, ne retourner aucun lead
      }
    } else {
      console.log("[leadReader] Admin user or non-commercial: returning all leads");
    }
    
    // Exécuter la requête
    const { data, error } = await query;

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

/**
 * Fetches a single lead by ID, with permission check
 */
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
    
    // Définition des emails admin et commerciaux
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
    
    const isUserAdmin = adminEmails.includes(user.email || '');
    const isUserCommercial = commercialEmails.includes(user.email || '');
    
    // Récupérer le lead
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
    
    // Si c'est un commercial, vérifier si le lead lui est assigné
    if (isUserCommercial && !isUserAdmin) {
      // Trouver l'ID du commercial
      const { data: teamMember, error: teamError } = await supabase
        .from('team_members')
        .select('id')
        .eq('email', user.email)
        .maybeSingle();
        
      if (teamError) {
        console.error("[leadReader] Error fetching team member for permission check:", teamError);
        throw new Error(`Failed to check permissions: ${teamError.message}`);
      }
      
      if (teamMember && data.assigned_to !== teamMember.id) {
        console.warn("[leadReader] Commercial user attempting to access lead not assigned to them");
        return null;
      }
    }

    console.log(`[leadReader] Lead ${id} found and permission check passed`);
    return mapToLeadDetailed(data);
  } catch (error) {
    console.error("[leadReader] Error in getLead:", error);
    throw error;
  }
};
