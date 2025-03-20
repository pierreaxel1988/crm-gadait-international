
import React from 'react';
import { LeadDetailed, PropertyType, ViewType, Amenity, Country } from '@/types/lead';
import FormInput from '../FormInput';
import { Hash, Euro, MapPin, Building, Bed, Eye, Sparkles, Flag } from 'lucide-react';
import MultiSelectButtons from '../MultiSelectButtons';
import PropertyUrlField from '../PropertyUrlField';
import { LOCATIONS_BY_COUNTRY } from '@/utils/locationsByCountry';

interface PropertyDetailsSectionProps {
  formData: LeadDetailed;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleNumberChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleMultiSelectToggle: <T extends string>(name: keyof LeadDetailed, value: T) => void;
  propertyTypes: PropertyType[];
  viewTypes: ViewType[];
  amenities: Amenity[];
  onExtractUrl: (url: string) => void;
  countries: Country[];
  handleCountryChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

const PropertyDetailsSection: React.FC<PropertyDetailsSectionProps> = ({
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
}) => {
  // Filter countries to only include those we have location data for
  const availableCountries = countries.filter(country => 
    Object.keys(LOCATIONS_BY_COUNTRY).includes(country)
  );

  // Get country flag emoji
  const getCountryFlag = (country: string): string => {
    const countryToFlag: Record<string, string> = {
      'Croatia': '🇭🇷',
      'France': '🇫🇷',
      'Greece': '🇬🇷',
      'Maldives': '🇲🇻',
      'Mauritius': '🇲🇺',
      'Portugal': '🇵🇹',
      'Seychelles': '🇸🇨',
      'Spain': '🇪🇸',
      'Switzerland': '🇨🇭',
      'United Arab Emirates': '🇦🇪',
      'United Kingdom': '🇬🇧',
      'United States': '🇺🇸'
    };
    
    return countryToFlag[country] || '';
  };
  
  // Get locations based on selected country
  const getLocationsForCountry = () => {
    if (formData.country && LOCATIONS_BY_COUNTRY[formData.country]) {
      return LOCATIONS_BY_COUNTRY[formData.country].map(location => ({
        value: location,
        label: location
      }));
    }
    return [];
  };

  return (
    <div className="space-y-4">
      <PropertyUrlField 
        value={formData.url || ''} 
        onChange={handleInputChange}
        onExtract={onExtractUrl} 
      />

      <FormInput
        label="Référence"
        name="propertyReference"
        value={formData.propertyReference || ''}
        onChange={handleInputChange}
        icon={Hash}
        placeholder="Référence de la propriété"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Budget"
          name="budget"
          value={formData.budget || ''}
          onChange={handleInputChange}
          icon={Euro}
          placeholder="Montant"
        />

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
      </div>

      <FormInput
        label="Pays recherché"
        name="country"
        type="select"
        value={formData.country || ''}
        onChange={handleCountryChange}
        icon={Flag}
        options={availableCountries.map(country => ({ 
          value: country, 
          label: `${getCountryFlag(country)} ${country}` 
        }))}
        placeholder="Pays de recherche"
      />

      <FormInput
        label="Localisation souhaitée"
        name="desiredLocation"
        type="select"
        value={formData.desiredLocation || ''}
        onChange={handleInputChange}
        icon={MapPin}
        options={getLocationsForCountry()}
        placeholder="Sélectionner une localisation"
        disabled={!formData.country}
      />

      <FormInput
        label="Nombre de chambres"
        name="bedrooms"
        type="number"
        value={formData.bedrooms || ''}
        onChange={handleNumberChange}
        icon={Bed}
        placeholder="Nombre de chambres"
        min={0}
      />

      <div>
        <div className="flex items-center mb-2">
          <Eye className="mr-2 h-4 w-4" />
          <span>Vue recherchée</span>
        </div>
        <MultiSelectButtons
          options={viewTypes}
          selectedValues={formData.views || []}
          onChange={(value) => handleMultiSelectToggle('views', value)}
        />
      </div>

      <div>
        <div className="flex items-center mb-2">
          <Sparkles className="mr-2 h-4 w-4" />
          <span>Équipements souhaités</span>
        </div>
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
