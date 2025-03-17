
import React from 'react';
import { LeadDetailed, PropertyType, ViewType, Amenity, Country } from '@/types/lead';
import FormInput from '../FormInput';
import MultiSelectButtons from '../MultiSelectButtons';
import PropertyUrlField from '../PropertyUrlField';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { COUNTRIES } from '@/utils/countries';

interface PropertyDetailsSectionProps {
  formData: LeadDetailed;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleNumberChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleMultiSelectToggle: <T extends string>(name: keyof LeadDetailed, value: T) => void;
  propertyTypes: PropertyType[];
  viewTypes: ViewType[];
  amenities: Amenity[];
  onExtractUrl?: (url: string) => void;
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
  // Helper for the country select
  const handleCountryChange = (value: string) => {
    const syntheticEvent = {
      target: {
        name: 'country',
        value
      }
    } as React.ChangeEvent<HTMLSelectElement>;
    
    handleInputChange(syntheticEvent);
  };

  // Filter countries to only those we sell in (from LeadForm.tsx)
  const sellableCountries = COUNTRIES.filter(country => 
    ['Croatia', 'France', 'Greece', 'Maldives', 'Mauritius', 'Portugal', 
    'Seychelles', 'Spain', 'Switzerland', 'United Arab Emirates', 
    'United Kingdom', 'United States'].includes(country)
  );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-2 text-chocolate-dark">
        Détails de la propriété
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Référence propriété"
          name="propertyReference"
          value={formData.propertyReference || ''}
          onChange={handleInputChange}
          placeholder="REF-123456"
        />
      </div>
      
      <PropertyUrlField 
        url={formData.url} 
        onChange={handleInputChange}
        onExtract={onExtractUrl}
      />
      
      <div className="space-y-2">
        <label className="block text-sm font-medium mb-1">
          Pays recherché
        </label>
        <Select
          value={formData.country}
          onValueChange={handleCountryChange}
        >
          <SelectTrigger className="w-full luxury-input">
            <SelectValue placeholder="Sélectionner un pays" />
          </SelectTrigger>
          <SelectContent>
            {sellableCountries.map((country) => (
              <SelectItem key={country} value={country}>
                {country}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <FormInput
        label="Localisation souhaitée"
        name="desiredLocation"
        value={formData.desiredLocation || ''}
        onChange={handleInputChange}
        placeholder="Ex: Marbella, Costa del Sol"
      />
      
      <div>
        <label className="block text-sm font-medium mb-1">
          Type de propriété
        </label>
        <MultiSelectButtons
          options={propertyTypes}
          selectedValues={formData.propertyType ? [formData.propertyType] : []}
          onChange={(value) => {
            handleInputChange({
              target: { name: 'propertyType', value }
            } as React.ChangeEvent<HTMLInputElement>);
          }}
          singleSelect={true}
        />
      </div>
      
      <FormInput
        label="Nombre de chambres"
        name="bedrooms"
        value={formData.bedrooms || ''}
        onChange={handleNumberChange}
        type="number"
        min={0}
        max={20}
      />
      
      <div>
        <label className="block text-sm font-medium mb-1">
          Vue souhaitée
        </label>
        <MultiSelectButtons
          options={viewTypes}
          selectedValues={formData.views || []}
          onToggle={(value) => handleMultiSelectToggle('views', value as ViewType)}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">
          Équipements souhaités
        </label>
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
