
import { LeadDetailed } from "@/types/lead";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LeadStatus } from "@/components/common/StatusBadge";
import { LeadTag } from "@/components/common/TagBadge";
import { TaskType } from "@/components/kanban/KanbanCard";
import { LeadSource } from "@/types/lead";
import { PropertyType } from "@/types/lead";

// Starting with an empty array for local fallback
let leadsData: LeadDetailed[] = [];

export const getLeads = async (): Promise<LeadDetailed[]> => {
  try {
    // Try to get leads from Supabase first
    const { data, error } = await supabase
      .from('leads')
      .select('*');
    
    if (error) {
      console.error('Error fetching leads from Supabase:', error);
      // Fallback to local data if Supabase fails
      return leadsData;
    }
    
    // Update local cache
    leadsData = data.map(lead => ({
      id: lead.id,
      name: lead.name,
      email: lead.email || '',
      phone: lead.phone || '',
      status: lead.status as LeadStatus,
      tags: (lead.tags || []) as LeadTag[],
      createdAt: lead.created_at,
      lastContactedAt: lead.last_contacted_at,
      assignedTo: lead.assigned_to,
      source: lead.source as LeadSource,
      budget: lead.budget,
      desiredLocation: lead.desired_location,
      propertyType: lead.property_type as PropertyType,
      propertyReference: lead.property_reference,
      external_id: lead.external_id,
      bedrooms: lead.bedrooms,
      taskType: lead.task_type as TaskType,
      nextFollowUpDate: lead.next_follow_up_date,
      notes: lead.notes,
      nationality: lead.nationality,
      pipelineType: lead.pipeline_type || 'purchase', // Use the pipeline_type from DB
      actionHistory: [], // Default empty array if not in DB
      url: lead.url || '', // Include the url field with default
      country: lead.country
    }));
    
    return leadsData;
  } catch (err) {
    console.error('Unexpected error fetching leads:', err);
    return leadsData;
  }
};

export const getLead = async (id: string): Promise<LeadDetailed | undefined> => {
  try {
    // Try to get the lead from Supabase
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching lead from Supabase:', error);
      // Fallback to local data
      return leadsData.find(lead => lead.id === id);
    }
    
    if (!data) {
      return undefined;
    }
    
    // Map the data to our LeadDetailed format
    const leadDetailed: LeadDetailed = {
      id: data.id,
      name: data.name,
      email: data.email || '',
      phone: data.phone || '',
      status: data.status as LeadStatus,
      tags: (data.tags || []) as LeadTag[],
      createdAt: data.created_at,
      lastContactedAt: data.last_contacted_at,
      assignedTo: data.assigned_to,
      source: data.source as LeadSource,
      budget: data.budget,
      desiredLocation: data.desired_location,
      propertyType: data.property_type as PropertyType,
      propertyReference: data.property_reference,
      external_id: data.external_id,
      bedrooms: data.bedrooms,
      taskType: data.task_type as TaskType,
      nextFollowUpDate: data.next_follow_up_date,
      notes: data.notes,
      nationality: data.nationality,
      pipelineType: data.pipeline_type || 'purchase', // Use the pipeline_type from DB
      actionHistory: [], // Default empty array if not in DB
      url: data.url || '', // Include the url field with default
      country: data.country
    };
    
    return leadDetailed;
  } catch (err) {
    console.error('Unexpected error fetching lead:', err);
    return leadsData.find(lead => lead.id === id);
  }
};

