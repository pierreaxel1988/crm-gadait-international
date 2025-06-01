
import { supabase } from "@/integrations/supabase/client";

export interface PublicCriteriaLink {
  id: string;
  lead_id: string;
  token: string;
  created_at: string;
  expires_at?: string;
  is_active: boolean;
  filled_at?: string;
  created_by?: string;
}

export const createPublicCriteriaLink = async (leadId: string): Promise<PublicCriteriaLink | null> => {
  try {
    const { data, error } = await supabase
      .from('public_criteria_links')
      .insert({
        lead_id: leadId,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating public criteria link:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createPublicCriteriaLink:', error);
    throw error;
  }
};

export const getPublicCriteriaLink = async (token: string): Promise<{ link: PublicCriteriaLink; lead: any } | null> => {
  try {
    const { data: linkData, error: linkError } = await supabase
      .from('public_criteria_links')
      .select('*')
      .eq('token', token)
      .eq('is_active', true)
      .single();

    if (linkError || !linkData) {
      console.error('Error fetching public criteria link:', linkError);
      return null;
    }

    // Vérifier l'expiration
    if (linkData.expires_at && new Date(linkData.expires_at) < new Date()) {
      return null;
    }

    // Récupérer les données du lead
    const { data: leadData, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', linkData.lead_id)
      .single();

    if (leadError || !leadData) {
      console.error('Error fetching lead data:', leadError);
      return null;
    }

    return { link: linkData, lead: leadData };
  } catch (error) {
    console.error('Error in getPublicCriteriaLink:', error);
    return null;
  }
};

export const updateLeadCriteriaFromPublicForm = async (token: string, criteriaData: any): Promise<boolean> => {
  try {
    // Récupérer le lien et vérifier sa validité
    const result = await getPublicCriteriaLink(token);
    if (!result) {
      throw new Error('Token invalide ou expiré');
    }

    // Mettre à jour les critères du lead
    const { error: updateError } = await supabase
      .from('leads')
      .update(criteriaData)
      .eq('id', result.link.lead_id);

    if (updateError) {
      console.error('Error updating lead criteria:', updateError);
      throw updateError;
    }

    // Marquer le lien comme rempli
    const { error: linkUpdateError } = await supabase
      .from('public_criteria_links')
      .update({ filled_at: new Date().toISOString() })
      .eq('token', token);

    if (linkUpdateError) {
      console.error('Error updating link status:', linkUpdateError);
    }

    return true;
  } catch (error) {
    console.error('Error in updateLeadCriteriaFromPublicForm:', error);
    throw error;
  }
};

export const getActiveLinksForLead = async (leadId: string): Promise<PublicCriteriaLink[]> => {
  try {
    const { data, error } = await supabase
      .from('public_criteria_links')
      .select('*')
      .eq('lead_id', leadId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching active links:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getActiveLinksForLead:', error);
    throw error;
  }
};
