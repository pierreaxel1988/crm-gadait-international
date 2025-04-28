
import { supabase } from "@/integrations/supabase/client";
import { LeadDetailed } from "@/types/lead";
import { mapToLeadDetailed } from "./utils/leadMappers";
import { isUserAdmin, isUserCommercial, getTeamMemberId } from "./leadCore";

/**
 * Fetches all leads from the database
 */
export const getLeads = async (): Promise<LeadDetailed[]> => {
  try {
    // Get the current authenticated user
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;
    const userEmail = user?.email;
    
    // Get team members
    const { data: teamMembers, error: teamError } = await supabase
      .from('team_members')
      .select('*');
      
    if (teamError) {
      console.error("Error fetching team members:", teamError);
      throw new Error(`Failed to fetch team members: ${teamError.message}`);
    }
    
    const isAdmin = isUserAdmin(userEmail);
    const isCommercial = isUserCommercial(userEmail);
    
    // Base query
    let query = supabase.from('leads').select('*');
    
    // Si c'est un commercial mais pas un admin, filtrer les leads
    if (isCommercial && !isAdmin) {
      // Trouver l'ID du commercial correspondant
      const currentTeamMemberId = getTeamMemberId(userEmail, teamMembers || []);
      
      if (currentTeamMemberId) {
        console.log(`Filtering leads for commercial user: ${userEmail} (ID: ${currentTeamMemberId})`);
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

/**
 * Fetches a single lead by ID
 */
export const getLead = async (id: string): Promise<LeadDetailed | null> => {
  try {
    // Get the current authenticated user
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;
    const userEmail = user?.email;
    
    // Get team members
    const { data: teamMembers, error: teamError } = await supabase
      .from('team_members')
      .select('*');
      
    if (teamError) {
      console.error("Error fetching team members:", teamError);
      throw new Error(`Failed to fetch team members: ${teamError.message}`);
    }
    
    const isAdmin = isUserAdmin(userEmail);
    const isCommercial = isUserCommercial(userEmail);
    
    // Récupérer le lead
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error("Error fetching lead:", error);
      throw new Error(`Failed to fetch lead: ${error.message}`);
    }
    
    // Si c'est un commercial, vérifier si le lead lui est assigné
    if (isCommercial && !isAdmin) {
      const currentTeamMemberId = getTeamMemberId(userEmail, teamMembers || []);
      
      if (currentTeamMemberId && data.assigned_to !== currentTeamMemberId) {
        console.warn(`Commercial user attempting to access lead not assigned to them: ${userEmail} trying to access ${data.name}'s lead assigned to ${data.assigned_to}`);
        return null; // Refuser l'accès au lead
      }
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
