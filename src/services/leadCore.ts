
import { supabase } from "@/integrations/supabase/client";
import { LeadDetailed, PipelineType, LeadStatus, LeadSource, LeadTag, TaskType, Country } from "@/types/lead";

export const getLeads = async (): Promise<LeadDetailed[]> => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*');

    if (error) {
      console.error("Error fetching leads:", error);
      throw new Error(`Failed to fetch leads: ${error.message}`);
    }

    if (data) {
      return data.map(lead => ({
        id: lead.id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        location: lead.location,
        status: lead.status as LeadStatus,
        tags: lead.tags as LeadTag[],
        createdAt: lead.created_at,
        lastContactedAt: lead.last_contacted_at,
        assignedTo: lead.assigned_to,
        source: lead.source as LeadSource,
        propertyReference: lead.property_reference,
        budget: lead.budget,
        desiredLocation: lead.desired_location,
        propertyType: lead.property_type,
        bedrooms: lead.bedrooms,
        views: lead.views,
        amenities: lead.amenities,
        purchaseTimeframe: lead.purchase_timeframe,
        financingMethod: lead.financing_method,
        propertyUse: lead.property_use,
        nationality: lead.nationality,
        taskType: lead.task_type as TaskType,
        nextFollowUpDate: lead.next_follow_up_date,
        notes: lead.notes,
        country: lead.country as Country,
        url: lead.url,
        external_id: lead.external_id,
        pipelineType: lead.pipeline_type as PipelineType,
        pipeline_type: lead.pipeline_type as PipelineType,
        imported_at: lead.imported_at,
        integration_source: lead.integration_source,
        // Add action_history if it exists in the database
        actionHistory: lead.action_history || []
      }));
    }

    return [];
  } catch (error) {
    console.error("Error in getLeads:", error);
    throw error;
  }
};

// Add the missing getLead function
export const getLead = async (id: string): Promise<LeadDetailed | null> => {
  try {
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
      return {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        location: data.location,
        status: data.status as LeadStatus,
        tags: data.tags as LeadTag[],
        createdAt: data.created_at,
        lastContactedAt: data.last_contacted_at,
        assignedTo: data.assigned_to,
        source: data.source as LeadSource,
        propertyReference: data.property_reference,
        budget: data.budget,
        desiredLocation: data.desired_location,
        propertyType: data.property_type,
        bedrooms: data.bedrooms,
        views: data.views,
        amenities: data.amenities,
        purchaseTimeframe: data.purchase_timeframe,
        financingMethod: data.financing_method,
        propertyUse: data.property_use,
        nationality: data.nationality,
        taskType: data.task_type as TaskType,
        nextFollowUpDate: data.next_follow_up_date,
        notes: data.notes,
        country: data.country as Country,
        url: data.url,
        external_id: data.external_id,
        pipelineType: data.pipeline_type as PipelineType,
        pipeline_type: data.pipeline_type as PipelineType,
        imported_at: data.imported_at,
        integration_source: data.integration_source,
        actionHistory: data.action_history || []
      };
    }

    return null;
  } catch (error) {
    console.error("Error in getLead:", error);
    throw error;
  }
};

export const createLead = async (leadData: Omit<LeadDetailed, "id" | "createdAt">): Promise<LeadDetailed | null> => {
  try {
    console.log("Creating lead with data:", leadData);
    
    // Prepare lead data for Supabase insertion
    const supabaseLeadData = {
      name: leadData.name,
      email: leadData.email,
      phone: leadData.phone,
      location: leadData.location,
      status: leadData.status,
      tags: leadData.tags || [],
      assigned_to: leadData.assignedTo,
      source: leadData.source,
      property_reference: leadData.propertyReference,
      budget: leadData.budget,
      desired_location: leadData.desiredLocation,
      property_type: leadData.propertyType,
      bedrooms: leadData.bedrooms,
      views: leadData.views,
      amenities: leadData.amenities,
      purchase_timeframe: leadData.purchaseTimeframe,
      financing_method: leadData.financingMethod,
      property_use: leadData.propertyUse,
      nationality: leadData.nationality,
      task_type: leadData.taskType,
      next_follow_up_date: leadData.nextFollowUpDate,
      notes: leadData.notes,
      country: leadData.country,
      external_id: leadData.external_id,
      url: leadData.url,
      // Make sure both fields are set for compatibility
      pipeline_type: leadData.pipelineType || leadData.pipeline_type || 'purchase',
      // Always include the imported_at field for new leads
      imported_at: new Date().toISOString(),
      action_history: leadData.actionHistory || []
    };

    console.log("Prepared Supabase lead data:", supabaseLeadData);
    
    // First, try to create the lead in Supabase
    const { data, error } = await supabase
      .from('leads')
      .insert([supabaseLeadData])
      .select()
      .single();
      
    if (error) {
      console.error("Error creating lead in Supabase:", error);
      throw new Error(`Failed to create lead: ${error.message}`);
    }
    
    if (data) {
      console.log("Lead created successfully:", data);
      // Map the Supabase response to LeadDetailed
      return {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        location: data.location,
        status: data.status as LeadStatus,
        tags: data.tags as LeadTag[],
        createdAt: data.created_at,
        lastContactedAt: data.last_contacted_at,
        assignedTo: data.assigned_to,
        source: data.source as LeadSource,
        propertyReference: data.property_reference,
        budget: data.budget,
        desiredLocation: data.desired_location,
        propertyType: data.property_type,
        bedrooms: data.bedrooms,
        views: data.views,
        amenities: data.amenities,
        purchaseTimeframe: data.purchase_timeframe,
        financingMethod: data.financing_method,
        propertyUse: data.property_use,
        nationality: data.nationality,
        taskType: data.task_type as TaskType,
        notes: data.notes,
        nextFollowUpDate: data.next_follow_up_date,
        country: data.country as Country,
        url: data.url,
        external_id: data.external_id,
        pipelineType: data.pipeline_type as PipelineType,
        pipeline_type: data.pipeline_type as PipelineType,
        imported_at: data.imported_at,
        integration_source: data.integration_source,
        actionHistory: data.action_history || []
      };
    }
    
    // If Supabase insertion fails, fall back to local storage
    const leads = await getLeads();
    const newLead = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...leadData };
    leads.push(newLead);
    localStorage.setItem('leads', JSON.stringify(leads));

    return newLead as LeadDetailed;
  } catch (error) {
    console.error("Error in createLead:", error);
    throw error;
  }
};