export const updateLead = async (updatedLead: LeadDetailed): Promise<LeadDetailed> => {
  try {
    console.log("Updating lead with data:", updatedLead);
    
    // Map the lead to Supabase column format
    const leadData = {
      name: updatedLead.name,
      email: updatedLead.email,
      phone: updatedLead.phone,
      status: updatedLead.status,
      tags: updatedLead.tags,
      last_contacted_at: updatedLead.lastContactedAt,
      assigned_to: updatedLead.assignedTo,
      source: updatedLead.source,
      budget: updatedLead.budget,
      desired_location: updatedLead.desiredLocation,
      property_type: updatedLead.propertyType,
      property_reference: updatedLead.propertyReference,
      external_id: updatedLead.external_id,
      bedrooms: updatedLead.bedrooms,
      task_type: updatedLead.taskType,
      next_follow_up_date: updatedLead.nextFollowUpDate,
      notes: updatedLead.notes,
      nationality: updatedLead.nationality,
      url: updatedLead.url || '', // Include the url field with default
      pipeline_type: updatedLead.pipelineType || 'purchase',
      country: updatedLead.country,
      action_history: updatedLead.actionHistory || []
    };
    
    console.log("Sending lead data to Supabase:", leadData);
    
    // Update the lead in Supabase
    const { data, error } = await supabase
      .from('leads')
      .update(leadData)
      .eq('id', updatedLead.id)
      .select('*')
      .single();
    
    if (error) {
      console.error('Error updating lead in Supabase:', error);
      // Update the local cache and fallback to it
      const index = leadsData.findIndex(lead => lead.id === updatedLead.id);
      if (index !== -1) {
        leadsData[index] = updatedLead;
      }
      
      toast({
        title: "Lead mis à jour (mode local)",
        description: `Les informations pour ${updatedLead.name} ont été enregistrées localement.`
      });
      
      return updatedLead;
    }
    
    console.log("Lead updated successfully in Supabase:", data);
    
    toast({
      title: "Lead mis à jour",
      description: `Les informations pour ${updatedLead.name} ont été enregistrées.`
    });
    
    return updatedLead;
  } catch (err) {
    console.error('Unexpected error updating lead:', err);
    
    // Update the local cache as fallback
    const index = leadsData.findIndex(lead => lead.id === updatedLead.id);
    if (index !== -1) {
      leadsData[index] = updatedLead;
    }
    
    toast({
      title: "Lead mis à jour (mode local)",
      description: `Les informations pour ${updatedLead.name} ont été enregistrées localement.`
    });
    
    return updatedLead;
  }
};

export const createLead = async (newLead: Omit<LeadDetailed, 'id' | 'createdAt'>): Promise<LeadDetailed> => {
  try {
    console.log('Creating lead with data:', newLead);
    
    // Map to Supabase column format
    const leadData = {
      name: newLead.name,
      email: newLead.email,
      phone: newLead.phone,
      status: newLead.status,
      tags: newLead.tags,
      last_contacted_at: newLead.lastContactedAt,
      assigned_to: newLead.assignedTo,
      source: newLead.source,
      budget: newLead.budget,
      desired_location: newLead.desiredLocation,
      property_type: newLead.propertyType,
      property_reference: newLead.propertyReference,
      external_id: newLead.external_id,
      bedrooms: newLead.bedrooms,
      task_type: newLead.taskType,
      next_follow_up_date: newLead.nextFollowUpDate,
      notes: newLead.notes,
      nationality: newLead.nationality,
      url: newLead.url || '',  // Include the URL field with default
      pipeline_type: newLead.pipelineType || 'purchase', // Use pipeline_type for Supabase
      country: newLead.country
    };
    
    console.log('Sending lead data to Supabase:', leadData);
    
    // Create the lead in Supabase
    const { data, error } = await supabase
      .from('leads')
      .insert(leadData)
      .select('*')
      .single();
    
    if (error) {
      console.error('Error creating lead in Supabase:', error);
      
      // Fallback to local
      const id = crypto.randomUUID();
      const createdAt = new Date().toISOString();
      
      const localLead: LeadDetailed = {
        id,
        createdAt,
        ...newLead,
        status: newLead.status,
        pipelineType: newLead.pipelineType || "purchase",
        url: newLead.url || ''
      };
      
      // Add to local
      leadsData.unshift(localLead);
      
      toast({
        title: "Nouveau lead créé (mode local)",
        description: `Le lead ${localLead.name} a été ajouté en local.`
      });
      
      return localLead;
    }
    
    console.log('Created lead in Supabase:', data);
    
    const createdLead: LeadDetailed = {
      id: data.id,
      name: data.name,
      email: data.email || '',
      phone: data.phone || '',
      status: data.status as LeadStatus,
      tags: (data.tags || []) as LeadTag[],
      createdAt: data.created_at,
      lastContactedAt: data.last_contacted_at,
      assignedTo: data.assigned_to,
      source: data.source as LeadSource,
      budget: data.budget,
      desiredLocation: data.desired_location,
      propertyType: data.property_type as PropertyType,
      propertyReference: data.property_reference,
      external_id: data.external_id,
      bedrooms: data.bedrooms,
      taskType: data.task_type as TaskType,
      nextFollowUpDate: data.next_follow_up_date,
      notes: data.notes,
      nationality: data.nationality,
      pipelineType: data.pipeline_type || "purchase",
      url: data.url || '',
      country: data.country
    };
    
    toast({
      title: "Nouveau lead créé",
      description: `Le lead ${createdLead.name} a été ajouté avec succès.`
    });
    
    // Add to local cache
    leadsData.unshift(createdLead);
    
    return createdLead;
  } catch (err) {
    console.error('Unexpected error creating lead:', err);
    
    // Fallback to local
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    
    const localLead: LeadDetailed = {
      id,
      createdAt,
      ...newLead,
      status: newLead.status,
      pipelineType: newLead.pipelineType || "purchase",
      url: newLead.url || ''
    };
    
    // Add to local cache
    leadsData.unshift(localLead);
    
    toast({
      title: "Nouveau lead créé (mode local)",
      description: `Le lead ${localLead.name} a été ajouté en local.`
    });
    
    return localLead;
  }
};

