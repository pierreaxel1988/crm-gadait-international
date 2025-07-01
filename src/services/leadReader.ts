
import { supabase } from "@/integrations/supabase/client";
import { LeadDetailed } from "@/types/lead";
import { mapToLeadDetailed } from "./utils/leadMappers";

/**
 * Fetches all leads from the database (excluding soft-deleted ones by default)
 */
export const getLeads = async (includeDeleted: boolean = false): Promise<LeadDetailed[]> => {
  try {
    let query = supabase
      .from('leads')
      .select('*, assigned_team_member:team_members!leads_assigned_to_fkey(name, email)')
      .order('created_at', { ascending: false });

    // By default, exclude soft-deleted leads
    if (!includeDeleted) {
      query = query.is('deleted_at', null);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching leads:", error);
      throw error;
    }

    return data?.map(mapToLeadDetailed) || [];
  } catch (error) {
    console.error("Error in getLeads:", error);
    throw error;
  }
};

/**
 * Fetches a specific lead by ID (excluding soft-deleted ones by default)
 */
export const getLead = async (id: string, includeDeleted: boolean = false): Promise<LeadDetailed | null> => {
  try {
    let query = supabase
      .from('leads')
      .select('*, assigned_team_member:team_members!leads_assigned_to_fkey(name, email)')
      .eq('id', id);

    // By default, exclude soft-deleted leads
    if (!includeDeleted) {
      query = query.is('deleted_at', null);
    }

    const { data, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error("Error fetching lead:", error);
      throw error;
    }

    return mapToLeadDetailed(data);
  } catch (error) {
    console.error("Error in getLead:", error);
    throw error;
  }
};

/**
 * Converts a detailed lead to a simple lead format
 */
export const convertToSimpleLead = (lead: LeadDetailed): any => {
  return {
    id: lead.id,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    status: lead.status,
    assignedTo: lead.assignedTo,
    createdAt: lead.createdAt,
    tags: lead.tags || [],
    budget: lead.budget,
    location: lead.desiredLocation || lead.location,
    pipelineType: lead.pipelineType || 'purchase'
  };
};
