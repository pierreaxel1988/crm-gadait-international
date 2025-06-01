import React, { useState, useRef, useEffect } from 'react';
import { LeadDetailed, PropertyType, ViewType, Amenity, PurchaseTimeframe, FinancingMethod, PropertyUse, Country, MauritiusRegion } from '@/types/lead';
import FormSection from './FormSection';
import PropertyDetailsSection from './sections/PropertyDetailsSection';
import PurchaseDetailsSection from './sections/PurchaseDetailsSection';
import BuyerInfoSection from './sections/BuyerInfoSection';
import { deriveNationalityFromCountry } from '@/components/chat/utils/nationalityUtils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import MultiSelectButtons from '../../leads/form/MultiSelectButtons';
import { MapPin, Search, ChevronDown, X } from 'lucide-react';
import { countryToFlag } from '@/utils/countryUtils';
import { ALL_COUNTRIES } from '@/utils/countries';

interface SearchCriteriaSectionProps {
  formData: LeadDetailed;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleNumberChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleMultiSelectToggle: <T extends string>(name: keyof LeadDetailed, value: T) => void;
  propertyTypes: PropertyType[];
  viewTypes: ViewType[];
  amenities: Amenity[];
  purchaseTimeframes: PurchaseTimeframe[];
  financingMethods: FinancingMethod[];
  propertyUses: PropertyUse[];
  onExtractUrl?: (url: string) => void;
  extractLoading?: boolean;
  countries: Country[];
  handleCountryChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

const MAURITIUS_REGIONS: MauritiusRegion[] = ['North', 'South', 'West', 'East'];

const SearchCriteriaSection = ({
  formData,
  handleInputChange,
  handleNumberChange,
  handleMultiSelectToggle,
  propertyTypes,
  viewTypes,
  amenities,
  purchaseTimeframes,
  financingMethods,
  propertyUses,
  onExtractUrl,
  extractLoading = false,
  countries,
  handleCountryChange
}: SearchCriteriaSectionProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const countryDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
        setIsCountryDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCountryChangeWithNationality = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    handleCountryChange(e);
    
    if (!formData.nationality) {
      const selectedCountry = e.target.value;
      const nationality = deriveNationalityFromCountry(selectedCountry);
      
      if (nationality) {
        const nationalityEvent = {
          target: {
            name: 'nationality',
            value: nationality
          }
        } as React.ChangeEvent<HTMLInputElement>;
        
        handleInputChange(nationalityEvent);
      }
    }
  };

