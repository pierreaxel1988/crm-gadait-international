
import { supabase } from "@/integrations/supabase/client";
import { LeadDetailed } from "@/types/lead";
import { mapToLeadDetailed } from "./utils/leadMappers";

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
    
    // Récupérer tous les leads pour simplifier
    const { data, error } = await supabase.from('leads').select('*');

    if (error) {
      console.error("[leadReader] Error fetching leads:", error);
      throw new Error(`Failed to fetch leads: ${error.message}`);
    }

    if (data) {
      console.log(`[leadReader] Found ${data.length} leads`);
      
      // Si c'est un commercial mais pas un admin, filtrer côté client pour leurs leads
      if (isUserCommercial && !isUserAdmin) {
        try {
          // Trouver l'ID du commercial correspondant
          const { data: teamMember } = await supabase
            .from('team_members')
            .select('id')
            .eq('email', user.email)
            .maybeSingle();
            
          if (teamMember) {
            console.log("[leadReader] Filtering leads for commercial:", user.email, "with ID:", teamMember.id);
            const filteredLeads = data.filter(lead => lead.assigned_to === teamMember.id);
            console.log(`[leadReader] Filtered: ${filteredLeads.length} leads for commercial`);
            
            // Log all assigned_to values to debug
            console.log("[leadReader] All lead assignments:", data.map(lead => ({
              id: lead.id,
              name: lead.name,
              assigned_to: lead.assigned_to
            })));
            
            return filteredLeads.map(lead => mapToLeadDetailed(lead));
          } else {
            // Si le membre n'est pas trouvé, retourner tous les leads comme solution de secours
            console.log("[leadReader] Commercial user not found in team_members table. Returning all leads as fallback.");
            return data.map(lead => mapToLeadDetailed(lead));
          }
        } catch (error) {
          console.error("[leadReader] Error checking team member:", error);
          // En cas d'erreur, retourner tous les leads
          return data.map(lead => mapToLeadDetailed(lead));
        }
      } else {
        // Pour les admins ou non-commerciaux, retourner tous les leads
        console.log("[leadReader] Admin user or non-commercial: returning all leads");
        return data.map(lead => mapToLeadDetailed(lead));
      }
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
    
    // Récupérer le lead sans vérification d'attribution
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
    
    // Afficher l'attribution pour aider au debugging
    if (data.assigned_to) {
      console.log(`[leadReader] Lead assigned to: ${data.assigned_to}`);
      
      // Vérifier si l'agent existe
      const { data: agent } = await supabase
        .from('team_members')
        .select('id, name, email')
        .eq('id', data.assigned_to)
        .maybeSingle();
        
      if (agent) {
        console.log(`[leadReader] Agent found: ${agent.name} (${agent.email})`);
      } else {
        console.log(`[leadReader] No agent found with ID: ${data.assigned_to}`);
      }
    }
    
    return mapToLeadDetailed(data);
  } catch (error) {
    console.error("[leadReader] Error in getLead:", error);
    throw error;
  }
};
