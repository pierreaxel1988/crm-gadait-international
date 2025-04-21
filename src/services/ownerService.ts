
// Minimal data fetching -- to be expanded later
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export async function getOwners() {
  const { data } = await supabase.from("owners").select("*").order("created_at", { ascending: false });
  return data || [];
}

// Récupérer un propriétaire par son ID
export async function getOwnerById(id: string) {
  const { data, error } = await supabase.from("owners").select("*").eq("id", id).single();
  
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
  
  toast({
    title: "Propriétaire mis à jour",
    description: "Les informations du propriétaire ont été mises à jour avec succès."
  });
  
  return true;
}
