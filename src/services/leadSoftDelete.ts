
import { supabase } from "@/integrations/supabase/client";
import { LeadDetailed } from "@/types/lead";
import { toast } from "@/hooks/use-toast";

/**
 * Soft delete a lead (mark as deleted instead of actually deleting)
 */
export const softDeleteLead = async (leadId: string, reason?: string): Promise<boolean> => {
  try {
    // Get current user's team member ID
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;
    
    if (!user) {
      throw new Error("Utilisateur non connecté");
    }

    // Get team member ID from email
    const { data: teamMember } = await supabase
      .from('team_members')
      .select('id')
      .eq('email', user.email)
      .single();

    if (!teamMember) {
      throw new Error("Membre d'équipe non trouvé");
    }

    // Soft delete the lead
    const { error } = await supabase
      .from('leads')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: teamMember.id,
        deletion_reason: reason || null
      })
      .eq('id', leadId);

    if (error) {
      console.error("Error soft deleting lead:", error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error in softDeleteLead:", error);
    throw error;
  }
};

/**
 * Restore a soft-deleted lead
 */
export const restoreLead = async (leadId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('leads')
      .update({
        deleted_at: null,
        deleted_by: null,
        deletion_reason: null
      })
      .eq('id', leadId);

    if (error) {
      console.error("Error restoring lead:", error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error in restoreLead:", error);
    throw error;
  }
};

/**
 * Get soft-deleted leads (for admin view)
 */
export const getDeletedLeads = async (): Promise<LeadDetailed[]> => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select(`
        *,
        deleted_by_member:team_members!leads_deleted_by_fkey(name, email)
      `)
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false });

    if (error) {
      console.error("Error fetching deleted leads:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error in getDeletedLeads:", error);
    throw error;
  }
};
