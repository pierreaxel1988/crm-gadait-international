import React, { useState, useRef, useEffect } from 'react';
import { LeadDetailed, PropertyType, ViewType, Amenity, PurchaseTimeframe, FinancingMethod, PropertyUse, Currency, AssetType, Equipment, MauritiusRegion } from '@/types/lead';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MultiSelectButtons from '@/components/leads/form/MultiSelectButtons';
import { LOCATIONS_BY_COUNTRY } from '@/utils/locationsByCountry';
import CustomTagInput from '@/components/leads/form/CustomTagInput';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { deriveNationalityFromCountry } from '@/components/chat/utils/nationalityUtils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import ActionButtons from '@/components/pipeline/filters/ActionButtons';
import { Home } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const PROPERTY_TYPES: PropertyType[] = ['Villa', 'Appartement', 'Penthouse', 'Maison', 'Duplex', 'Terrain', 'Chalet', 'Manoir', 'Maison de ville', 'Château', 'Local commercial', 'Commercial', 'Hotel', 'Vignoble', 'Autres'];
const VIEW_TYPES: ViewType[] = ['Mer', 'Montagne', 'Golf', 'Autres'];
const AMENITIES: Amenity[] = ['Piscine', 'Jardin', 'Garage', 'Sécurité', 'Climatisation', 'Terrasse', 'Balcon', 'Vue mer', 'Vue montagne', 'Gym', 'Spa', 'Piscine intérieure', 'Jacuzzi', 'Court de tennis', 'Ascenseur', 'Parking'];
const PURCHASE_TIMEFRAMES: PurchaseTimeframe[] = ['Moins de trois mois', 'Plus de trois mois'];
const FINANCING_METHODS: FinancingMethod[] = ['Cash', 'Prêt bancaire'];
const PROPERTY_USES: PropertyUse[] = ['Investissement locatif', 'Résidence principale'];
const CURRENCIES: Currency[] = ['EUR', 'USD', 'GBP', 'CHF', 'AED', 'MUR'];
const COUNTRIES = ['Croatia', 'France', 'Greece', 'Maldives', 'Mauritius', 'Portugal', 'Seychelles', 'Spain', 'Switzerland', 'UAE', 'UK', 'USA', 'Autre'];

const MAURITIUS_REGIONS: MauritiusRegion[] = ['North', 'South', 'West', 'East'];

const countryMatchesSearch = (country: string, searchTerm: string): boolean => {
  if (!searchTerm) return true;
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
      const filtered = options.filter(option => countryMatchesSearch(option, searchTerm));
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions(options);
    }
  }, [searchTerm, options]);

  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && inputRef.current && !inputRef.current.contains(event.target as Node)) {
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
      <Input ref={inputRef} id={label} value={searchTerm} onChange={handleInputChange} placeholder={placeholder || `Rechercher ${label}`} className="w-full font-futura" onFocus={() => setIsOpen(true)} />
      
      {isOpen && (
        <div ref={dropdownRef} className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg border max-h-64 overflow-y-auto">
          <div className="py-1 max-h-48 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(option => (
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
          
          <ActionButtons onClear={handleClear} onApply={handleApply} />
        </div>
      )}
    </div>
  );
};

