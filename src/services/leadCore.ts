import { supabase } from "@/integrations/supabase/client";
import { LeadDetailed } from "@/types/lead";
import { mapToLeadDetailed } from "./utils/leadMappers";
import { useAuth } from "@/hooks/useAuth";

export const getLeads = async (): Promise<LeadDetailed[]> => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;
    
    const { data: teamMembers, error: teamError } = await supabase
      .from('team_members')
      .select('*');
      
    if (teamError) {
      console.error("Error fetching team members:", teamError);
      throw new Error(`Failed to fetch team members: ${teamError.message}`);
    }
    
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
    
    let query = supabase.from('leads').select('*');
    
    if (isUserCommercial && !isUserAdmin) {
      const currentTeamMember = teamMembers?.find(tm => tm.email === user?.email);
      if (currentTeamMember) {
        console.log("Filtering leads for commercial:", currentTeamMember.name);
        query = query.eq('assigned_to', currentTeamMember.id);
      }
    }
    
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
