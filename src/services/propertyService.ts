
import { supabase } from "@/integrations/supabase/client";
import { Property, PropertySelection, PropertyFilter } from "@/types/property";
import { LeadDetailed } from "@/types/lead";
import { toast } from "@/hooks/use-toast";

// Synchroniser les propriétés
export const syncProperties = async (): Promise<number> => {
  try {
    const response = await fetch('/api/sync-properties');
    const data = await response.json();
    
    if (data.error) {
      toast({
        variant: "destructive",
        title: "Erreur de synchronisation",
        description: data.error
      });
      return 0;
    }
    
    toast({
      title: "Synchronisation réussie",
      description: `${data.count} propriétés synchronisées`
    });
    
    return data.count;
  } catch (error) {
    toast({
      variant: "destructive",
      title: "Erreur de synchronisation",
      description: "Impossible de synchroniser les propriétés"
    });
    return 0;
  }
};

// Récupérer les propriétés avec filtres optionnels
export const getProperties = async (filters?: PropertyFilter): Promise<Property[]> => {
  let query = supabase.from('properties').select('*');
  
  if (filters) {
    if (filters.minPrice) query = query.gte('price', filters.minPrice);
    if (filters.maxPrice) query = query.lte('price', filters.maxPrice);
    if (filters.location) query = query.ilike('location', `%${filters.location}%`);
    if (filters.country) query = query.eq('country', filters.country);
    if (filters.property_type) query = query.eq('property_type', filters.property_type);
    if (filters.minBedrooms) query = query.gte('bedrooms', filters.minBedrooms);
    if (filters.minBathrooms) query = query.gte('bathrooms', filters.minBathrooms);
    if (filters.minArea) query = query.gte('area', filters.minArea);
    if (filters.features && filters.features.length > 0) {
      query = query.contains('features', filters.features);
    }
    if (filters.amenities && filters.amenities.length > 0) {
      query = query.contains('amenities', filters.amenities);
    }
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  
  if (error) {
    toast({
      variant: "destructive",
      title: "Erreur",
      description: "Impossible de récupérer les propriétés"
    });
    return [];
  }
  
  return data as Property[];
};

// Récupérer une propriété par ID
export const getProperty = async (id: string): Promise<Property | null> => {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    toast({
      variant: "destructive",
      title: "Erreur",
      description: "Impossible de récupérer la propriété"
    });
    return null;
  }
  
  return data as Property;
};

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
