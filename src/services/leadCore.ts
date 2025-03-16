
import { LeadDetailed } from "@/types/lead";
import { toast } from "@/hooks/use-toast";

// Starting with an empty array instead of mock data
let leadsData: LeadDetailed[] = [];

export const getLeads = (): LeadDetailed[] => {
  return leadsData;
};

export const getLead = (id: string): LeadDetailed | undefined => {
  return leadsData.find(lead => lead.id === id);
};

export const updateLead = (updatedLead: LeadDetailed): LeadDetailed => {
  const index = leadsData.findIndex(lead => lead.id === updatedLead.id);
  
  if (index !== -1) {
    leadsData[index] = updatedLead;
    toast({
      title: "Lead mis à jour",
      description: `Les informations pour ${updatedLead.name} ont été enregistrées.`
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
};

export const createLead = (newLead: Omit<LeadDetailed, 'id' | 'createdAt'>): LeadDetailed => {
  const id = (leadsData.length + 1).toString();
  const createdAt = new Date().toISOString().split('T')[0];
  
  // Ensure status is properly set, defaulting to "New" if not provided
  // And set a default pipelineType to 'purchase' if not provided
  const lead: LeadDetailed = {
    id,
    createdAt,
    ...newLead,
    status: newLead.status || "New", // Ensure status defaults to "New"
    pipelineType: newLead.pipelineType || "purchase" // Assurer que le type de pipeline est défini
  };
  
  // Always add to the beginning of the array to show newest leads first
  leadsData.unshift(lead);
  
  toast({
    title: "Nouveau lead créé",
    description: `Le lead ${lead.name} a été ajouté avec succès.`
  });
  
  return lead;
};

export const deleteLead = (id: string): boolean => {
  const initialLength = leadsData.length;
  leadsData = leadsData.filter(lead => lead.id !== id);
  
  if (leadsData.length < initialLength) {
    toast({
      title: "Lead supprimé",
      description: "Le lead a été supprimé avec succès."
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
    pipelineType: lead.pipelineType, // Ajouter le type de pipeline
  };
};

// Add a function to reset all leads data
export const resetLeadsData = (): void => {
  leadsData = [];
  toast({
    title: "Données réinitialisées",
    description: "Tous les leads ont été supprimés."
  });
};
