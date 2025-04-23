
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
    console.log('OwnerPropertyDetailsSection - Pays reçu:', country);
    
    // Only update if the selected country is in our predefined list
    if (COUNTRIES.includes(country)) {
      const syntheticEvent = {
        target: {
          name: 'country',
          value: country
        }
      } as React.ChangeEvent<HTMLSelectElement>;
      
      console.log('OwnerPropertyDetailsSection - Mise à jour du pays:', country);
      handleInputChange(syntheticEvent);
    } else {
      console.log('OwnerPropertyDetailsSection - Pays invalide ignoré:', country);
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

  // Filtre les pays en fonction de la recherche
  const filterCountries = () => {
    if (!formData.country) {
      return popularCountries; // Afficher les pays populaires si aucune recherche
    }
    
    const searchTerm = formData.country.toLowerCase();
    
    return COUNTRIES.filter(country => 
      country.toLowerCase().includes(searchTerm)
    ).slice(0, 10);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-2">
          <MapPin className="h-4 w-4" /> Pays
        </Label>
        <SmartSearch
          placeholder="Sélectionnez un pays..."
          value={formData.country || ''}
          onChange={(value) => {
            const syntheticEvent = {
              target: {
                name: 'country',
                value: value
              }
            } as React.ChangeEvent<HTMLInputElement>;
            
            handleInputChange(syntheticEvent);
          }}
          results={filterCountries()}
          onSelect={handleSmartCountryChange}
          renderItem={renderCountryItem}
          className="w-full"
          inputClassName="h-9 text-sm"
          minChars={0}
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
