
import React, { useState, useRef, useEffect } from 'react';
import { LeadDetailed, PropertyType, ViewType, Amenity, PurchaseTimeframe, FinancingMethod, PropertyUse, Currency } from '@/types/lead';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MultiSelectButtons from '@/components/leads/form/MultiSelectButtons';
import { LOCATIONS_BY_COUNTRY } from '@/utils/locationsByCountry';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import CustomTagInput from '@/components/leads/form/CustomTagInput';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { deriveNationalityFromCountry } from '@/components/chat/utils/nationalityUtils';
import { COUNTRIES as ALL_COUNTRIES } from '@/utils/countries';
import ActionButtons from '@/components/pipeline/filters/ActionButtons';

const PROPERTY_TYPES: PropertyType[] = [
  'Villa', 'Appartement', 'Penthouse', 'Maison', 'Duplex', 
  'Terrain', 'Chalet', 'Manoir', 'Maison de ville', 'Château',
  'Local commercial', 'Commercial', 'Hotel', 'Vignoble', 'Autres'
];

const VIEW_TYPES: ViewType[] = ['Mer', 'Montagne', 'Golf', 'Autres'];
const AMENITIES: Amenity[] = ['Piscine', 'Jardin', 'Garage', 'Sécurité', 'Climatisation', 'Terrasse', 'Balcon', 'Vue mer', 'Vue montagne', 'Gym', 'Spa', 'Piscine intérieure', 'Jacuzzi', 'Court de tennis', 'Ascenseur', 'Parking'];
const PURCHASE_TIMEFRAMES: PurchaseTimeframe[] = ['Moins de trois mois', 'Plus de trois mois'];
const FINANCING_METHODS: FinancingMethod[] = ['Cash', 'Prêt bancaire'];
const PROPERTY_USES: PropertyUse[] = ['Investissement locatif', 'Résidence principale'];
const CURRENCIES: Currency[] = ['EUR', 'USD', 'GBP', 'CHF', 'AED', 'MUR'];
const COUNTRIES = [
  'Croatia', 'France', 'Greece', 'Maldives', 'Mauritius', 
  'Portugal', 'Seychelles', 'Spain', 'Switzerland', 'UAE', 'UK', 'USA', 'Autre'
];

// Helper function to match countries for search
const countryMatchesSearch = (country: string, searchTerm: string): boolean => {
  if (!searchTerm) return true;
  
  // Normalize strings by converting to lowercase and removing accents
  const normalizedCountry = country.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const normalizedSearch = searchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  return normalizedCountry.includes(normalizedSearch);
};

interface SearchCriteriaSectionProps {
  lead: LeadDetailed;
  onDataChange: (data: Partial<LeadDetailed>) => void;
}

interface SmartSearchFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
}

const SmartSearchField: React.FC<SmartSearchFieldProps> = ({ 
  label, 
  value, 
  onChange, 
  options, 
  placeholder 
}) => {
  const [searchTerm, setSearchTerm] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchTerm) {
      const filtered = options.filter(option => 
        countryMatchesSearch(option, searchTerm)
      );
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions(options);
    }
  }, [searchTerm, options]);

  useEffect(() => {
    // Update search term when value changes externally
    setSearchTerm(value);
  }, [value]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
  };

  const handleOptionClick = (option: string) => {
    onChange(option);
    setSearchTerm(option);
    setIsOpen(false);
  };

  const handleApply = () => {
    onChange(searchTerm);
    setIsOpen(false);
  };

  const handleClear = () => {
    setSearchTerm('');
    onChange('');
    setIsOpen(false);
  };

  return (
    <div className="space-y-2 relative">
      <Label htmlFor={label} className="text-sm">{label}</Label>
      <Input
        ref={inputRef}
        id={label}
        value={searchTerm}
        onChange={handleInputChange}
        placeholder={placeholder || `Rechercher ${label}`}
        className="w-full font-futura"
        onFocus={() => setIsOpen(true)}
      />
      
      {isOpen && (
        <div 
          ref={dropdownRef} 
          className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg border max-h-64 overflow-y-auto"
        >
          <div className="py-1 max-h-48 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option}
                  className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer font-futura"
                  onClick={() => handleOptionClick(option)}
                >
                  {option}
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-gray-500">
                Aucun résultat
              </div>
            )}
          </div>
          
          <ActionButtons 
            onClear={handleClear}
            onApply={handleApply}
          />
        </div>
      )}
    </div>
  );
};

