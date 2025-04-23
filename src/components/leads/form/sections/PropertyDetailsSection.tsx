import React from 'react';
import { LeadDetailed, PropertyType, ViewType, Amenity, Country } from '@/types/lead';
import FormInput from '../FormInput';
import MultiSelectButtons from '../MultiSelectButtons';
import PropertyUrlField from '../PropertyUrlField';
import { LOCATIONS_BY_COUNTRY } from '@/utils/locationsByCountry';
import BudgetFilter from '@/components/pipeline/filters/BudgetFilter';
import CustomTagInput from '../CustomTagInput';
import OwnerPropertyDetailsSection from './OwnerPropertyDetailsSection';
import LocationFilter from '@/components/pipeline/filters/LocationFilter';
import SmartSearch from '@/components/common/SmartSearch';
import { Label } from '@/components/ui/label';

interface PropertyDetailsSectionProps {
  formData: LeadDetailed;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleNumberChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleMultiSelectToggle: <T extends string>(name: keyof LeadDetailed, value: T) => void;
  propertyTypes: PropertyType[];
  viewTypes: ViewType[];
  amenities: Amenity[];
  onExtractUrl?: (url: string) => void;
  extractLoading?: boolean;
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
  extractLoading = false,
  countries,
  handleCountryChange
}: PropertyDetailsSectionProps) => {
  if (formData.pipelineType === 'owners') {
    return (
      <OwnerPropertyDetailsSection
        formData={formData}
        handleInputChange={handleInputChange}
        handleMultiSelectToggle={handleMultiSelectToggle}
      />
    );
  }

  const handleLocationChange = (location: string) => {
    const syntheticEvent = {
      target: {
        name: 'desiredLocation',
        value: location
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    handleInputChange(syntheticEvent);
  };

  const handleSmartCountryChange = (country: string) => {
    const syntheticEvent = {
      target: {
        name: 'country',
        value: country
      }
    } as React.ChangeEvent<HTMLSelectElement>;
    
    handleCountryChange(syntheticEvent);
  };

  const bedroomOptions = ["1", "2", "3", "4", "5", "6", "7", "8+"];
  
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

  const handleExtractUrl = (url: string) => {
    if (onExtractUrl) {
      onExtractUrl(url);
    }
  };

  const getSelectedBedrooms = () => {
    if (!formData.bedrooms) return [];
    
    if (Array.isArray(formData.bedrooms)) {
      return formData.bedrooms.map(num => {
        return num >= 8 ? "8+" : num.toString();
      });
    }
    
    const value = formData.bedrooms;
    return [value >= 8 ? "8+" : value.toString()];
  };
  
  const handleBedroomToggle = (value: string) => {
    const numValue = value === "8+" ? 8 : parseInt(value);
    
    const currentBedrooms = Array.isArray(formData.bedrooms) 
      ? [...formData.bedrooms] 
      : formData.bedrooms ? [formData.bedrooms] : [];
    
    const newBedrooms = currentBedrooms.includes(numValue)
      ? currentBedrooms.filter(b => b !== numValue)
      : [...currentBedrooms, numValue];
    
    const syntheticEvent = {
      target: {
        name: 'bedrooms',
        value: newBedrooms.length ? newBedrooms : undefined
      }
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    
    handleInputChange(syntheticEvent);
    console.log("Updated bedrooms:", newBedrooms);
  };

  const handleBudgetChange = (type: 'min' | 'max', value: string) => {
    const fieldName = type === 'min' ? 'budgetMin' : 'budget';
    
    const syntheticEvent = {
      target: {
        name: fieldName,
        value: value
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    handleInputChange(syntheticEvent);
  };

  const handleCurrencyChange = (value: string) => {
    const syntheticEvent = {
      target: {
        name: 'currency',
        value
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    handleInputChange(syntheticEvent);
  };

  const handleAmenitiesChange = (newAmenities: string[]) => {
    const syntheticEvent = {
      target: {
        name: 'amenities',
        value: newAmenities
      }
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    
    handleInputChange(syntheticEvent);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange(e);
  };

  const handlePropertyTypeChange = (value: PropertyType) => {
    handleMultiSelectToggle('propertyTypes', value);
  };

  const handleViewTypeChange = (value: string) => {
    handleMultiSelectToggle('views', value as ViewType);
  };

  return (
    <div className="space-y-4">
      <PropertyUrlField 
        value={formData.url || ''} 
        onChange={handleUrlChange} 
        onExtract={handleExtractUrl}
        isLoading={extractLoading}
      />

      <div className="space-y-2">
        <Label className="text-sm font-medium">Pays recherché</Label>
        <SmartSearch
          placeholder="Sélectionnez un pays..."
          value={formData.country || ''}
          onChange={handleSmartCountryChange}
          results={countries}
          renderItem={(country) => <div className="text-sm py-1">{country}</div>}
          className="w-full"
          inputClassName="h-9 text-sm"
          minChars={1}
          searchIcon={true}
          clearButton={true}
        />
      </div>

      <div className="space-y-2">
        <LocationFilter 
          location={formData.desiredLocation || ''} 
          onLocationChange={handleLocationChange} 
        />
      </div>

      <div className="pt-2">
        <h4 className="text-sm font-medium mb-3">Type de propriété</h4>
        <MultiSelectButtons
          options={propertyTypes}
          selectedValues={Array.isArray(formData.propertyTypes) ? formData.propertyTypes : []}
          onChange={handlePropertyTypeChange}
        />
      </div>

      <div className="pt-2">
        <h4 className="text-sm font-medium mb-3">Nombre de chambres recherchées</h4>
        <MultiSelectButtons
          options={bedroomOptions}
          selectedValues={getSelectedBedrooms()}
          onChange={handleBedroomToggle}
          specialOption="8+"
        />
      </div>

      <FormInput
        label="Surface habitable (m²)"
        name="livingArea"
        value={formData.livingArea || ''}
        onChange={handleInputChange}
        placeholder="Surface habitable approximative"
      />

      <div className="pt-2">
        <BudgetFilter 
          minBudget={formData.budgetMin || ''}
          maxBudget={formData.budget || ''}
          onBudgetChange={handleBudgetChange}
          currency={formData.currency as string || 'EUR'}
          onCurrencyChange={handleCurrencyChange}
        />
      </div>

      <div className="pt-2">
        <h4 className="text-sm font-medium mb-3">Vue souhaitée</h4>
        <MultiSelectButtons
          options={viewTypes}
          selectedValues={formData.views || []}
          onChange={handleViewTypeChange}
        />
      </div>

      <div className="pt-2">
        <h4 className="text-sm font-medium mb-3">Commodités souhaitées</h4>
        <CustomTagInput
          tags={formData.amenities || []}
          onChange={handleAmenitiesChange}
          placeholder="Ajouter une commodité..."
          predefinedOptions={amenities}
        />
      </div>
    </div>
  );
};

export default PropertyDetailsSection;
