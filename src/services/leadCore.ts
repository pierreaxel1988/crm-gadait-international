
import { LeadDetailed } from "@/types/lead";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Starting with an empty array for local fallback
let leadsData: LeadDetailed[] = [];

export const getLeads = async (): Promise<LeadDetailed[]> => {
  try {
    // Try to get leads from Supabase
    const { data, error } = await supabase
      .from('leads')
      .select('*');
    
    if (error) {
      console.error('Error fetching leads from Supabase:', error);
      console.info('Falling back to local leads data');
      return leadsData;
    }
    
    // Map the data to match our LeadDetailed type
    const mappedLeads = data.map(lead => ({
      id: lead.id,
      name: lead.name,
      email: lead.email || "",
      phone: lead.phone || "",
      location: lead.location || "",
      source: lead.source || "",
      budget: lead.budget || "",
      propertyReference: lead.property_reference || "",
      desiredLocation: lead.desired_location || "",
      propertyType: lead.property_type || "",
      nationality: lead.nationality || "",
      notes: lead.notes || "",
      status: lead.status,
      tags: lead.tags || [],
      assignedTo: lead.assigned_to,
      createdAt: lead.created_at,
      lastContactedAt: lead.last_contacted_at || null,
      taskType: lead.task_type || "Call",
      url: lead.url || ""
    }));
    
    console.info('Mapped leads:', mappedLeads);
    return mappedLeads;
  } catch (error) {
    console.error('Unexpected error fetching leads:', error);
    return leadsData;
  }
};

export const getLead = async (id: string): Promise<LeadDetailed | undefined> => {
  try {
    // Try to get lead from Supabase
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
    
    if (!data) return undefined;
    
    // Map the data to match our LeadDetailed type
    return {
      id: data.id,
      name: data.name,
      email: data.email || "",
      phone: data.phone || "",
      location: data.location || "",
      source: data.source || "",
      budget: data.budget || "",
      propertyReference: data.property_reference || "",
      desiredLocation: data.desired_location || "",
      propertyType: data.property_type || "",
      nationality: data.nationality || "",
      notes: data.notes || "",
      status: data.status,
      tags: data.tags || [],
      assignedTo: data.assigned_to,
      createdAt: data.created_at,
      lastContactedAt: data.last_contacted_at || null,
      taskType: data.task_type || "Call",
      url: data.url || ""
    };
  } catch (error) {
    console.error('Unexpected error fetching lead:', error);
    return leadsData.find(lead => lead.id === id);
  }
};

export const updateLead = async (updatedLead: LeadDetailed): Promise<LeadDetailed> => {
  try {
    // Update in Supabase
    const { data, error } = await supabase
      .from('leads')
      .update({
        name: updatedLead.name,
        email: updatedLead.email,
        phone: updatedLead.phone,
        location: updatedLead.location,
        source: updatedLead.source,
        budget: updatedLead.budget,
        property_reference: updatedLead.propertyReference,
        desired_location: updatedLead.desiredLocation,
        property_type: updatedLead.propertyType,
        nationality: updatedLead.nationality,
        notes: updatedLead.notes,
        status: updatedLead.status,
        tags: updatedLead.tags,
        assigned_to: updatedLead.assignedTo,
        last_contacted_at: updatedLead.lastContactedAt,
        task_type: updatedLead.taskType
      })
      .eq('id', updatedLead.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating lead in Supabase:', error);
      // Fallback to local update
      const index = leadsData.findIndex(lead => lead.id === updatedLead.id);
      
      if (index !== -1) {
        leadsData[index] = updatedLead;
        toast({
          title: "Lead mis à jour (local)",
          description: `Les informations pour ${updatedLead.name} ont été enregistrées localement.`
        });
        return updatedLead;
      } else {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de trouver le lead demandé."
        });
        throw new Error("Lead not found");
      }
    }
    
    toast({
      title: "Lead mis à jour",
      description: `Les informations pour ${updatedLead.name} ont été enregistrées.`
    });
    
    // Update local cache
    const index = leadsData.findIndex(lead => lead.id === updatedLead.id);
    if (index !== -1) {
      leadsData[index] = updatedLead;
    }
    
    return updatedLead;
  } catch (error) {
    console.error('Unexpected error updating lead:', error);
    
    // Fallback to local update
    const index = leadsData.findIndex(lead => lead.id === updatedLead.id);
    
    if (index !== -1) {
      leadsData[index] = updatedLead;
      toast({
        title: "Lead mis à jour (local)",
        description: `Les informations pour ${updatedLead.name} ont été enregistrées localement.`
      });
      return updatedLead;
    } else {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de trouver le lead demandé."
      });
      throw new Error("Lead not found");
    }
  }
};

