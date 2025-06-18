
import { supabase } from "@/integrations/supabase/client";
import { LeadDetailed } from "@/types/lead";
import { mapToLeadDetailed } from "./utils/leadMappers";

/**
 * Fetches all leads from the database
 */
export const getLeads = async (): Promise<LeadDetailed[]> => {
  try {
    console.log('=== GETTING ALL LEADS ===');
    
    // Get the current authenticated user
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;
    
    console.log('Current user:', user?.email);
    
    // Get team members to check if the user is a commercial
    const { data: teamMembers, error: teamError } = await supabase
      .from('team_members')
      .select('*');
      
    if (teamError) {
      console.error("Error fetching team members:", teamError);
      throw new Error(`Failed to fetch team members: ${teamError.message}`);
    }
    
    // Vérifier si c'est un utilisateur commercial
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
    
    const isUserAdmin = adminEmails.includes(user?.email || '');
    const isUserCommercial = commercialEmails.includes(user?.email || '');
    
    console.log('User type:', { isUserAdmin, isUserCommercial });
    
    // Base query - get ALL leads for debugging
    let query = supabase.from('leads').select('*');
    
    // Temporarily disable commercial filtering to see all leads
    // Si c'est un commercial, filtre pour n'afficher que ses leads
    // DÉSACTIVÉ TEMPORAIREMENT POUR DEBUG
    /*
    if (isUserCommercial && !isUserAdmin) {
      // Trouver l'ID du commercial correspondant
      const currentTeamMember = teamMembers?.find(tm => tm.email === user?.email);
      if (currentTeamMember) {
        console.log("Filtering leads for commercial:", currentTeamMember.name);
        query = query.eq('assigned_to', currentTeamMember.id);
      }
    }
    */
    
    // Exécuter la requête
    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching leads:", error);
      throw new Error(`Failed to fetch leads: ${error.message}`);
    }

    console.log('Fetched leads count:', data?.length || 0);
    
    if (data) {
      const convertedLeads = data.map(lead => mapToLeadDetailed(lead));
      console.log('Converted leads count:', convertedLeads.length);
      
      // Log sample of converted leads
      if (convertedLeads.length > 0) {
        console.log('Sample converted leads:');
        convertedLeads.slice(0, 3).forEach((lead, index) => {
          console.log(`Lead ${index + 1}:`, {
            id: lead.id,
            name: lead.name,
            status: lead.status,
            pipelineType: lead.pipelineType,
            assignedTo: lead.assignedTo
          });
        });
      }
      
      return convertedLeads;
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
    
    // Get team members to check if the user is a commercial
    const { data: teamMembers, error: teamError } = await supabase
      .from('team_members')
      .select('*');
      
    if (teamError) {
      console.error("Error fetching team members:", teamError);
      throw new Error(`Failed to fetch team members: ${teamError.message}`);
    }
    
    // Vérifier si c'est un utilisateur commercial
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
    
    const isUserAdmin = adminEmails.includes(user?.email || '');
    const isUserCommercial = commercialEmails.includes(user?.email || '');
    
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
    // DÉSACTIVÉ TEMPORAIREMENT POUR DEBUG
    /*
    if (isUserCommercial && !isUserAdmin) {
      const currentTeamMember = teamMembers?.find(tm => tm.email === user?.email);
      if (currentTeamMember && data.assigned_to !== currentTeamMember.id) {
        console.warn("Commercial user attempting to access lead not assigned to them");
        return null;
      }
    }
    */

    if (data) {
      return mapToLeadDetailed(data);
    }

    return null;
  } catch (error) {
    console.error("Error in getLead:", error);
    throw error;
  }
};

export { convertToSimpleLead } from "./utils/leadMappers";
