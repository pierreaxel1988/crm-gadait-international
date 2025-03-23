
import React from 'react';
import { LeadDetailed, PropertyType, ViewType, Amenity, Country } from '@/types/lead';
import FormInput from '../FormInput';
import MultiSelectButtons from '../MultiSelectButtons';
import PropertyUrlField from '../PropertyUrlField';
import { LOCATIONS_BY_COUNTRY } from '@/utils/locationsByCountry';
import BudgetFilter from '@/components/pipeline/filters/BudgetFilter';
import CustomTagInput from '../CustomTagInput';

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

  // Correctly handle the URL extraction
  const handleExtractUrl = (url: string) => {
    if (onExtractUrl) {
      onExtractUrl(url);
    }
  };

  // Convert bedroom numbers to strings for MultiSelectButtons
  const bedroomOptions = ["1", "2", "3", "4", "5", "6", "7", "8+"];
  
  // Convert bedrooms data for display in the MultiSelectButtons
  const getSelectedBedrooms = () => {
    if (!formData.bedrooms) return [];
    
    if (Array.isArray(formData.bedrooms)) {
      // Map bedrooms array to strings, handling special case for 8 and higher
      return formData.bedrooms.map(num => {
        return num >= 8 ? "8+" : num.toString();
      });
    }
    
    // Handle single value case
    return [formData.bedrooms >= 8 ? "8+" : formData.bedrooms.toString()];
  };
  
  // Handle bedroom selection
  const handleBedroomToggle = (value: string) => {
    const numValue = value === "8+" ? 8 : parseInt(value);
    
    // Get current bedrooms array or create one
    const currentBedrooms = Array.isArray(formData.bedrooms) 
      ? [...formData.bedrooms] 
      : formData.bedrooms ? [formData.bedrooms] : [];
    
    // Toggle the selected value
    const newBedrooms = currentBedrooms.includes(numValue)
      ? currentBedrooms.filter(b => b !== numValue)
      : [...currentBedrooms, numValue];
    
    // Create a properly typed synthetic event object
    const syntheticEvent = {
      target: {
        name: 'bedrooms',
        value: newBedrooms.length ? newBedrooms : undefined
      }
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    
    handleInputChange(syntheticEvent);
  };

  // Handle budget changes
  const handleBudgetChange = (type: 'min' | 'max', value: string) => {
    // Create field name based on type
    const fieldName = type === 'min' ? 'budgetMin' : 'budget';
    
    // Create a synthetic event to use with handleInputChange
    const syntheticEvent = {
      target: {
        name: fieldName,
        value: value
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    handleInputChange(syntheticEvent);
  };

  // Handle currency changes
  const handleCurrencyChange = (value: string) => {
    const syntheticEvent = {
      target: {
        name: 'currency',
        value
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    handleInputChange(syntheticEvent);
  };

  // Handle amenities changes
  const handleAmenitiesChange = (newAmenities: string[]) => {
    const syntheticEvent = {
      target: {
        name: 'amenities',
        value: newAmenities
      }
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    
    handleInputChange(syntheticEvent);
  };

  // Wrap handleInputChange for URL changes
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange(e);
  };

  return (
    <div className="space-y-6">
      <div className="bg-loro-white rounded-sm shadow-luxury p-5 border border-loro-pearl/30">
        <h3 className="text-loro-navy font-futura text-lg mb-4 border-b border-loro-pearl pb-2">Propriété</h3>
        <PropertyUrlField 
          value={formData.url || ''} 
          onChange={handleUrlChange} 
          onExtract={handleExtractUrl}
          isLoading={extractLoading}
        />
      </div>

      <div className="bg-loro-white rounded-sm shadow-luxury p-5 border border-loro-pearl/30">
        <h3 className="text-loro-navy font-futura text-lg mb-4 border-b border-loro-pearl pb-2">Localisation</h3>
        <div className="space-y-4">
          <FormInput
            label="Pays recherché"
            name="country"
            type="select"
            value={formData.country || ''}
            onChange={handleCountryChange}
            options={countries.map(country => ({ value: country, label: country }))}
            placeholder="Pays de recherche"
            className="font-futura"
          />

          <FormInput
            label="Localisation souhaitée"
            name="desiredLocation"
            type="select"
            value={formData.desiredLocation || ''}
            onChange={handleInputChange}
            options={getLocations()}
            placeholder="Localisation souhaitée"
            className="font-futura"
          />
        </div>
      </div>

      <div className="bg-loro-white rounded-sm shadow-luxury p-5 border border-loro-pearl/30">
        <h3 className="text-loro-navy font-futura text-lg mb-4 border-b border-loro-pearl pb-2">Type et caractéristiques</h3>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-3 font-futura text-loro-hazel">Type de propriété</h4>
            <MultiSelectButtons
              options={propertyTypes}
              selectedValues={Array.isArray(formData.propertyTypes) ? formData.propertyTypes : []}
              onChange={(value) => handleMultiSelectToggle('propertyTypes', value)}
              className="font-futura"
            />
          </div>

          <div>
            <h4 className="text-sm font-medium mb-3 font-futura text-loro-hazel">Nombre de chambres recherchées</h4>
            <MultiSelectButtons
              options={bedroomOptions}
              selectedValues={getSelectedBedrooms()}
              onChange={handleBedroomToggle}
              specialOption="8+"
              className="font-futura"
            />
          </div>

          <FormInput
            label="Surface habitable (m²)"
            name="livingArea"
            value={formData.livingArea || ''}
            onChange={handleInputChange}
            placeholder="Surface habitable approximative"
            className="font-futura"
          />
        </div>
      </div>

      <div className="bg-loro-white rounded-sm shadow-luxury p-5 border border-loro-pearl/30">
        <h3 className="text-loro-navy font-futura text-lg mb-4 border-b border-loro-pearl pb-2">Budget</h3>
        <BudgetFilter 
          minBudget={formData.budgetMin || ''}
          maxBudget={formData.budget || ''}
          onBudgetChange={handleBudgetChange}
          currency={formData.currency as string || 'EUR'}
          onCurrencyChange={handleCurrencyChange}
        />
      </div>

      <div className="bg-loro-white rounded-sm shadow-luxury p-5 border border-loro-pearl/30">
        <h3 className="text-loro-navy font-futura text-lg mb-4 border-b border-loro-pearl pb-2">Vue et commodités</h3>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-3 font-futura text-loro-hazel">Vue souhaitée</h4>
            <MultiSelectButtons
              options={viewTypes}
              selectedValues={formData.views || []}
              onChange={(value) => handleMultiSelectToggle('views', value)}
              className="font-futura"
            />
          </div>

          <div>
            <h4 className="text-sm font-medium mb-3 font-futura text-loro-hazel">Commodités souhaitées</h4>
            <CustomTagInput
              tags={formData.amenities || []}
              onChange={handleAmenitiesChange}
              placeholder="Ajouter une commodité..."
              predefinedOptions={amenities}
              className="font-futura"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailsSection;