export const createLead = async (newLead: Omit<LeadDetailed, 'id' | 'createdAt'>): Promise<LeadDetailed> => {
  try {
    // Create in Supabase
    const { data, error } = await supabase
      .from('leads')
      .insert({
        name: newLead.name,
        email: newLead.email,
        phone: newLead.phone,
        location: newLead.location,
        source: newLead.source,
        budget: newLead.budget,
        property_reference: newLead.propertyReference,
        desired_location: newLead.desiredLocation,
        property_type: newLead.propertyType,
        nationality: newLead.nationality,
        notes: newLead.notes,
        status: newLead.status || "New",
        tags: newLead.tags || ["Imported"],
        assigned_to: newLead.assignedTo,
        task_type: newLead.taskType || "Call",
        url: newLead.url || ""
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating lead in Supabase:', error);
      // Fallback to local creation
      return createLocalLead(newLead);
    }
    
    const createdLead: LeadDetailed = {
      id: data.id,
      createdAt: data.created_at,
      name: data.name,
      email: data.email || "",
      phone: data.phone || "",
      location: data.location || "",
      source: data.source || "",
      budget: data.budget || "",
      propertyReference: data.property_reference || "",
      desiredLocation: data.desired_location || "",
      propertyType: data.property_type || "",
      nationality: data.nationality || "",
      notes: data.notes || "",
      status: data.status,
      tags: data.tags || [],
      assignedTo: data.assigned_to,
      lastContactedAt: data.last_contacted_at || null,
      taskType: data.task_type || "Call",
      url: data.url || ""
    };
    
    // Update local cache
    leadsData.unshift(createdLead);
    
    toast({
      title: "Nouveau lead créé",
      description: `Le lead ${createdLead.name} a été ajouté avec succès.`
    });
    
    return createdLead;
  } catch (error) {
    console.error('Unexpected error creating lead:', error);
    // Fallback to local creation
    return createLocalLead(newLead);
  }
};

// Helper function for local lead creation (fallback)
const createLocalLead = (newLead: Omit<LeadDetailed, 'id' | 'createdAt'>): LeadDetailed => {
  const id = (leadsData.length + 1).toString();
  const createdAt = new Date().toISOString().split('T')[0];
  
  const lead: LeadDetailed = {
    id,
    createdAt,
    ...newLead,
    status: newLead.status || "New"
  };
  
  leadsData.unshift(lead);
  
  toast({
    title: "Nouveau lead créé (local)",
    description: `Le lead ${lead.name} a été ajouté localement.`
  });
  
  return lead;
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
      // Fallback to local deletion
      return deleteLocalLead(id);
    }
    
    // Update local cache
    const initialLength = leadsData.length;
    leadsData = leadsData.filter(lead => lead.id !== id);
    
    toast({
      title: "Lead supprimé",
      description: "Le lead a été supprimé avec succès."
    });
    
    return true;
  } catch (error) {
    console.error('Unexpected error deleting lead:', error);
    // Fallback to local deletion
    return deleteLocalLead(id);
  }
};

// Helper function for local lead deletion (fallback)
const deleteLocalLead = (id: string): boolean => {
  const initialLength = leadsData.length;
  leadsData = leadsData.filter(lead => lead.id !== id);
  
  if (leadsData.length < initialLength) {
    toast({
      title: "Lead supprimé (local)",
      description: "Le lead a été supprimé localement."
    });
    return true;
  }
  
  toast({
    variant: "destructive",
    title: "Erreur",
    description: "Impossible de trouver le lead à supprimer."
  });
  return false;
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
  };
};

// Add a function to reset all leads data
export const resetLeadsData = async (): Promise<void> => {
  try {
    // Reset in Supabase (delete all records)
    const { error } = await supabase
      .from('leads')
      .delete()
      .neq('id', 'dummy'); // Delete all records
    
    if (error) {
      console.error('Error resetting leads in Supabase:', error);
    }
    
    // Reset local cache
    leadsData = [];
    
    toast({
      title: "Données réinitialisées",
      description: "Tous les leads ont été supprimés."
    });
  } catch (error) {
    console.error('Unexpected error resetting leads:', error);
    
    // Reset local cache anyway
    leadsData = [];
    
    toast({
      title: "Données réinitialisées (local)",
      description: "Tous les leads ont été supprimés localement."
    });
  }
};
