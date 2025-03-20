
import React from 'react';
import { LeadDetailed, PropertyType, ViewType, Amenity, Country } from '@/types/lead';
import FormInput from '../FormInput';
import MultiSelectButtons from '../MultiSelectButtons';
import PropertyUrlField from '../PropertyUrlField';
import { LOCATIONS_BY_COUNTRY } from '@/utils/locationsByCountry';

interface PropertyDetailsSectionProps {
  formData: LeadDetailed;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleNumberChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleMultiSelectToggle: <T extends string>(name: keyof LeadDetailed, value: T) => void;
  propertyTypes: PropertyType[];
  viewTypes: ViewType[];
  amenities: Amenity[];
  onExtractUrl?: (url: string) => void;
  countries: Country[];
  handleCountryChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

const PropertyDetailsSection = ({
  formData,
  handleInputChange,
  handleNumberChange,
  handleMultiSelectToggle,
  propertyTypes,
  viewTypes,
  amenities,
  onExtractUrl,
  countries,
  handleCountryChange
}: PropertyDetailsSectionProps) => {
  
  // Get locations based on selected country
  const getLocations = () => {
    if (!formData.country) return [];
    
    const locations = LOCATIONS_BY_COUNTRY[formData.country as keyof typeof LOCATIONS_BY_COUNTRY];
    if (locations) {
      return locations.map(location => ({
        value: location,
        label: location
      }));
    }
    
    return [];
  };

  // Correctly handle the URL extraction by creating a proper function
  const handleExtractUrl = (url: string) => {
    if (onExtractUrl) {
      onExtractUrl(url);
    }
  };

  return (
    <div className="space-y-4">
      <PropertyUrlField 
        value={formData.url || ''} 
        onChange={handleInputChange}
        onExtract={handleExtractUrl} 
      />

      <FormInput
        label="Pays recherché"
        name="country"
        type="select"
        value={formData.country || ''}
        onChange={handleCountryChange}
        options={countries.map(country => ({ value: country, label: country }))}
        placeholder="Pays de recherche"
      />

      <FormInput
        label="Localisation souhaitée"
        name="desiredLocation"
        type="select"
        value={formData.desiredLocation || ''}
        onChange={handleInputChange}
        options={getLocations()}
        placeholder="Localisation souhaitée"
      />

      <div className="pt-2">
        <h4 className="text-sm font-medium mb-3">Type de propriété</h4>
        <MultiSelectButtons
          options={propertyTypes}
          selectedValues={Array.isArray(formData.propertyTypes) ? formData.propertyTypes : []}
          onChange={(value) => handleMultiSelectToggle('propertyTypes', value)}
        />
      </div>

      <FormInput
        label="Chambres"
        name="bedrooms"
        type="number"
        value={formData.bedrooms as number | string || ''}
        onChange={handleNumberChange || handleInputChange}
        min={0}
        placeholder="Nombre de chambres"
      />

      <FormInput
        label="Surface habitable (m²)"
        name="livingArea"
        value={formData.livingArea || ''}
        onChange={handleInputChange}
        placeholder="Surface habitable approximative"
      />

      <FormInput
        label="Budget maximum"
        name="budget"
        value={formData.budget || ''}
        onChange={handleInputChange}
        placeholder="Budget maximum"
      />

      <div className="pt-2">
        <h4 className="text-sm font-medium mb-3">Vue souhaitée</h4>
        <MultiSelectButtons
          options={viewTypes}
          selectedValues={formData.views || []}
          onChange={(value) => handleMultiSelectToggle('views', value)}
        />
      </div>

      <div className="pt-2">
        <h4 className="text-sm font-medium mb-3">Commodités souhaitées</h4>
        <MultiSelectButtons
          options={amenities}
          selectedValues={formData.amenities || []}
          onChange={(value) => handleMultiSelectToggle('amenities', value)}
        />
      </div>
    </div>
  );
};

export default PropertyDetailsSection;