export const updateLead = async (leadData: LeadDetailed): Promise<LeadDetailed | null> => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .update({
        name: leadData.name,
        email: leadData.email,
        phone: leadData.phone,
        location: leadData.location,
        status: leadData.status,
        tags: leadData.tags,
        assigned_to: leadData.assignedTo,
        source: leadData.source,
        property_reference: leadData.propertyReference,
        budget: leadData.budget,
        desired_location: leadData.desiredLocation,
        property_type: leadData.propertyType,
        bedrooms: leadData.bedrooms,
        views: leadData.views,
        amenities: leadData.amenities,
        purchase_timeframe: leadData.purchaseTimeframe,
        financing_method: leadData.financingMethod,
        property_use: leadData.propertyUse,
        nationality: leadData.nationality,
        task_type: leadData.taskType,
        next_follow_up_date: leadData.nextFollowUpDate,
        notes: leadData.notes,
        country: leadData.country,
        url: leadData.url,
        external_id: leadData.external_id,
        pipeline_type: leadData.pipelineType || leadData.pipeline_type || 'purchase',
        action_history: leadData.actionHistory || []
      })
      .eq('id', leadData.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating lead:", error);
      throw new Error(`Failed to update lead: ${error.message}`);
    }

    if (data) {
      return {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        location: data.location,
        status: data.status as LeadStatus,
        tags: data.tags as LeadTag[],
        createdAt: data.created_at,
        lastContactedAt: data.last_contacted_at,
        assignedTo: data.assigned_to,
        source: data.source as LeadSource,
        propertyReference: data.property_reference,
        budget: data.budget,
        desiredLocation: data.desired_location,
        propertyType: data.property_type,
        bedrooms: data.bedrooms,
        views: data.views,
        amenities: data.amenities,
        purchaseTimeframe: data.purchase_timeframe,
        financingMethod: data.financing_method,
        propertyUse: data.property_use,
        nationality: data.nationality,
        taskType: data.task_type as TaskType,
        nextFollowUpDate: data.next_follow_up_date,
        notes: data.notes,
        country: data.country as Country,
        url: data.url,
        external_id: data.external_id,
        pipelineType: data.pipeline_type as PipelineType,
        pipeline_type: data.pipeline_type as PipelineType,
        imported_at: data.imported_at,
        integration_source: data.integration_source,
        actionHistory: data.action_history || []
      };
    }

    return null;
  } catch (error) {
    console.error("Error in updateLead:", error);
    throw error;
  }
};

export const deleteLead = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting lead:", error);
      throw new Error(`Failed to delete lead: ${error.message}`);
    }

    return true;
  } catch (error) {
    console.error("Error in deleteLead:", error);
    throw error;
  }
};

// Add the missing convertToSimpleLead function
export const convertToSimpleLead = (lead: LeadDetailed) => {
  return {
    id: lead.id,
    name: lead.name,
    email: lead.email || '',
    phone: lead.phone || '',
    status: lead.status,
    tags: lead.tags || [],
    assignedTo: lead.assignedTo,
    createdAt: lead.createdAt,
    source: lead.source,
    pipelineType: lead.pipelineType || lead.pipeline_type || 'purchase'
  };
};
