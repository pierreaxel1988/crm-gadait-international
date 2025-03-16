
import { Amenity, ViewType } from '@/types/lead';

// Helper function to map string amenities to Amenity enum values
export const mapStringToAmenity = (amenity: string): Amenity => {
  const normalizedAmenity = amenity.toLowerCase().trim();
  
  if (normalizedAmenity.includes('piscine')) return 'Piscine';
  if (normalizedAmenity.includes('jardin')) return 'Jardin';
  if (normalizedAmenity.includes('garage')) return 'Garage';
  if (normalizedAmenity.includes('sécurité') || normalizedAmenity.includes('securite')) return 'Sécurité';
  // Make sure to return a valid Amenity type value
  if (normalizedAmenity.includes('vue mer') || normalizedAmenity.includes('sea view')) return 'Mer';
  
  return 'Piscine'; // Default value if no match is found
};

// Helper function to map string views to ViewType enum values
export const mapStringToViewType = (view: string): ViewType => {
  const normalizedView = view.toLowerCase().trim();
  
  if (normalizedView.includes('mer')) return 'Mer';
  if (normalizedView.includes('montagne')) return 'Montagne';
  if (normalizedView.includes('golf')) return 'Golf';
  
  return 'Autres'; // Default value if no match is found
};