const SearchCriteriaSection: React.FC<SearchCriteriaSectionProps> = ({ lead, onDataChange }) => {
  const handleInputChange = (field: keyof LeadDetailed, value: any) => {
    onDataChange({ [field]: value } as Partial<LeadDetailed>);
  };

  // Get locations based on selected country
  const getLocations = () => {
    if (!lead.country) return [];
    
    const locations = LOCATIONS_BY_COUNTRY[lead.country as keyof typeof LOCATIONS_BY_COUNTRY];
    if (locations) {
      return locations.map(location => ({
        value: location,
        label: location
      }));
    }
    
    return [];
  };

  // Convert bedroom numbers to strings for MultiSelectButtons
  const bedroomOptions = ["1", "2", "3", "4", "5", "6", "7", "8+"];
  
  // Function to convert bedrooms data for display in the MultiSelectButtons
  const getSelectedBedrooms = () => {
    if (!lead.bedrooms) return [];
    
    if (Array.isArray(lead.bedrooms)) {
      return lead.bedrooms.map(num => {
        return num >= 8 ? "8+" : num.toString();
      });
    }
    
    const value = lead.bedrooms;
    return [value >= 8 ? "8+" : value.toString()];
  };
  
  // Bedroom selection handler
  const handleBedroomToggle = (value: string) => {
    const numValue = value === "8+" ? 8 : parseInt(value);
    
    let currentBedrooms = Array.isArray(lead.bedrooms) 
      ? [...lead.bedrooms] 
      : lead.bedrooms ? [lead.bedrooms] : [];
    
    const newBedrooms = currentBedrooms.includes(numValue)
      ? currentBedrooms.filter(b => b !== numValue)
      : [...currentBedrooms, numValue];
    
    handleInputChange('bedrooms', newBedrooms.length ? newBedrooms : undefined);
  };

  // Handle nationality derivation when country changes
  const handleCountryChange = (value: string) => {
    handleInputChange('country', value);
    
    // If nationality is empty, try to derive it from country
    if (!lead.nationality) {
      const nationality = deriveNationalityFromCountry(value);
      if (nationality) {
        handleInputChange('nationality', nationality);
      }
    }
  };

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-medium text-loro-navy mb-4">Critères de Recherche</h2>
      
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="budget">
          <AccordionTrigger className="py-3 text-sm font-medium">Budget</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="budgetMin" className="text-sm">Budget minimum</Label>
                <Input
                  id="budgetMin"
                  value={lead.budgetMin || ''}
                  onChange={(e) => handleInputChange('budgetMin', e.target.value)}
                  placeholder="Budget minimum"
                  className="w-full font-futura"
                  type="text"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="budget" className="text-sm">Budget maximum</Label>
                <Input
                  id="budget"
                  value={lead.budget || ''}
                  onChange={(e) => handleInputChange('budget', e.target.value)}
                  placeholder="Budget maximum"
                  className="w-full font-futura"
                  type="text"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="currency" className="text-sm">Devise</Label>
                <Select
                  value={lead.currency || 'EUR'}
                  onValueChange={(value) => handleInputChange('currency', value)}
                >
                  <SelectTrigger id="currency" className="w-full font-futura">
                    <SelectValue placeholder="Sélectionner une devise" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((currency) => (
                      <SelectItem key={currency} value={currency} className="font-futura">
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="location">
          <AccordionTrigger className="py-3 text-sm font-medium">Localisation</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 py-2">
              <SmartSearchField
                label="Pays recherché"
                value={lead.country || ''}
                onChange={handleCountryChange}
                options={COUNTRIES}
                placeholder="Rechercher un pays"
              />
              
              <div className="space-y-2">
                <Label htmlFor="desiredLocation" className="text-sm">Localisation souhaitée</Label>
                <Select
                  value={lead.desiredLocation || ''}
                  onValueChange={(value) => handleInputChange('desiredLocation', value)}
                  disabled={!lead.country}
                >
                  <SelectTrigger id="desiredLocation" className="w-full font-futura">
                    <SelectValue placeholder="Sélectionner une localisation" />
                  </SelectTrigger>
                  <SelectContent searchable={true}>
                    {getLocations().map((location) => (
                      <SelectItem key={location.value} value={location.value} className="font-futura">
                        {location.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="property">
          <AccordionTrigger className="py-3 text-sm font-medium">Caractéristiques du bien</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label className="text-sm">Type de bien</Label>
                <MultiSelectButtons
                  options={PROPERTY_TYPES}
                  selectedValues={Array.isArray(lead.propertyTypes) ? lead.propertyTypes : []}
                  onToggle={(value) => {
                    const updatedTypes = Array.isArray(lead.propertyTypes) ? [...lead.propertyTypes] : [];
                    if (updatedTypes.includes(value as PropertyType)) {
                      handleInputChange('propertyTypes', updatedTypes.filter(t => t !== value));
                    } else {
                      handleInputChange('propertyTypes', [...updatedTypes, value as PropertyType]);
                    }
                  }}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="livingArea" className="text-sm">Surface habitable (m²)</Label>
                <Input
                  id="livingArea"
                  value={lead.livingArea || ''}
                  onChange={(e) => handleInputChange('livingArea', e.target.value)}
                  placeholder="Surface en m²"
                  className="w-full font-futura"
                  type="text"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm">Nombre de chambres</Label>
                <MultiSelectButtons
                  options={bedroomOptions}
                  selectedValues={getSelectedBedrooms()}
                  onChange={handleBedroomToggle}
                  specialOption="8+"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm">Vue souhaitée</Label>
                <MultiSelectButtons
                  options={VIEW_TYPES}
                  selectedValues={lead.views || []}
                  onToggle={(value) => {
                    const updatedViews = lead.views ? [...lead.views] : [];
                    if (updatedViews.includes(value as ViewType)) {
                      handleInputChange('views', updatedViews.filter(v => v !== value));
                    } else {
                      handleInputChange('views', [...updatedViews, value as ViewType]);
                    }
                  }}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm">Prestations souhaitées</Label>
                <CustomTagInput
                  tags={lead.amenities || []}
                  onChange={(newTags) => handleInputChange('amenities', newTags)}
                  placeholder="Ajouter une commodité..."
                  predefinedOptions={AMENITIES}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="purchase">
          <AccordionTrigger className="py-3 text-sm font-medium">Conditions d'achat</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label className="text-sm">Date d'achat souhaitée</Label>
                <RadioGroup 
                  value={lead.purchaseTimeframe || ''}
                  onValueChange={(value) => handleInputChange('purchaseTimeframe', value)}
                  className="flex flex-col space-y-2"
                >
                  {PURCHASE_TIMEFRAMES.map((timeframe) => (
                    <div key={timeframe} className="flex items-center space-x-2">
                      <RadioGroupItem value={timeframe} id={`timeframe-${timeframe}`} />
                      <Label htmlFor={`timeframe-${timeframe}`} className="font-futura">
                        {timeframe}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm">Mode de financement</Label>
                <RadioGroup 
                  value={lead.financingMethod || ''}
                  onValueChange={(value) => handleInputChange('financingMethod', value)}
                  className="flex flex-col space-y-2"
                >
                  {FINANCING_METHODS.map((method) => (
                    <div key={method} className="flex items-center space-x-2">
                      <RadioGroupItem value={method} id={`method-${method}`} />
                      <Label htmlFor={`method-${method}`} className="font-futura">
                        {method}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm">Objectif</Label>
                <RadioGroup 
                  value={lead.propertyUse || ''}
                  onValueChange={(value) => handleInputChange('propertyUse', value)}
                  className="flex flex-col space-y-2"
                >
                  {PROPERTY_USES.map((use) => (
                    <div key={use} className="flex items-center space-x-2">
                      <RadioGroupItem value={use} id={`use-${use}`} />
                      <Label htmlFor={`use-${use}`} className="font-futura">
                        {use}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="personal">
          <AccordionTrigger className="py-3 text-sm font-medium">Informations personnelles</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 py-2">
              <SmartSearchField
                label="Nationalité"
                value={lead.nationality || ''}
                onChange={(value) => handleInputChange('nationality', value)}
                options={ALL_COUNTRIES}
                placeholder="Rechercher une nationalité"
              />
              
              <SmartSearchField
                label="Résidence fiscale"
                value={lead.taxResidence || ''}
                onChange={(value) => handleInputChange('taxResidence', value)}
                options={ALL_COUNTRIES}
                placeholder="Rechercher une résidence fiscale"
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default SearchCriteriaSection;
