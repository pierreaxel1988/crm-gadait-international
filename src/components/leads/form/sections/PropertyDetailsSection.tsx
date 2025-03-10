
import React from 'react';
import { Building, Building2, BedDouble, Eye, Package } from 'lucide-react';
import { LeadDetailed, PropertyType, ViewType, Amenity } from '@/types/lead';
import FormInput from '../FormInput';
import MultiSelectButtons from '../MultiSelectButtons';

interface PropertyDetailsSectionProps {
  formData: LeadDetailed;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleNumberChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleMultiSelectToggle: <T extends string>(name: keyof LeadDetailed, value: T) => void;
  propertyTypes: PropertyType[];
  viewTypes: ViewType[];
  amenities: Amenity[];
}

const PropertyDetailsSection = ({
  formData,
  handleInputChange,
  handleNumberChange,
  handleMultiSelectToggle,
  propertyTypes,
  viewTypes,
  amenities,
}: PropertyDetailsSectionProps) => {
  return (
    <div className="space-y-4">
      <FormInput
        label="Type de bien"
        name="propertyType"
        type="select"
        value={formData.propertyType || ''}
        onChange={handleInputChange}
        icon={Building}
        options={propertyTypes.map(type => ({ value: type, label: type }))}
        placeholder="Sélectionner un type"
      />

      <FormInput
        label="Surface habitable"
        name="livingArea"
        value={formData.livingArea || ''}
        onChange={handleInputChange}
        placeholder="ex: 200-300m²"
        icon={Building2}
      />

      <FormInput
        label="Nombre de chambres"
        name="bedrooms"
        type="number"
        value={formData.bedrooms || ''}
        onChange={handleNumberChange}
        min={0}
        icon={BedDouble}
      />

      <FormInput
        label="Vue souhaitée"
        name="views"
        value=""
        onChange={() => {}}
        icon={Eye}
        renderCustomField={() => (
          <MultiSelectButtons
            options={viewTypes}
            selectedValues={formData.views}
            onToggle={(value) => handleMultiSelectToggle('views', value)}
          />
        )}
      />

      <FormInput
        label="Prestations souhaitées"
        name="amenities"
        value=""
        onChange={() => {}}
        icon={Package}
        renderCustomField={() => (
          <MultiSelectButtons
            options={amenities}
            selectedValues={formData.amenities}
            onToggle={(value) => handleMultiSelectToggle('amenities', value)}
          />
        )}
      />
    </div>
  );
};

export default PropertyDetailsSection;