export const deleteLead = async (id: string): Promise<boolean> => {
  try {
    // Delete from Supabase
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting lead from Supabase:', error);
      // Fallback to local delete
      const initialLength = leadsData.length;
      leadsData = leadsData.filter(lead => lead.id !== id);
      
      if (leadsData.length < initialLength) {
        toast({
          title: "Lead supprimé (mode local)",
          description: "Le lead a été supprimé en local."
        });
        return true;
      }
      
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de trouver le lead à supprimer."
      });
      return false;
    }
    
    // Remove from local cache too
    leadsData = leadsData.filter(lead => lead.id !== id);
    
    toast({
      title: "Lead supprimé",
      description: "Le lead a été supprimé avec succès."
    });
    
    return true;
  } catch (err) {
    console.error('Unexpected error deleting lead:', err);
    
    // Fallback to local delete
    const initialLength = leadsData.length;
    leadsData = leadsData.filter(lead => lead.id !== id);
    
    if (leadsData.length < initialLength) {
      toast({
        title: "Lead supprimé (mode local)",
        description: "Le lead a été supprimé en local."
      });
      return true;
    }
    
    toast({
      variant: "destructive",
      title: "Erreur",
      description: "Impossible de trouver le lead à supprimer."
    });
    return false;
  }
};

export const convertToSimpleLead = (lead: LeadDetailed) => {
  return {
    id: lead.id,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    location: lead.location,
    status: lead.status,
    tags: lead.tags,
    assignedTo: lead.assignedTo,
    createdAt: lead.createdAt,
    lastContactedAt: lead.lastContactedAt,
    pipelineType: lead.pipelineType,
  };
};

// Add a function to reset all leads data
export const resetLeadsData = async (): Promise<void> => {
  try {
    // This is a dangerous operation, so we're not implementing actual deletion from Supabase
    // Just clearing the local cache
    leadsData = [];
    toast({
      title: "Données locales réinitialisées",
      description: "Tous les leads ont été supprimés de la cache locale."
    });
  } catch (err) {
    console.error('Error resetting leads data:', err);
    toast({
      variant: "destructive",
      title: "Erreur",
      description: "Impossible de réinitialiser les données."
    });
  }
};
