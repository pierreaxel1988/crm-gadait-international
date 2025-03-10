
import { PropertySelection } from "@/types/property";
import { LeadDetailed } from "@/types/lead";
import { supabase, toast } from "../base/supabaseService";

// Créer une sélection de propriétés
export const createPropertySelection = async (
  name: string,
  lead: LeadDetailed,
  propertyIds: string[]
): Promise<PropertySelection | null> => {
  if (!propertyIds.length) {
    toast({
      variant: "destructive",
      title: "Erreur",
      description: "Veuillez sélectionner au moins une propriété"
    });
    return null;
  }
  
  const { data, error } = await supabase
    .from('property_selections')
    .insert({
      name,
      lead_id: lead.id,
      properties: propertyIds,
      status: 'draft'
    })
    .select()
    .single();
  
  if (error) {
    toast({
      variant: "destructive",
      title: "Erreur",
      description: "Impossible de créer la sélection"
    });
    return null;
  }
  
  toast({
    title: "Sélection créée",
    description: "La sélection a été créée avec succès"
  });
  
  return data as PropertySelection;
};

// Envoyer la sélection par email
export const sendSelectionByEmail = async (
  selectionId: string,
  email: string
): Promise<boolean> => {
  try {
    const response = await fetch('/api/send-property-selection', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        selectionId,
        email
      }),
    });
    
    const data = await response.json();
    
    if (data.error) {
      toast({
        variant: "destructive",
        title: "Erreur d'envoi",
        description: data.error
      });
      return false;
    }
    
    // Mettre à jour le statut de la sélection
    await supabase
      .from('property_selections')
      .update({
        status: 'sent',
        email_sent_at: new Date().toISOString()
      })
      .eq('id', selectionId);
    
    toast({
      title: "Email envoyé",
      description: "La sélection a été envoyée avec succès"
    });
    
    return true;
  } catch (error) {
    toast({
      variant: "destructive",
      title: "Erreur d'envoi",
      description: "Impossible d'envoyer la sélection par email"
    });
    return false;
  }
};

// Obtenir les sélections pour un lead
export const getSelectionsForLead = async (leadId: string): Promise<PropertySelection[]> => {
  const { data, error } = await supabase
    .from('property_selections')
    .select('*')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false });
  
  if (error) {
    toast({
      variant: "destructive",
      title: "Erreur",
      description: "Impossible de récupérer les sélections"
    });
    return [];
  }
  
  return data as PropertySelection[];
};
