
// Minimal data fetching -- to be expanded later
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export async function getOwners() {
  const { data } = await supabase.from("owners").select("*").order("created_at", { ascending: false });
  return data || [];
}

// Récupérer un propriétaire par son ID
export async function getOwnerById(id: string) {
  const { data, error } = await supabase
    .from("owners")
    .select(`
      *,
      owner_properties(*)
    `)
    .eq("id", id)
    .single();
  
  if (error) {
    console.error("Error fetching owner:", error);
    toast({
      variant: "destructive",
      title: "Erreur",
      description: "Impossible de récupérer les détails du propriétaire."
    });
    return null;
  }
  
  return data;
}

// Créer un nouveau propriétaire
export async function createOwner(ownerData: any) {
  const { data, error } = await supabase
    .from("owners")
    .insert(ownerData)
    .select("id")
    .single();
    
  if (error) {
    console.error("Error creating owner:", error);
    toast({
      variant: "destructive",
      title: "Erreur",
      description: "Impossible de créer le propriétaire."
    });
    return null;
  }
  
  toast({
    title: "Propriétaire créé",
    description: "Le propriétaire a été créé avec succès."
  });
  
  return data.id;
}

// Mettre à jour le statut d'un propriétaire
export async function updateOwnerStatus(id: string, status: string) {
  const { error } = await supabase
    .from("owners")
    .update({ relationship_status: status })
    .eq("id", id);
    
  if (error) {
    console.error("Error updating owner status:", error);
    toast({
      variant: "destructive",
      title: "Erreur",
      description: "Impossible de mettre à jour le statut du propriétaire."
    });
    return false;
  }
  
  toast({
    title: "Statut mis à jour",
    description: "Le statut du propriétaire a été mis à jour avec succès."
  });
  
  return true;
}

// Mettre à jour un propriétaire
export async function updateOwner(id: string, ownerData: any) {
  const { error } = await supabase
    .from("owners")
    .update(ownerData)
    .eq("id", id);
    
  if (error) {
    console.error("Error updating owner:", error);
    toast({
      variant: "destructive",
      title: "Erreur",
      description: "Impossible de mettre à jour les informations du propriétaire."
    });
    return false;
  }
  
  return true;
}

// Ajouter une propriété à un propriétaire
export async function addPropertyToOwner(ownerId: string, propertyData: any) {
  const { error } = await supabase
    .from("owner_properties")
    .insert({ 
      owner_id: ownerId,
      property_reference: propertyData.reference,
      property_status: propertyData.status || "À vendre"
    });
    
  if (error) {
    console.error("Error adding property to owner:", error);
    toast({
      variant: "destructive",
      title: "Erreur",
      description: "Impossible d'ajouter la propriété au propriétaire."
    });
    return false;
  }
  
  toast({
    title: "Propriété ajoutée",
    description: "La propriété a été ajoutée avec succès."
  });
  
  return true;
}

// Supprimer une propriété d'un propriétaire
export async function removePropertyFromOwner(propertyId: string) {
  const { error } = await supabase
    .from("owner_properties")
    .delete()
    .eq("id", propertyId);
    
  if (error) {
    console.error("Error removing property from owner:", error);
    toast({
      variant: "destructive",
      title: "Erreur",
      description: "Impossible de supprimer la propriété du propriétaire."
    });
    return false;
  }
  
  toast({
    title: "Propriété supprimée",
    description: "La propriété a été supprimée avec succès."
  });
  
  return true;
}

// Ajouter une action pour un propriétaire
export async function addOwnerAction(ownerAction: any) {
  const { error } = await supabase
    .from("owner_actions")
    .insert(ownerAction);
    
  if (error) {
    console.error("Error adding owner action:", error);
    toast({
      variant: "destructive",
      title: "Erreur",
      description: "Impossible d'ajouter l'action."
    });
    return false;
  }
  
  toast({
    title: "Action ajoutée",
    description: "L'action a été ajoutée avec succès."
  });
  
  return true;
}

// Récupérer les actions d'un propriétaire
export async function getOwnerActions(ownerId: string) {
  const { data, error } = await supabase
    .from("owner_actions")
    .select("*")
    .eq("owner_id", ownerId)
    .order("scheduled_date", { ascending: false });
    
  if (error) {
    console.error("Error fetching owner actions:", error);
    return [];
  }
  
  return data || [];
}

// Mettre à jour le statut d'une action
export async function updateOwnerActionStatus(actionId: string, status: string) {
  const { error } = await supabase
    .from("owner_actions")
    .update({ 
      status: status,
      completed_date: status === 'completed' ? new Date().toISOString() : null
    })
    .eq("id", actionId);
    
  if (error) {
    console.error("Error updating owner action status:", error);
    toast({
      variant: "destructive",
      title: "Erreur",
      description: "Impossible de mettre à jour le statut de l'action."
    });
    return false;
  }
  
  return true;
}
