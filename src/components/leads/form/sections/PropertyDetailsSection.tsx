
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import FormField from '../FormField';
import { PropertyType, ViewType, Amenity } from '@/types/lead';
import MultiSelectButtons from '../MultiSelectButtons';
import PropertyUrlField from '../PropertyUrlField';
import LocationSearchSection from './LocationSearchSection';
import { Country } from '@/types/lead';

interface PropertyDetailsSectionProps {
  formData: {
    propertyTypes?: PropertyType[];
    views?: ViewType[];
    amenities?: Amenity[];
    country?: string;
    desiredLocation?: string;
    url?: string;
    livingArea?: string;
    landArea?: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleMultiSelectToggle: <T extends string>(name: keyof any, value: T) => void;
  propertyTypes: PropertyType[];
  viewTypes: ViewType[];
  amenities: Amenity[];
  countries: Country[];
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
  return (
    <div className="space-y-6">
      {/* Types de bien */}
      <div className="space-y-2">
        <Label>Types de bien</Label>
        <MultiSelectButtons
          options={propertyTypes}
          selectedValues={formData.propertyTypes || []}
          onToggle={(value) => handleMultiSelectToggle('propertyTypes', value as PropertyType)}
        />
      </div>

      {/* Location Search Section */}
      <LocationSearchSection
        country={formData.country || ''}
        desiredLocation={formData.desiredLocation || ''}
        onCountryChange={handleCountryChange}
        onLocationChange={(value) => {
          const e = {
            target: {
              name: 'desiredLocation',
              value
            }
          } as React.ChangeEvent<HTMLInputElement>;
          handleInputChange(e);
        }}
      />

      {/* Property URL Field */}
      <PropertyUrlField
        url={formData.url || ''}
        handleInputChange={handleInputChange}
        onExtract={onExtractUrl}
        isLoading={extractLoading}
      />

      {/* Living Area */}
      <FormField
        label="Surface habitable"
        name="livingArea"
        value={formData.livingArea || ''}
        onChange={handleInputChange}
        placeholder="m²"
      />

      {/* Land Area */}
      <FormField
        label="Surface terrain"
        name="landArea"
        value={formData.landArea || ''}
        onChange={handleInputChange}
        placeholder="m²"
      />

      {/* Vue */}
      <div className="space-y-2">
        <Label>Vue</Label>
        <MultiSelectButtons
          options={viewTypes}
          selectedValues={formData.views || []}
          onToggle={(value) => handleMultiSelectToggle('views', value as ViewType)}
        />
      </div>

      {/* Prestations */}
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