const SearchCriteriaSection: React.FC<SearchCriteriaSectionProps> = ({
  lead,
  onDataChange
}) => {
  const [headerHeight, setHeaderHeight] = useState<number>(0);
  const [isHeaderMeasured, setIsHeaderMeasured] = useState(false);
  
  useEffect(() => {
    const measureHeader = () => {
      const headerElement = document.querySelector('.bg-loro-sand');
      if (headerElement) {
        const height = headerElement.getBoundingClientRect().height;
        setHeaderHeight(height);
        setIsHeaderMeasured(true);
      }
    };
    
    measureHeader();
    
    window.addEventListener('resize', measureHeader);
    
    const timeoutId = setTimeout(measureHeader, 300);
    
    return () => {
      window.removeEventListener('resize', measureHeader);
      clearTimeout(timeoutId);
    };
  }, []);

  const handleInputChange = (field: keyof LeadDetailed, value: any) => {
    onDataChange({
      [field]: value
    } as Partial<LeadDetailed>);
  };

  const getLocations = () => {
    if (!lead.country) return [];
    
    let countryKey = lead.country;
    if (lead.country === "USA" && !LOCATIONS_BY_COUNTRY["USA"]) {
      countryKey = "United States";
    } else if (lead.country === "United States" && !LOCATIONS_BY_COUNTRY["United States"]) {
      countryKey = "USA";
    }
    
    const locations = LOCATIONS_BY_COUNTRY[countryKey as keyof typeof LOCATIONS_BY_COUNTRY];
    if (locations) {
      return locations.map(location => ({
        value: location,
        label: location
      }));
    }
    return [];
  };

  const bedroomOptions = ["1", "2", "3", "4", "5", "6", "7", "8+"];
  
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

  const handleBedroomToggle = (value: string) => {
    const numValue = value === "8+" ? 8 : parseInt(value);
    let currentBedrooms = Array.isArray(lead.bedrooms) ? [...lead.bedrooms] : lead.bedrooms ? [lead.bedrooms] : [];
    const newBedrooms = currentBedrooms.includes(numValue) ? currentBedrooms.filter(b => b !== numValue) : [...currentBedrooms, numValue];
    handleInputChange('bedrooms', newBedrooms.length ? newBedrooms : undefined);
  };

  const handleCountryChange = (value: string) => {
    handleInputChange('country', value);
    if (!lead.nationality) {
      const nationality = deriveNationalityFromCountry(value);
      if (nationality) {
        handleInputChange('nationality', nationality);
      }
    }
  };

  const dynamicTopMargin = isHeaderMeasured 
    ? `${Math.max(headerHeight + 8, 32)}px` 
    : 'calc(32px + 4rem)';

  const handleAssetToggle = (value: AssetType) => {
    const updatedAssets = lead.assets ? [...lead.assets] : [];
    if (updatedAssets.includes(value)) {
      handleInputChange('assets', updatedAssets.filter(asset => asset !== value));
    } else {
      handleInputChange('assets', [...updatedAssets, value]);
    }
  };

  const handleEquipmentToggle = (value: Equipment) => {
    const updatedEquipment = lead.equipment ? [...lead.equipment] : [];
    if (updatedEquipment.includes(value)) {
      handleInputChange('equipment', updatedEquipment.filter(equipment => equipment !== value));
    } else {
      handleInputChange('equipment', [...updatedEquipment, value]);
    }
  };

  const ASSETS: { value: AssetType; icon: React.ComponentType }[] = [
    { value: "Vue mer", icon: Home },
    { value: "Vue panoramique", icon: Home },
    { value: "Bord de mer", icon: Home },
    { value: "Front de mer", icon: Home },
    { value: "Domaine de chasse", icon: Home },
    { value: "Écurie", icon: Home },
    { value: "Bien d'architecte", icon: Home },
    { value: "Style contemporain", icon: Home },
    { value: "Monument classé", icon: Home },
    { value: "Court de tennis", icon: Home },
    { value: "Pied des pistes", icon: Home },
    { value: "Proche montagne", icon: Home },
    { value: "Proche aéroport", icon: Home },
    { value: "Proche gare", icon: Home },
    { value: "Proche golf", icon: Home },
  ];

  const EQUIPMENT: { value: Equipment; icon: React.ComponentType }[] = [
    { value: "Piscine", icon: Home },
    { value: "Ascenseur", icon: Home },
    { value: "Garage & Parking", icon: Home },
    { value: "Climatisation", icon: Home },
    { value: "Salle de réception", icon: Home },
    { value: "Dépendances", icon: Home },
    { value: "Loge gardien", icon: Home },
    { value: "Spa", icon: Home },
    { value: "Viager", icon: Home },
    { value: "Terrasse", icon: Home },
    { value: "Jardin", icon: Home },
    { value: "Meublé", icon: Home },
    { value: "Cheminée", icon: Home },
    { value: "Maison d'amis", icon: Home },
    { value: "Bâtiments agricoles", icon: Home },
    { value: "Chambre de bonne", icon: Home },
    { value: "Accessible aux handicapés", icon: Home },
  ];

  return (
    <div 
      className="space-y-5 pt-4" 
      style={{ 
        marginTop: dynamicTopMargin,
      }}
    >
      <h2 className="text-sm font-futura uppercase tracking-wider text-gray-800 pb-2 border-b mb-4">Critères de Recherche</h2>
      
      <ScrollArea className="h-[calc(100vh-150px)]">
        <Tabs defaultValue="budget" className="w-full">
          <TabsList className="w-full grid grid-cols-4 mb-4">
            <TabsTrigger value="budget" className="text-xs">Budget</TabsTrigger>
            <TabsTrigger value="location" className="text-xs">Localisation</TabsTrigger>
            <TabsTrigger value="property" className="text-xs">Bien</TabsTrigger>
            <TabsTrigger value="purchase" className="text-xs">Achat</TabsTrigger>
          </TabsList>
          
          <TabsContent value="budget" className="space-y-4 py-2">
            {lead.pipelineType !== 'owners' && (
              <div className="space-y-2">
                <Label htmlFor="budgetMin" className="text-sm">Budget minimum</Label>
                <Input id="budgetMin" value={lead.budgetMin || ''} onChange={e => handleInputChange('budgetMin', e.target.value)} placeholder="Budget minimum" className="w-full font-futura" type="text" />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="budget" className="text-sm">
                {lead.pipelineType === 'owners' ? 'Prix souhaité' : 'Budget maximum'}
              </Label>
              <Input 
                id="budget" 
                value={lead.budget || ''} 
                onChange={e => handleInputChange('budget', e.target.value)} 
                placeholder={lead.pipelineType === 'owners' ? 'Prix souhaité' : 'Budget maximum'} 
                className="w-full font-futura" 
                type="text" 
              />
            </div>
            
            {lead.pipelineType === 'owners' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="commissionFee" className="text-sm">Honoraires (%)</Label>
                  <Input 
                    id="commissionFee" 
                    value={lead.commissionFee || ''} 
                    onChange={e => handleInputChange('commissionFee', e.target.value)} 
                    placeholder="Pourcentage de commission" 
                    className="w-full font-futura" 
                    type="number" 
                    min="0"
                    max="100"
                    step="0.5"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm">Meublé</Label>
                  <RadioGroup 
                    value={lead.isFurnished ? 'true' : 'false'} 
                    onValueChange={value => handleInputChange('isFurnished', value === 'true')}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="furnished-yes" />
                      <Label htmlFor="furnished-yes">Oui</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="furnished-no" />
                      <Label htmlFor="furnished-no">Non</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                {lead.isFurnished && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-sm">Prix inclus le mobilier</Label>
                      <RadioGroup 
                        value={lead.furnitureIncludedInPrice ? 'true' : 'false'} 
                        onValueChange={value => handleInputChange('furnitureIncludedInPrice', value === 'true')}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="true" id="furniture-included-yes" />
                          <Label htmlFor="furniture-included-yes">Oui</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="false" id="furniture-included-no" />
                          <Label htmlFor="furniture-included-no">Non</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    {!lead.furnitureIncludedInPrice && (
                      <div className="space-y-2">
                        <Label htmlFor="furniturePrice" className="text-sm">Prix du mobilier</Label>
                        <Input 
                          id="furniturePrice" 
                          value={lead.furniturePrice || ''} 
                          onChange={e => handleInputChange('furniturePrice', e.target.value)} 
                          placeholder="Prix du mobilier" 
                          className="w-full font-futura" 
                          type="text" 
                        />
                      </div>
                    )}
                  </>
                )}
              </>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="currency" className="text-sm">Devise</Label>
              <Select value={lead.currency || 'EUR'} onValueChange={value => handleInputChange('currency', value)}>
                <SelectTrigger id="currency" className="w-full font-futura">
                  <SelectValue placeholder="Sélectionner une devise" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map(currency => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="location" className="space-y-4 py-2">
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
                value={lead.desiredLocation || 'none'} 
                onValueChange={value => handleInputChange('desiredLocation', value === 'none' ? undefined : value)} 
                disabled={!lead.country}
              >
                <SelectTrigger id="desiredLocation" className="w-full font-futura">
                  <SelectValue placeholder="Sélectionner une localisation" />
                </SelectTrigger>
                <SelectContent searchable={true}>
                  <SelectItem value="none" className="font-futura">Aucune localisation</SelectItem>
                  {getLocations().map(location => (
                    <SelectItem key={location.value} value={location.value} className="font-futura">
                      {location.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {lead.country === 'Mauritius' && (
              <div className="space-y-2">
                <Label className="text-sm">Régions souhaitées</Label>
                <MultiSelectButtons 
                  options={MAURITIUS_REGIONS} 
                  selectedValues={lead.regions || []} 
                  onToggle={region => {
                    const updatedRegions = lead.regions ? [...lead.regions] : [];
                    if (updatedRegions.includes(region as MauritiusRegion)) {
                      handleInputChange('regions', updatedRegions.filter(r => r !== region));
                    } else {
                      handleInputChange('regions', [...updatedRegions, region as MauritiusRegion]);
                    }
                  }} 
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="property" className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-sm">Type de bien</Label>
              <MultiSelectButtons 
                options={PROPERTY_TYPES} 
                selectedValues={Array.isArray(lead.propertyTypes) ? lead.propertyTypes : []} 
                onChange={value => {
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
              <Label className="text-sm">Nombre de chambres</Label>
              <MultiSelectButtons 
                options={bedroomOptions} 
                selectedValues={getSelectedBedrooms()} 
                onChange={handleBedroomToggle} 
                specialOption="8+" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="livingArea" className="text-sm">Surface habitable (m²)</Label>
              <Input id="livingArea" value={lead.livingArea || ''} onChange={e => handleInputChange('livingArea', e.target.value)} placeholder="Surface en m²" className="w-full font-futura" type="text" />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm">Vue souhaitée</Label>
              <MultiSelectButtons options={VIEW_TYPES} selectedValues={lead.views || []} onToggle={value => {
                const updatedViews = lead.views ? [...lead.views] : [];
                if (updatedViews.includes(value as ViewType)) {
                  handleInputChange('views', updatedViews.filter(v => v !== value));
                } else {
                  handleInputChange('views', [...updatedViews, value as ViewType]);
                }
              }} />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm">Prestations souhaitées</Label>
              <CustomTagInput tags={lead.amenities || []} onChange={newTags => handleInputChange('amenities', newTags)} placeholder="Ajouter une commodité..." predefinedOptions={AMENITIES} />
            </div>
            
            {lead.pipelineType === 'owners' && (
              <>
                <div className="space-y-2">
                  <Label className="text-sm">Surface habitable (m²)</Label>
                  <Input 
                    id="livingArea" 
                    value={lead.livingArea || ''} 
                    onChange={e => handleInputChange('livingArea', e.target.value)} 
                    placeholder="Surface en m²" 
                    className="w-full font-futura" 
                    type="text" 
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Surface du terrain (m²)</Label>
                  <Input 
                    id="landArea" 
                    value={lead.landArea || ''} 
                    onChange={e => handleInputChange('landArea', e.target.value)} 
                    placeholder="Surface du terrain" 
                    className="w-full font-futura" 
                    type="text" 
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Année de construction</Label>
                  <Input 
                    id="constructionYear" 
                    value={lead.constructionYear || ''} 
                    onChange={e => handleInputChange('constructionYear', e.target.value)} 
                    placeholder="Année de construction" 
                    className="w-full font-futura" 
                    type="number" 
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Nombre de places de parking</Label>
                  <Input 
                    id="parkingSpaces" 
                    value={lead.parkingSpaces?.toString() || ''} 
                    onChange={e => handleInputChange('parkingSpaces', e.target.value)} 
                    placeholder="Nombre de places" 
                    className="w-full font-futura" 
                    type="number" 
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Nombre d'étages</Label>
                  <Input 
                    id="floors" 
                    value={lead.floors?.toString() || ''} 
                    onChange={e => handleInputChange('floors', e.target.value)} 
                    placeholder="Nombre d'étages" 
                    className="w-full font-futura" 
                    type="number" 
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Orientation</Label>
                  <MultiSelectButtons 
                    options={["Nord", "Sud", "Est", "Ouest"]} 
                    selectedValues={lead.orientation || []} 
                    onToggle={value => {
                      const updatedOrientation = lead.orientation ? [...lead.orientation] : [];
                      if (updatedOrientation.includes(value)) {
                        handleInputChange('orientation', updatedOrientation.filter(o => o !== value));
                      } else {
                        handleInputChange('orientation', [...updatedOrientation, value]);
                      }
                    }} 
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Classe énergétique</Label>
                  <Input 
                    id="energyClass" 
                    value={lead.energyClass || ''} 
                    onChange={e => handleInputChange('energyClass', e.target.value)} 
                    placeholder="Ex: A, B, C..." 
                    className="w-full font-futura" 
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Taxes annuelles</Label>
                  <Input 
                    id="yearlyTaxes" 
                    value={lead.yearlyTaxes || ''} 
                    onChange={e => handleInputChange('yearlyTaxes', e.target.value)} 
                    placeholder="Montant des taxes annuelles" 
                    className="w-full font-futura" 
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Les atouts</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {ASSETS.map(({ value, icon: Icon }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleAssetToggle(value)}
                        className={`flex items-center gap-2 p-2 rounded-md text-sm transition-colors ${
                          lead.assets?.includes(value)
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {value}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Équipements</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {EQUIPMENT.map(({ value, icon: Icon }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleEquipmentToggle(value)}
                        className={`flex items-center gap-2 p-2 rounded-md text-sm transition-colors ${
                          lead.equipment?.includes(value)
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {value}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Description du bien</Label>
                  <Textarea
                    name="propertyDescription"
                    value={lead.propertyDescription || ''}
                    onChange={(e) => handleInputChange('propertyDescription', e.target.value)}
                    placeholder="Description détaillée du bien"
                    className="min-h-[150px] w-full font-futura"
                  />
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="purchase" className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-sm">Date d'achat souhaitée</Label>
              <RadioGroup value={lead.purchaseTimeframe || ''} onValueChange={value => handleInputChange('purchaseTimeframe', value)} className="flex flex-col space-y-2">
                {PURCHASE_TIMEFRAMES.map(timeframe => <div key={timeframe} className="flex items-center space-x-2">
                    <RadioGroupItem value={timeframe} id={`timeframe-${timeframe}`} />
                    <Label htmlFor={`timeframe-${timeframe}`} className="font-futura">
                      {timeframe}
                    </Label>
                  </div>)}
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm">Mode de financement</Label>
              <RadioGroup value={lead.financingMethod || ''} onValueChange={value => handleInputChange('financingMethod', value)} className="flex flex-col space-y-2">
                {FINANCING_METHODS.map(method => <div key={method} className="flex items-center space-x-2">
                    <RadioGroupItem value={method} id={`method-${method}`} />
                    <Label htmlFor={`method-${method}`} className="font-futura">
                      {method}
                    </Label>
                  </div>)}
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm">Objectif</Label>
              <RadioGroup value={lead.propertyUse || ''} onValueChange={value => handleInputChange('propertyUse', value)} className="flex flex-col space-y-2">
                {PROPERTY_USES.map(use => <div key={use} className="flex items-center space-x-2">
                    <RadioGroupItem value={use} id={`use-${use}`} />
                    <Label htmlFor={`use-${use}`} className="font-futura">
                      {use}
                    </Label>
                  </div>)}
              </RadioGroup>
            </div>
          </TabsContent>
        </Tabs>
      </ScrollArea>
    </div>
  );
};

export default SearchCriteriaSection;
