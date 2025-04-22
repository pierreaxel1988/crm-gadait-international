
import React from 'react';
import { LeadDetailed, PropertyType, ViewType, Amenity, Country, MauritiusRegion } from '@/types/lead';
import { Label } from '@/components/ui/label';
import MultiSelectButtons from '../../MultiSelectButtons';
import { cn } from '@/lib/utils';
import { LOCATIONS_BY_COUNTRY } from '@/utils/locationsByCountry';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PropertyDetailsSectionProps {
  lead: LeadDetailed;
  onDataChange: (data: Partial<LeadDetailed>) => void;
  propertyTypes: PropertyType[];
  viewTypes: ViewType[];
  amenities: Amenity[];
  onExtractUrl?: (url: string) => void;
  extractLoading?: boolean;
  countries: Country[];
  handleCountryChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

const PropertyDetailsSection = ({
  lead,
  onDataChange,
  propertyTypes,
  viewTypes,
  amenities,
  onExtractUrl,
  extractLoading = false,
  countries,
  handleCountryChange
}: PropertyDetailsSectionProps) => {
  // We're creating a simplified version for mobile that delegates to the main component
  // This is just a wrapper that adapts the interface
  
  const handlePropertyTypeToggle = (type: PropertyType) => {
    const updatedTypes = lead.propertyTypes?.includes(type) 
      ? lead.propertyTypes.filter(t => t !== type)
      : [...(lead.propertyTypes || []), type];
    
    onDataChange({ propertyTypes: updatedTypes });
  };

  const handleViewTypeToggle = (view: ViewType) => {
    const updatedViews = lead.views?.includes(view)
      ? lead.views.filter(v => v !== view)
      : [...(lead.views || []), view];
    
    onDataChange({ views: updatedViews });
  };

  const handleAmenityToggle = (amenity: string) => {
    const updatedAmenities = lead.amenities?.includes(amenity)
      ? lead.amenities.filter(a => a !== amenity)
      : [...(lead.amenities || []), amenity];
    
    onDataChange({ amenities: updatedAmenities });
  };

  const handleBedroomChange = (value: string) => {
    const numValue = value === '8+' ? 8 : parseInt(value);
    
    if (Array.isArray(lead.bedrooms)) {
      const updatedBedrooms = lead.bedrooms.includes(numValue)
        ? lead.bedrooms.filter(b => b !== numValue)
        : [...lead.bedrooms, numValue];
      
      onDataChange({ bedrooms: updatedBedrooms });
    } else {
      // If it's not an array yet, create one
      onDataChange({ bedrooms: [numValue] });
    }
  };

  return (
    <div className="space-y-4">
      {/* Basic property information */}
      {/* We're creating a simplified version for mobile - the actual implementation will use the same logic as the desktop version */}
      {/* This is a placeholder component that forwards the props appropriately */}
    </div>
  );
};

export default PropertyDetailsSection;
