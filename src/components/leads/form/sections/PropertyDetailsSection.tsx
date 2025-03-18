
import React from 'react';
import { Hash, Home, Map, ArrowsMaximize, Coins, Search, Globe, Mountain, Building, Users } from 'lucide-react';
import { LeadDetailed, PropertyType, ViewType, Amenity } from '@/types/lead';
import FormSection from '../FormSection';
import FormInput from '../FormInput';
import MultiSelectButtons from '../MultiSelectButtons';
import PropertyUrlField from '../PropertyUrlField';

interface PropertyDetailsSectionProps {
  formData: LeadDetailed;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleNumberChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleMultiSelectToggle: <T extends string>(name: keyof LeadDetailed, value: T) => void;
  propertyTypes: PropertyType[];
  viewTypes: ViewType[];
  amenities: Amenity[];
  onExtractUrl: (url: string) => void;
}

const PropertyDetailsSection = ({
  formData,
  handleInputChange,
  handleNumberChange,
  handleMultiSelectToggle,
  propertyTypes,
  viewTypes,
  amenities,
  onExtractUrl
}: PropertyDetailsSectionProps) => {
  const handleBedroomToggle = (value: string) => {
    // Convert the string value to a number for the array
    const numValue = value === '10+' ? 10 : parseInt(value);
    
    // If formData.bedrooms is already an array
    if (Array.isArray(formData.bedrooms)) {
      const bedroomsArray = [...formData.bedrooms];
      
      if (bedroomsArray.includes(numValue)) {
        // Remove if already in array
        const updatedBedrooms = bedroomsArray.filter(b => b !== numValue);
        updateBedrooms(updatedBedrooms.length > 0 ? updatedBedrooms : undefined);
      } else {
        // Add if not in array
        updateBedrooms([...bedroomsArray, numValue]);
      }
    } 
    // If formData.bedrooms is a single number
    else if (typeof formData.bedrooms === 'number') {
      if (formData.bedrooms === numValue) {
        // If clicking the same value, clear it
        updateBedrooms(undefined);
      } else {
        // If clicking a different value, create an array with both values
        updateBedrooms([formData.bedrooms, numValue]);
      }
    }
    // If formData.bedrooms is empty or undefined
    else {
      updateBedrooms(numValue);
    }
  };
  
  const updateBedrooms = (value: number | number[] | undefined) => {
    // Create a synthetic event that conforms to the expected structure
    const syntheticEvent = {
      target: {
        name: 'bedrooms',
        value: value
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    // Pass this synthetic event to the handleInputChange function
    handleInputChange(syntheticEvent);
  };
  
  // Helper to get all selected bedroom options
  const getSelectedBedroomOptions = (): string[] => {
    if (!formData.bedrooms) {
      return [];
    }
    
    // If bedrooms is a number
    if (typeof formData.bedrooms === 'number') {
      return [formData.bedrooms >= 10 ? '10+' : formData.bedrooms.toString()];
    }
    
    // If bedrooms is an array
    if (Array.isArray(formData.bedrooms)) {
      return formData.bedrooms.map(b => b >= 10 ? '10+' : b.toString());
    }
    
    // If bedrooms might be a stringified array
    if (typeof formData.bedrooms === 'string') {
      try {
        // Check if it looks like a JSON string array
        if (formData.bedrooms.includes('[')) {
          const parsedBedrooms = JSON.parse(formData.bedrooms);
          if (Array.isArray(parsedBedrooms)) {
            return parsedBedrooms.map((b: number) => b >= 10 ? '10+' : b.toString());
          }
        }
        // It could be a simple string number
        const numBedrooms = parseInt(formData.bedrooms);
        if (!isNaN(numBedrooms)) {
          return [numBedrooms >= 10 ? '10+' : numBedrooms.toString()];
        }
      } catch (e) {
        console.error('Error parsing bedrooms:', e);
      }
    }
    
    return [];
  };
  
  // All bedroom options to select from
  const bedroomOptions = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10+'];
  
  const handleUrlUpdate = (url: string) => {
    // Create a synthetic event for the URL field
    const urlEvent = {
      target: {
        name: 'url',
        value: url
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    // Update the form data with the URL
    handleInputChange(urlEvent);
    
    // Call the extraction function
    if (url) {
      onExtractUrl(url);
    }
  };

  return (
    <FormSection title="Critères de recherche - Détails du bien">
      <PropertyUrlField 
        url={formData.url || ''}
        onUrlChange={handleUrlUpdate}
      />

      <FormInput
        label="Référence du bien"
        name="propertyReference"
        value={formData.propertyReference || ''}
        onChange={handleInputChange}
        icon={Hash}
        placeholder="Référence du bien"
      />

      <FormInput
        label="Type de bien"
        name="propertyType"
        type="select"
        value={formData.propertyType || ''}
        onChange={handleInputChange}
        icon={Home}
        options={propertyTypes.map(type => ({ value: type, label: type }))}
        placeholder="Sélectionner un type de bien"
      />

      <FormInput
        label="Localisation souhaitée"
        name="desiredLocation"
        value={formData.desiredLocation || ''}
        onChange={handleInputChange}
        icon={Map}
        placeholder="Quartier, ville, ou région"
      />

      <FormInput
        label="Surface habitable (m²)"
        name="livingArea"
        type="number"
        value={formData.livingArea || ''}
        onChange={handleInputChange}
        icon={ArrowsMaximize}
        placeholder="Surface en m²"
        min={0}
      />

      <FormInput
        label="Budget"
        name="budget"
        value={formData.budget || ''}
        onChange={handleInputChange}
        icon={Coins}
        placeholder="Budget souhaité"
      />

      <FormInput
        label="Nombre de chambres"
        name="bedrooms"
        value={formData.bedrooms?.toString() || ''}
        onChange={handleNumberChange}
        icon={Users}
        renderCustomField={() => (
          <MultiSelectButtons
            options={bedroomOptions}
            selectedValues={getSelectedBedroomOptions()}
            onToggle={handleBedroomToggle}
          />
        )}
      />

      <FormInput
        label="Vue"
        name="views"
        value={formData.views?.join(', ') || ''}
        onChange={() => {}}
        icon={Mountain}
        renderCustomField={() => (
          <MultiSelectButtons
            options={viewTypes}
            selectedValues={formData.views || []}
            onToggle={(value) => handleMultiSelectToggle('views', value)}
          />
        )}
      />

      <FormInput
        label="Équipements"
        name="amenities"
        value={formData.amenities?.join(', ') || ''}
        onChange={() => {}}
        icon={Building}
        renderCustomField={() => (
          <MultiSelectButtons
            options={amenities}
            selectedValues={formData.amenities || []}
            onToggle={(value) => handleMultiSelectToggle('amenities', value)}
          />
        )}
      />
    </FormSection>
  );
};

export default PropertyDetailsSection;
