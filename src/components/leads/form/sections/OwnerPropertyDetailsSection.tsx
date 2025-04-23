
import React from 'react';
import { LeadDetailed } from '@/types/lead';
import FormInput from '../FormInput';
import { Label } from '@/components/ui/label';
import LocationFilter from '@/components/pipeline/filters/LocationFilter';
import SmartSearch from '@/components/common/SmartSearch';
import { MapPin } from 'lucide-react';
import { COUNTRIES } from '@/utils/countries';
import { countryToFlag } from '@/utils/countryUtils';

interface OwnerPropertyDetailsSectionProps {
  formData: LeadDetailed;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleMultiSelectToggle: <T extends string>(name: keyof LeadDetailed, value: T) => void;
}

const OwnerPropertyDetailsSection = ({
  formData,
  handleInputChange,
  handleMultiSelectToggle
}: OwnerPropertyDetailsSectionProps) => {
  
  const handleLocationChange = (location: string) => {
    const syntheticEvent = {
      target: {
        name: 'desiredLocation',
        value: location
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    handleInputChange(syntheticEvent);
  };

  // Modified to ensure only valid countries are selected
  const handleSmartCountryChange = (country: string) => {
    // Only update if the selected country is in our predefined list
    if (COUNTRIES.includes(country)) {
      const syntheticEvent = {
        target: {
          name: 'country',
          value: country
        }
      } as React.ChangeEvent<HTMLSelectElement>;
      
      handleInputChange(syntheticEvent);
    }
  };

  // Get popular countries with their flags for better UI
  const popularCountries = [
    'France', 
    'Switzerland', 
    'Spain', 
    'Portugal', 
    'United Kingdom', 
    'United States', 
    'Mauritius', 
    'UAE'
  ];

  // Render country with flag emoji
  const renderCountryItem = (country: string) => (
    <div className="text-sm py-1 flex items-center gap-2">
      <span className="mr-1">{countryToFlag(country)}</span> {country}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-2">
          <MapPin className="h-4 w-4" /> Pays
        </Label>
        <SmartSearch
          placeholder="Sélectionnez un pays..."
          value={formData.country || ''}
          onChange={handleSmartCountryChange}
          results={COUNTRIES.filter(country => 
            country.toLowerCase().includes(formData.country?.toLowerCase() || '')
          ).slice(0, 10)}
          onSelect={handleSmartCountryChange}
          renderItem={renderCountryItem}
          className="w-full"
          inputClassName="h-9 text-sm"
          minChars={1}
          searchIcon={true}
          clearButton={true}
          emptyMessage="Aucun pays trouvé"
        />
      </div>

      <div className="space-y-2">
        <LocationFilter 
          location={formData.desiredLocation || ''} 
          onLocationChange={handleLocationChange} 
        />
      </div>
      
      <FormInput
        label="Surface habitable (m²)"
        name="livingArea"
        value={formData.livingArea || ''}
        onChange={handleInputChange}
        placeholder="Surface habitable approximative"
      />
      
      <FormInput
        label="Surface du terrain (m²)"
        name="landArea"
        value={formData.landArea || ''}
        onChange={handleInputChange}
        placeholder="Surface du terrain"
      />
      
      <FormInput
        label="Nombre de chambres"
        name="bedrooms"
        type="number"
        value={formData.bedrooms?.toString() || ''}
        onChange={handleInputChange}
        placeholder="Nombre de chambres"
      />

      <FormInput
        label="Nombre de salles de bain"
        name="bathrooms"
        type="number"
        value={formData.bathrooms?.toString() || ''}
        onChange={handleInputChange}
        placeholder="Nombre de salles de bain"
      />

    </div>
  );
};

export default OwnerPropertyDetailsSection;
