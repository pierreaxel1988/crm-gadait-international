
import React from 'react';
import { Label } from '@/components/ui/label';
import FormField from '../FormField';
import { PropertyType, ViewType, Amenity } from '@/types/lead';
import MultiSelectButtons from '../MultiSelectButtons';
import PropertyUrlField from '../PropertyUrlField';
import LocationSearchSection from './LocationSearchSection';

interface PropertyDetailsSectionProps {
  formData: {
    propertyTypes?: PropertyType[];
    views?: ViewType[];
    amenities?: Amenity[];
    country?: string;
    desiredLocation?: string | string[];
    url?: string;
    livingArea?: string;
    landArea?: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleMultiSelectToggle: (name: string, value: PropertyType | ViewType | Amenity) => void;
  propertyTypes: PropertyType[];
  viewTypes: ViewType[];
  amenities: Amenity[];
  onExtractUrl?: (url: string) => void;
  extractLoading?: boolean;
  handleCountryChange: (value: string) => void;
}

const PropertyDetailsSection: React.FC<PropertyDetailsSectionProps> = ({
  formData,
  handleInputChange,
  handleMultiSelectToggle,
  propertyTypes,
  viewTypes,
  amenities,
  onExtractUrl,
  extractLoading,
  handleCountryChange,
}) => {
  const handleLocationChange = (value: string) => {
    const syntheticEvent = {
      target: {
        name: 'desiredLocation',
        value
      }
    } as React.ChangeEvent<HTMLInputElement>;
    handleInputChange(syntheticEvent);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Types de bien</Label>
        <MultiSelectButtons
          options={propertyTypes}
          selectedValues={formData.propertyTypes || []}
          onToggle={(value) => handleMultiSelectToggle('propertyTypes', value as PropertyType)}
        />
      </div>

      <LocationSearchSection
        country={formData.country || ''}
        desiredLocation={formData.desiredLocation || []}
        onCountryChange={(value) => {
          const syntheticEvent = {
            target: {
              name: 'country',
              value
            }
          } as React.ChangeEvent<HTMLInputElement>;
          handleCountryChange(value);
        }}
        onLocationChange={handleLocationChange}
      />

      {formData.url !== undefined && (
        <PropertyUrlField
          value={formData.url}
          onChange={handleInputChange}
          onExtract={onExtractUrl}
          isLoading={extractLoading}
        />
      )}

      <FormField
        label="Surface habitable"
        value={formData.livingArea || ''}
        onChange={handleInputChange}
        placeholder="m²"
        fieldName="livingArea"
      />

      <FormField
        label="Surface terrain"
        value={formData.landArea || ''}
        onChange={handleInputChange}
        placeholder="m²"
        fieldName="landArea"
      />

      <div className="space-y-2">
        <Label>Vue</Label>
        <MultiSelectButtons
          options={viewTypes}
          selectedValues={formData.views || []}
          onToggle={(value) => handleMultiSelectToggle('views', value as ViewType)}
        />
      </div>

      <div className="space-y-2">
        <Label>Prestations</Label>
        <MultiSelectButtons
          options={amenities}
          selectedValues={formData.amenities || []}
          onToggle={(value) => handleMultiSelectToggle('amenities', value as Amenity)}
        />
      </div>
    </div>
  );
};

export default PropertyDetailsSection;
