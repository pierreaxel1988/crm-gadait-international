
import { Property, PropertyFilter } from "@/types/property";
import { supabase, toast, handleFetchError } from "../base/supabaseService";

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