  const filteredCountries = searchTerm
    ? ALL_COUNTRIES.filter(country => 
        country.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : ALL_COUNTRIES;

  const handleCountrySelect = (country: string) => {
    const event = {
      target: {
        name: 'country',
        value: country
      }
    } as React.ChangeEvent<HTMLInputElement>;
    handleCountryChangeWithNationality(event);
    setIsCountryDropdownOpen(false);
    setSearchTerm('');
  };
  
  return (
    <FormSection title="Critères de Recherche">
      <ScrollArea className="h-[calc(100vh-350px)] pr-4">
        <div className="space-y-6">
          {/* Pays recherché */}
          <div className="space-y-3" ref={countryDropdownRef}>
            <Label className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4 text-loro-terracotta" />
              Pays recherché
            </Label>
            <div 
              className="flex items-center justify-between px-3 py-2 h-10 w-full border border-gray-300 rounded-lg bg-background text-sm cursor-pointer focus:ring-2 focus:ring-loro-terracotta focus:border-transparent"
              onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
            >
              {formData.country ? (
                <div className="flex items-center gap-2">
                  <span className="text-lg">{countryToFlag(formData.country)}</span>
                  <span>{formData.country}</span>
                </div>
              ) : (
                <span className="text-muted-foreground">Sélectionner un pays</span>
              )}
              <ChevronDown className={`h-4 w-4 transition-transform ${isCountryDropdownOpen ? 'rotate-180' : ''}`} />
            </div>
            
            {isCountryDropdownOpen && (
              <div className="absolute z-50 mt-1 w-full bg-background border rounded-md shadow-lg">
                <div className="sticky top-0 p-2 bg-background border-b">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Rechercher un pays..."
                      className="pl-8 h-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                    />
                    {searchTerm && (
                      <button
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSearchTerm('');
                        }}
                      >
                        <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="max-h-60 overflow-auto p-1">
                  {filteredCountries.map(country => (
                    <div
                      key={country}
                      className={`flex items-center px-4 py-2 hover:bg-accent rounded-sm cursor-pointer ${formData.country === country ? 'bg-accent/50' : ''}`}
                      onClick={() => handleCountrySelect(country)}
                    >
                      <span className="text-lg mr-2">{countryToFlag(country)}</span>
                      <span>{country}</span>
                    </div>
                  ))}
                  
                  {filteredCountries.length === 0 && (
                    <div className="px-4 py-2 text-sm text-muted-foreground">
                      Aucun résultat
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <Tabs defaultValue="property" className="w-full">
            <TabsList className="w-full mb-4 grid grid-cols-3">
              <TabsTrigger value="property">Propriété</TabsTrigger>
              <TabsTrigger value="purchase">Achat</TabsTrigger>
              <TabsTrigger value="buyer">Acheteur</TabsTrigger>
            </TabsList>
            
            <TabsContent value="property" className="space-y-6">
              <PropertyDetailsSection
                formData={{
                  propertyTypes: formData.propertyTypes as PropertyType[],
                  views: formData.views as ViewType[],
                  amenities: formData.amenities as Amenity[],
                  country: formData.country,
                  desiredLocation: formData.desiredLocation,
                  url: formData.url,
                  livingArea: formData.livingArea,
                  landArea: formData.landArea
                }}
                handleInputChange={handleInputChange}
                handleMultiSelectToggle={(name, value) => {
                  handleMultiSelectToggle(name as keyof LeadDetailed, value as any);
                }}
                propertyTypes={propertyTypes}
                viewTypes={viewTypes}
                amenities={amenities}
                onExtractUrl={onExtractUrl}
                extractLoading={extractLoading}
                handleCountryChange={(value) => {
                  const syntheticEvent = {
                    target: {
                      name: 'country',
                      value
                    }
                  } as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;
                  handleCountryChangeWithNationality(syntheticEvent);
                }}
              />
              {formData.country === 'Mauritius' && (
                <div className="space-y-2">
                  <Label className="text-sm">Régions souhaitées</Label>
                  <MultiSelectButtons 
                    options={MAURITIUS_REGIONS} 
                    selectedValues={formData.regions || []} 
                    onToggle={region => {
                      const updatedRegions = formData.regions ? [...formData.regions] : [];
                      if (updatedRegions.includes(region as MauritiusRegion)) {
                        handleMultiSelectToggle('regions', region as MauritiusRegion);
                      } else {
                        handleMultiSelectToggle('regions', region as MauritiusRegion);
                      }
                    }} 
                  />
                </div>
              )}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Pin Location
                  </Label>
                  <Input
                    name="mapCoordinates"
                    value={formData.mapCoordinates || ''}
                    onChange={handleInputChange}
                    placeholder="Collez le lien Google Maps ici"
                    className="font-futura"
                  />
                  <p className="text-xs text-muted-foreground">
                    Copiez-collez le lien Google Maps de la propriété
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="purchase" className="space-y-6 py-2">
              <PurchaseDetailsSection
                formData={formData}
                handleInputChange={handleInputChange}
                handleMultiSelectToggle={handleMultiSelectToggle}
                purchaseTimeframes={purchaseTimeframes}
                financingMethods={financingMethods}
                propertyUses={propertyUses}
              />
            </TabsContent>
            
            <TabsContent value="buyer" className="space-y-6 py-2">
              <BuyerInfoSection
                formData={formData}
                handleInputChange={handleInputChange}
              />
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </FormSection>
  );
};

export default SearchCriteriaSection;
