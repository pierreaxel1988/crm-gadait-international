import React, { useMemo } from 'react';
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

const LOCATIONS_BY_COUNTRY: Record<string, string[]> = {
  'France': ['Paris', 'Nice', 'Cannes', 'Saint-Tropez', 'Courchevel', 'Megève', 'Provence', 'Côte d\'Azur', 'Normandie', 'Alsace'],
  'Spain': ['Marbella', 'Ibiza', 'Barcelona', 'Madrid', 'Mallorca', 'Andalucía', 'Costa del Sol', 'Costa Brava', 'Tenerife', 'Valencia'],
  'Portugal': ['Algarve', 'Lisbonne', 'Porto', 'Cascais', 'Comporta', 'Madère', 'Silver Coast', 'Alentejo'],
  'Switzerland': ['Genève', 'Zürich', 'Gstaad', 'Verbier', 'St. Moritz', 'Zermatt', 'Lugano', 'Montreux'],
  'Croatia': ['Dubrovnik', 'Split', 'Hvar', 'Zagreb', 'Istrie', 'Opatija', 'Zadar'],
  'Greece': ['Athènes', 'Mykonos', 'Santorin', 'Crète', 'Corfou', 'Rhodes', 'Chalcidique'],
  'United Kingdom': ['Londres', 'Cotswolds', 'Édimbourg', 'Bath', 'Oxford', 'Cambridge', 'Lake District'],
  'United States': ['New York', 'Miami', 'Los Angeles', 'San Francisco', 'Aspen', 'Hamptons', 'Chicago', 'Boston'],
  'United Arab Emirates': ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ras Al Khaimah'],
  'Maldives': ['Malé', 'Atolls du Nord', 'Atolls du Sud'],
  'Mauritius': ['Grand Baie', 'Tamarin', 'Belle Mare', 'Le Morne', 'Flic en Flac'],
  'Seychelles': ['Mahé', 'Praslin', 'La Digue', 'Silhouette']
};

const BEDROOM_OPTIONS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10+'];

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
  const handleCountryChange = (value: string) => {
    const syntheticEvent = {
      target: {
        name: 'country',
        value
      }
    } as React.ChangeEvent<HTMLSelectElement>;
    
    handleInputChange(syntheticEvent);
    
    const resetLocationEvent = {
      target: {
        name: 'desiredLocation',
        value: ''
      }
    } as React.ChangeEvent<HTMLSelectElement>;
    
    handleInputChange(resetLocationEvent);
  };

  const sellableCountries = COUNTRIES.filter(country => 
    ['Croatia', 'France', 'Greece', 'Maldives', 'Mauritius', 'Portugal', 
    'Seychelles', 'Spain', 'Switzerland', 'United Arab Emirates', 
    'United Kingdom', 'United States'].includes(country)
  );
  
  const availableLocations = useMemo(() => {
    if (!formData.country) return [];
    return LOCATIONS_BY_COUNTRY[formData.country] || [];
  }, [formData.country]);

  const handleLocationChange = (value: string) => {
    const syntheticEvent = {
      target: {
        name: 'desiredLocation',
        value
      }
    } as React.ChangeEvent<HTMLSelectElement>;
    
    handleInputChange(syntheticEvent);
  };

  const handleBedroomToggle = (value: string) => {
    const numericValue = value === '10+' ? 10 : parseInt(value);
    
    const currentBedrooms = formData.bedrooms 
      ? (Array.isArray(formData.bedrooms) ? formData.bedrooms : [formData.bedrooms]) 
      : [];
      
    const updatedBedrooms = currentBedrooms.includes(numericValue)
      ? currentBedrooms.filter(b => b !== numericValue)
      : [...currentBedrooms, numericValue];
    
    const syntheticEvent = {
      target: {
        name: 'bedrooms',
        value: updatedBedrooms.length === 0 ? undefined : updatedBedrooms.sort((a, b) => Number(a) - Number(b))
      }
    };
    
    handleInputChange(syntheticEvent as unknown as React.ChangeEvent<HTMLInputElement>);
  };

  const getSelectedBedroomOptions = (): string[] => {
    if (!formData.bedrooms) return [];
    
    if (typeof formData.bedrooms === 'number') {
      return [formData.bedrooms >= 10 ? '10+' : formData.bedrooms.toString()];
    }
    
    if (Array.isArray(formData.bedrooms)) {
      return formData.bedrooms.map(b => b >= 10 ? '10+' : b.toString());
    }
    
    if (typeof formData.bedrooms === 'string' && formData.bedrooms.startsWith('[')) {
      try {
        const parsedBedrooms = JSON.parse(formData.bedrooms);
        if (Array.isArray(parsedBedrooms)) {
          return parsedBedrooms.map(b => b >= 10 ? '10+' : b.toString());
        }
      } catch (e) {
        console.error('Error parsing bedrooms string:', e);
      }
    }
    
    return [];
  };

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
      
      <div className="space-y-2">
        <label className="block text-sm font-medium mb-1">
          Localisation souhaitée
        </label>
        <Select
          value={formData.desiredLocation}
          onValueChange={handleLocationChange}
          disabled={!formData.country}
        >
          <SelectTrigger className="w-full luxury-input">
            <SelectValue placeholder={formData.country ? "Sélectionner une localisation" : "Choisissez d'abord un pays"} />
          </SelectTrigger>
          <SelectContent>
            {availableLocations.map((location) => (
              <SelectItem key={location} value={location}>
                {location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
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
      
      <div>
        <label className="block text-sm font-medium mb-1">
          Nombre de chambres
        </label>
        <MultiSelectButtons
          options={BEDROOM_OPTIONS}
          selectedValues={getSelectedBedroomOptions()}
          onToggle={handleBedroomToggle}
          singleSelect={false}
        />
      </div>
      
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
