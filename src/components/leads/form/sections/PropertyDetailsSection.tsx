import React from 'react';
import { Hash, Home, Map, Maximize2, Users, Mountain, Building } from 'lucide-react';
import { LeadDetailed, PropertyType, ViewType, Amenity } from '@/types/lead';
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
    const numValue = value === '10+' ? 10 : parseInt(value);
    
    if (Array.isArray(formData.bedrooms)) {
      const bedroomsArray = [...formData.bedrooms];
      
      if (bedroomsArray.includes(numValue)) {
        const updatedBedrooms = bedroomsArray.filter(b => b !== numValue);
        updateBedrooms(updatedBedrooms.length > 0 ? updatedBedrooms : undefined);
      } else {
        updateBedrooms([...bedroomsArray, numValue]);
      }
    } else if (typeof formData.bedrooms === 'number') {
      if (formData.bedrooms === numValue) {
        updateBedrooms(undefined);
      } else {
        updateBedrooms([formData.bedrooms, numValue]);
      }
    } else {
      updateBedrooms(numValue);
    }
  };
  
  const updateBedrooms = (value: number | number[] | undefined) => {
    const syntheticEvent = {
      target: {
        name: 'bedrooms',
        value: value
      }
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    
    handleInputChange(syntheticEvent);
  };
  
  const getSelectedBedroomOptions = (): string[] => {
    if (!formData.bedrooms) {
      return [];
    }
    
    if (typeof formData.bedrooms === 'number') {
      return [formData.bedrooms >= 10 ? '10+' : formData.bedrooms.toString()];
    }
    
    if (Array.isArray(formData.bedrooms)) {
      return formData.bedrooms.map(b => b >= 10 ? '10+' : b.toString());
    }
    
    if (typeof formData.bedrooms === 'string') {
      try {
        const bedroomsString: string = formData.bedrooms;
        if (bedroomsString.includes('[')) {
          const parsedBedrooms = JSON.parse(bedroomsString);
          if (Array.isArray(parsedBedrooms)) {
            return parsedBedrooms.map((b: number) => b >= 10 ? '10+' : b.toString());
          }
        }
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
  
  const bedroomOptions = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10+'];
  
  const handleUrlUpdate = (url: string) => {
    const urlEvent = {
      target: {
        name: 'url',
        value: url
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    handleInputChange(urlEvent);
    
    if (url) {
      onExtractUrl(url);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium mb-4 text-loro-hazel">Détails du bien</h3>
      
      <PropertyUrlField 
        url={formData.url || ''}
        onChange={handleUrlUpdate}
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
        icon={Maximize2}
        placeholder="Surface en m²"
        min={0}
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
    </div>
  );
};

export default PropertyDetailsSection;
