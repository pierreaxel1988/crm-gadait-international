import React, { useState } from 'react';
import { LeadDetailed, Currency, PropertyState, PropertyType, ViewType, MauritiusRegion, PurchaseTimeframe, FinancingMethod, PropertyUse, Country } from '@/types/lead';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { MapPin, Bath, Building, Compass, Camera, Car, Fan, Bed, Sofa, Clock, DoorClosed, Star, Settings, FileText } from 'lucide-react';
import { getIcon, AllowedIconName } from '@/utils/icons';
import { ScrollArea } from '@/components/ui/scroll-area';
import MultiSelectButtons from '../../form/MultiSelectButtons';
import FormInput from '../../form/FormInput';
import BudgetFilter from '@/components/pipeline/filters/BudgetFilter';
import LocationFilter from '@/components/pipeline/filters/LocationFilter';

interface SearchCriteriaSectionProps {
  lead: LeadDetailed;
  onDataChange: (data: Partial<LeadDetailed>) => void;
}

const SearchCriteriaSection = ({
  lead,
  onDataChange
}: SearchCriteriaSectionProps) => {
  const [activeTab, setActiveTab] = useState('budget');
  
  const handleLocationChange = (location: string) => {
    onDataChange({
      desiredLocation: location
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-futura uppercase tracking-wider text-gray-800 pb-2 border-b mb-4">Critères de la Propriété</h2>
      
      {lead.pipelineType === 'owners' ? <div className="space-y-4">
          <Tabs defaultValue="budget" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-3 mb-4">
              <TabsTrigger value="budget">Prix</TabsTrigger>
              <TabsTrigger value="location">Localisation</TabsTrigger>
              <TabsTrigger value="property">Bien</TabsTrigger>
            </TabsList>
            
            <TabsContent value="budget" className="space-y-4">
              <OwnerPriceFields lead={lead} onDataChange={onDataChange} />
            </TabsContent>
            
            <TabsContent value="location" className="space-y-4">
              <OwnerLocationSection lead={lead} onDataChange={onDataChange} />
            </TabsContent>
            
            <TabsContent value="property" className="space-y-4">
              <OwnerPropertySection lead={lead} onDataChange={onDataChange} />
            </TabsContent>
          </Tabs>
        </div> : <ScrollArea className="h-[calc(100vh-270px)]">
          <BuyerCriteriaSection lead={lead} onDataChange={onDataChange} />
        </ScrollArea>}
    </div>
  );
};

interface OwnerPriceFieldsProps {
  lead: LeadDetailed;
  onDataChange: (data: Partial<LeadDetailed>) => void;
}

const OwnerPriceFields: React.FC<OwnerPriceFieldsProps> = ({
  lead,
  onDataChange
}) => {
  const handleFurnishedToggle = () => {
    const updatedFurnished = !lead.furnished;
    onDataChange({
      furnished: updatedFurnished,
      furniture_included_in_price: updatedFurnished ? true : undefined,
      furniture_price: updatedFurnished ? undefined : lead.furniture_price
    });
  };
  return <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="desired_price" className="text-sm">Prix souhaité</Label>
        <Input id="desired_price" value={lead.desired_price || ''} onChange={e => onDataChange({
        desired_price: e.target.value
      })} placeholder="Ex : 450 000" className="w-full font-futura" type="text" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="fees" className="text-sm">Honoraires</Label>
        <Input id="fees" value={lead.fees || ''} onChange={e => onDataChange({
        fees: e.target.value
      })} placeholder="Ex : 5%" className="w-full font-futura" type="text" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="currency" className="text-sm">Devise</Label>
        <select id="currency" value={lead.currency || 'EUR'} onChange={e => onDataChange({
        currency: e.target.value as Currency
      })} className="w-full p-2 border border-gray-300 rounded font-futura">
          <option value="EUR">EUR (€)</option>
          <option value="USD">USD ($)</option>
          <option value="GBP">GBP (£)</option>
          <option value="CHF">CHF (Fr)</option>
          <option value="AED">AED (د.إ)</option>
          <option value="MUR">MUR (₨)</option>
        </select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-3 pt-2">
          <Label htmlFor="furnished" className="text-sm">Meublé</Label>
          <Switch id="furnished" checked={!!lead.furnished} onCheckedChange={checked => {
          const updatedFurnished = !!checked;
          onDataChange({
            furnished: updatedFurnished,
            furniture_included_in_price: updatedFurnished ? true : undefined,
            furniture_price: updatedFurnished ? undefined : lead.furniture_price
          });
        }} />
          <span className="ml-2 text-xs font-futura">
            {lead.furnished ? 'Oui' : 'Non'}
          </span>
        </div>
      </div>

      {lead.furnished && <>
          <div className="space-y-2 mt-2">
            <Label htmlFor="furniture_included" className="text-sm">Mobilier inclus dans le prix</Label>
            <div className="flex items-center gap-3">
              <Switch id="furniture_included" checked={!!lead.furniture_included_in_price} onCheckedChange={checked => onDataChange({
            furniture_included_in_price: checked,
            furniture_price: checked ? undefined : lead.furniture_price
          })} />
              <span className="ml-2 text-xs font-futura">
                {lead.furniture_included_in_price ? 'Oui' : 'Non'}
              </span>
            </div>
          </div>

          {!lead.furniture_included_in_price && <div className="space-y-2 mt-2">
              <Label htmlFor="furniture_price" className="text-sm">Valorisation du mobilier</Label>
              <Input id="furniture_price" value={lead.furniture_price || ''} onChange={e => onDataChange({
          furniture_price: e.target.value
        })} placeholder="Ex : 45 000" className="w-full font-futura" type="text" />
            </div>}
        </>}
    </div>;
};

interface OwnerLocationSectionProps {
  lead: LeadDetailed;
  onDataChange: (data: Partial<LeadDetailed>) => void;
}

const OwnerLocationSection: React.FC<OwnerPriceFieldsProps> = ({
  lead,
  onDataChange
}) => {
  const handleLocationChange = (location: string) => {
    onDataChange({
      desiredLocation: location
    });
  };
  
  return <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="country" className="text-sm">Pays</Label>
        <select id="country" value={lead.country || ''} onChange={e => onDataChange({
        country: e.target.value
      })} className="w-full p-2 border border-gray-300 rounded font-futura">
          <option value="">Sélectionner un pays</option>
          <option value="France">France</option>
          <option value="Spain">Espagne</option>
          <option value="Portugal">Portugal</option>
          <option value="Italy">Italie</option>
          <option value="Switzerland">Suisse</option>
          <option value="Monaco">Monaco</option>
          <option value="Mauritius">Île Maurice</option>
          <option value="United States">United States</option>
          <option value="UAE">Émirats Arabes Unis</option>
        </select>
      </div>

      <div className="space-y-2">
        <LocationFilter 
          location={lead.desiredLocation || ''} 
          onLocationChange={handleLocationChange}
          country={lead.country}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location" className="text-sm">Adresse</Label>
        <Input 
          id="location" 
          value={lead.location || ''} 
          onChange={e => onDataChange({
            location: e.target.value
          })} 
          placeholder="Ex : 123 Avenue des Champs-Élysées" 
          className="w-full font-futura" 
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Pin Location
        </Label>
        <Input
          name="mapCoordinates"
          value={lead.mapCoordinates || ''}
          onChange={e => onDataChange({
            mapCoordinates: e.target.value
          })}
          placeholder="Collez le lien Google Maps ici"
          className="w-full font-futura"
        />
        <p className="text-xs text-muted-foreground">
          Copiez-collez le lien Google Maps de la propriété
        </p>
      </div>
    </div>;
};

const OwnerPropertySection: React.FC<OwnerPriceFieldsProps> = ({
  lead,
  onDataChange
}) => {
  const handleBedroomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numValue = value === '' ? undefined : Number(value);
    onDataChange({
      bedrooms: numValue
    });
  };
  const handleMultipleChoice = (field: keyof LeadDetailed, value: string) => {
    const currentValues = lead[field] as string[] || [];
    const updated = currentValues.includes(value) ? currentValues.filter(v => v !== value) : [...currentValues, value];
    onDataChange({
      [field]: updated
    });
  };
  return <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-3">Caractéristiques essentielles</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="livingArea" className="text-sm">Surface habitable (m²)</Label>
            <Input id="livingArea" value={lead.livingArea || ''} onChange={e => onDataChange({
            livingArea: e.target.value
          })} placeholder="Ex : 120 m²" className="w-full font-futura" type="text" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="landArea" className="text-sm">Surface du terrain (m²)</Label>
            <Input id="landArea" value={lead.landArea || ''} onChange={e => onDataChange({
            landArea: e.target.value
          })} placeholder="Ex : 500 m²" className="w-full font-futura" type="text" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bedrooms" className="text-sm">Chambres</Label>
            <Input id="bedrooms" value={typeof lead.bedrooms === 'number' ? lead.bedrooms.toString() : ''} onChange={handleBedroomChange} placeholder="Ex : 3" className="w-full font-futura" type="number" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bathrooms" className="text-sm">Salles de bain/douche</Label>
            <Input id="bathrooms" value={lead.bathrooms?.toString() || ''} onChange={e => onDataChange({
            bathrooms: e.target.value ? Number(e.target.value) : undefined
          })} placeholder="Ex : 2" className="w-full font-futura" type="number" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="propertyType" className="text-sm">Type de bien</Label>
            <select id="propertyType" value={lead.propertyType || ''} onChange={e => onDataChange({
            propertyType: e.target.value
          })} className="w-full p-2 border border-gray-300 rounded font-futura">
              <option value="">Sélectionner un type</option>
              <option value="Villa">Villa</option>
              <option value="Appartement">Appartement</option>
              <option value="Penthouse">Penthouse</option>
              <option value="Maison">Maison</option>
              <option value="Duplex">Duplex</option>
              <option value="Chalet">Chalet</option>
              <option value="Terrain">Terrain</option>
              <option value="Manoir">Manoir</option>
              <option value="Maison de ville">Maison de ville</option>
              <option value="Château">Château</option>
              <option value="Local commercial">Local commercial</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="constructionYear" className="text-sm">Année de construction</Label>
            <Input id="constructionYear" value={lead.constructionYear || ''} onChange={e => onDataChange({
            constructionYear: e.target.value
          })} placeholder="Ex : 1980" className="w-full font-futura" type="text" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="propertyState" className="text-sm">État général</Label>
            <select id="propertyState" value={lead.propertyState || ''} onChange={e => onDataChange({
            propertyState: e.target.value as PropertyState
          })} className="w-full p-2 border border-gray-300 rounded font-futura">
              <option value="">Sélectionner un état</option>
              <option value="Neuf">Neuf</option>
              <option value="Bon état">Bon état</option>
              <option value="À rafraîchir">À rafraîchir</option>
              <option value="À rénover">À rénover</option>
              <option value="À reconstruire">À reconstruire</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="floors" className="text-sm">Nombre d'étages</Label>
            <Input id="floors" value={lead.floors?.toString() || ''} onChange={e => onDataChange({
            floors: e.target.value ? Number(e.target.value) : undefined
          })} placeholder="Ex : 2" className="w-full font-futura" type="number" />
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Orientation</Label>
            <div className="grid grid-cols-2 gap-2">
              {['Nord', 'Sud', 'Est', 'Ouest'].map(direction => <button key={direction} type="button" onClick={() => handleMultipleChoice('orientation', direction)} className={`flex items-center justify-center gap-2 p-2 rounded-md text-sm transition-colors ${(lead.orientation || []).includes(direction) ? 'bg-primary text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}>
                  <Compass className="h-4 w-4" />
                  {direction}
                </button>)}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="energyClass" className="text-sm">Classe énergétique</Label>
            <Input id="energyClass" value={lead.energyClass || ''} onChange={e => onDataChange({
            energyClass: e.target.value
          })} placeholder="Ex: A, B, C..." className="w-full font-futura" type="text" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="parkingSpaces" className="text-sm">Places de stationnement/garage</Label>
            <Input id="parkingSpaces" value={lead.parkingSpaces?.toString() || ''} onChange={e => onDataChange({
            parkingSpaces: e.target.value ? Number(e.target.value) : undefined
          })} placeholder="Ex : 2" className="w-full font-futura" type="number" />
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-semibold mb-3">Éléments de valorisation pour le luxe</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm">Vue</Label>
            <div className="grid grid-cols-2 gap-2">
              {['Mer', 'Montagne', 'Ville', 'Panoramique', 'Jardin', 'Piscine'].map(view => <button key={view} type="button" onClick={() => handleMultipleChoice('views', view)} className={`flex items-center justify-center gap-2 p-2 rounded-md text-sm transition-colors ${(lead.views || []).includes(view) ? 'bg-primary text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}>
                  <Camera className="h-4 w-4" />
                  {view}
                </button>)}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="exposure" className="text-sm">Exposition/Luminosité</Label>
            <select id="exposure" value={lead.exposure || ''} onChange={e => onDataChange({
            exposure: e.target.value
          })} className="w-full p-2 border border-gray-300 rounded font-futura">
              <option value="">Sélectionner</option>
              <option value="Très lumineux">Très lumineux</option>
              <option value="Lumineux">Lumineux</option>
              <option value="Peu lumineux">Peu lumineux</option>
              <option value="Sombre">Sombre</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Espaces extérieurs</Label>
            <div className="grid grid-cols-1 gap-2">
              {[{
              name: 'Terrasse',
              field: 'hasTerrace'
            }, {
              name: 'Balcon',
              field: 'hasBalcony'
            }, {
              name: 'Jardin',
              field: 'hasGarden'
            }].map(item => <div key={item.field} className="flex items-center justify-between p-2 border rounded-md">
                  <span>{item.name}</span>
                  <Switch checked={!!lead[item.field as keyof LeadDetailed]} onCheckedChange={checked => onDataChange({
                [item.field]: checked
              })} />
                </div>)}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="terrace_size" className="text-sm">Surface terrasse (m²)</Label>
            <Input id="terrace_size" value={lead.terrace_size || ''} onChange={e => onDataChange({
            terrace_size: e.target.value
          })} placeholder="Ex : 30 m²" className="w-full font-futura" type="text" disabled={!lead.hasTerrace} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="garden_size" className="text-sm">Surface jardin (m²)</Label>
            <Input id="garden_size" value={lead.garden_size || ''} onChange={e => onDataChange({
            garden_size: e.target.value
          })} placeholder="Ex : 200 m²" className="w-full font-futura" type="text" disabled={!lead.hasGarden} />
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Prestations de luxe</Label>
            <div className="grid grid-cols-2 gap-2">
              {[{
              name: 'Piscine',
              icon: 'Home' as AllowedIconName
            }, {
              name: 'Spa',
              icon: 'Home' as AllowedIconName
            }, {
              name: 'Home cinéma',
              icon: 'Home' as AllowedIconName
            }, {
              name: 'Court de tennis',
              icon: 'Home' as AllowedIconName
            }, {
              name: 'Hammam',
              icon: 'Home' as AllowedIconName
            }, {
              name: 'Sauna',
              icon: 'Home' as AllowedIconName
            }].map(luxury => {
              const IconComponent = getIcon(luxury.icon);
              return <button key={luxury.name} type="button" onClick={() => handleMultipleChoice('luxuryAmenities', luxury.name)} className={`flex items-center gap-2 p-2 rounded-md text-sm transition-colors ${(lead.luxuryAmenities || []).includes(luxury.name) ? 'bg-primary text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}>
                    <IconComponent className="h-4 w-4" />
                    {luxury.name}
                  </button>;
            })}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Matériaux de construction</Label>
            <div className="grid grid-cols-2 gap-2">
              {['Pierre', 'Bois', 'Béton', 'Verre', 'Marbre', 'Acier'].map(material => <button key={material} type="button" onClick={() => handleMultipleChoice('buildingMaterials', material)} className={`flex items-center gap-2 p-2 rounded-md text-sm transition-colors ${(lead.buildingMaterials || []).includes(material) ? 'bg-primary text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}>
                  <Building className="h-4 w-4" />
                  {material}
                </button>)}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="architecturalStyle" className="text-sm">Caractéristiques architecturales</Label>
            <Input id="architecturalStyle" value={lead.architecturalStyle || ''} onChange={e => onDataChange({
            architecturalStyle: e.target.value
          })} placeholder="Ex : Style haussmannien" className="w-full font-futura" type="text" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="staffAccommodation" className="text-sm">Installations pour le personnel</Label>
            <Input id="staffAccommodation" value={lead.staffAccommodation || ''} onChange={e => onDataChange({
            staffAccommodation: e.target.value
          })} placeholder="Ex : Loge gardien, quartiers du personnel" className="w-full font-futura" type="text" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="receptionCapacity" className="text-sm">Espaces de réception (capacité)</Label>
            <Input id="receptionCapacity" value={lead.receptionCapacity || ''} onChange={e => onDataChange({
            receptionCapacity: e.target.value
          })} placeholder="Ex : 50 personnes" className="w-full font-futura" type="text" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sportFacilities" className="text-sm">Installations sportives</Label>
            <Textarea id="sportFacilities" value={lead.sportFacilities || ''} onChange={e => onDataChange({
            sportFacilities: e.target.value
          })} placeholder="Ex : Tennis, golf privé, salle de sport" className="w-full font-futura min-h-[80px]" />
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-semibold mb-3">Caractéristiques techniques</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm">Sécurité</Label>
            <div className="grid grid-cols-2 gap-2">
              {['Alarme', 'Gardien', 'Résidence sécurisée', 'Vidéosurveillance', 'Porte blindée'].map(security => <button key={security} type="button" onClick={() => handleMultipleChoice('securityFeatures', security)} className={`flex items-center gap-2 p-2 rounded-md text-sm transition-colors ${(lead.securityFeatures || []).includes(security) ? 'bg-primary text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}>
                  <DoorClosed className="h-4 w-4" />
                  {security}
                </button>)}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="homeAutomation" className="text-sm">Équipements domotiques</Label>
            <Textarea id="homeAutomation" value={lead.homeAutomation || ''} onChange={e => onDataChange({
            homeAutomation: e.target.value
          })} placeholder="Ex : Contrôle à distance, assistants vocaux" className="w-full font-futura min-h-[80px]" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="heatingSystem" className="text-sm">Chauffage/Climatisation</Label>
            <Input id="heatingSystem" value={lead.heatingSystem || ''} onChange={e => onDataChange({
            heatingSystem: e.target.value
          })} placeholder="Ex : Pompe à chaleur, climatisation réversible" className="w-full font-futura" type="text" />
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Installations écologiques</Label>
            <div className="grid grid-cols-2 gap-2">
              {['Panneaux solaires', 'Récupération eau', 'Isolation renforcée', 'Géothermie'].map(eco => <button key={eco} type="button" onClick={() => handleMultipleChoice('ecoFeatures', eco)} className={`flex items-center gap-2 p-2 rounded-md text-sm transition-colors ${(lead.ecoFeatures || []).includes(eco) ? 'bg-primary text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}>
                  <FileText className="h-4 w-4" />
                  {eco}
                </button>)}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accessibilityFeatures" className="text-sm">Accès PMR</Label>
            <div className="flex items-center gap-3">
              <Switch id="accessibilityFeatures" checked={!!lead.hasAccessibility} onCheckedChange={checked => onDataChange({
              hasAccessibility: checked
            })} />
              <span className="ml-2 text-xs font-futura">
                {lead.hasAccessibility ? 'Oui' : 'Non'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-semibold mb-3">Informations complémentaires</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dependencies" className="text-sm">Dépendances</Label>
            <Textarea id="dependencies" value={lead.dependencies || ''} onChange={e => onDataChange({
            dependencies: e.target.value
          })} placeholder="Ex : Maison d'invités, pool house, écuries" className="w-full font-futura min-h-[80px]" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="neighborhood" className="text-sm">Voisinage immédiat</Label>
            <Input id="neighborhood" value={lead.neighborhood || ''} onChange={e => onDataChange({
            neighborhood: e.target.value
          })} placeholder="Ex : Résidentiel calme" className="w-full font-futura" type="text" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="extensionPotential" className="text-sm">Potentiel d'extension</Label>
            <Input id="extensionPotential" value={lead.extensionPotential || ''} onChange={e => onDataChange({
            extensionPotential: e.target.value
          })} placeholder="Ex : +50m² possibles" className="w-full font-futura" type="text" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="historicalFeatures" className="text-sm">Éléments patrimoniaux</Label>
            <Input id="historicalFeatures" value={lead.historicalFeatures || ''} onChange={e => onDataChange({
            historicalFeatures: e.target.value
          })} placeholder="Ex : Monument classé" className="w-full font-futura" type="text" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="restrictions" className="text-sm">Restrictions</Label>
            <Input id="restrictions" value={lead.restrictions || ''} onChange={e => onDataChange({
            restrictions: e.target.value
          })} placeholder="Ex : Zone protégée" className="w-full font-futura" type="text" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="includedServices" className="text-sm">Services inclus</Label>
            <Input id="includedServices" value={lead.includedServices || ''} onChange={e => onDataChange({
            includedServices: e.target.value
          })} placeholder="Ex : Conciergerie, entretien" className="w-full font-futura" type="text" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nuisances" className="text-sm">Nuisances</Label>
            <Input id="nuisances" value={lead.nuisances || ''} onChange={e => onDataChange({
            nuisances: e.target.value
          })} placeholder="Ex : Absence ou présence" className="w-full font-futura" type="text" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="roofType" className="text-sm">Toiture (type et état)</Label>
            <Input id="roofType" value={lead.roofType || ''} onChange={e => onDataChange({
            roofType: e.target.value
          })} placeholder="Ex : Ardoise, bon état" className="w-full font-futura" type="text" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="wineStorage" className="text-sm">Cave à vin</Label>
            <div className="flex items-center gap-3">
              <Switch id="wineStorage" checked={!!lead.hasWineStorage} onCheckedChange={checked => onDataChange({
              hasWineStorage: checked
            })} />
              <span className="ml-2 text-xs font-futura">
                {lead.hasWineStorage ? 'Oui' : 'Non'}
              </span>
            </div>
            {lead.hasWineStorage && <Input id="wineStorageCapacity" value={lead.wineStorageCapacity || ''} onChange={e => onDataChange({
            wineStorageCapacity: e.target.value
          })} placeholder="Ex : Capacité 500 bouteilles" className="w-full font-futura mt-2" type="text" />}
          </div>

          <div className="space-y-2">
            <Label htmlFor="accessibility" className="text-sm">Accessibilité</Label>
            <Textarea id="accessibility" value={lead.accessibility || ''} onChange={e => onDataChange({
            accessibility: e.target.value
          })} placeholder="Ex : 15 min aéroport, 5 min commerces" className="w-full font-futura min-h-[80px]" />
          </div>
        </div>
      </div>
    </div>;
};

interface BuyerCriteriaSectionProps {
  lead: LeadDetailed;
  onDataChange: (data: Partial<LeadDetailed>) => void;
}

const BuyerCriteriaSection: React.FC<BuyerCriteriaSectionProps> = ({
  lead,
  onDataChange
}) => {
  const handlePropertyTypeChange = (propertyType: PropertyType) => {
    const currentTypes = lead.propertyTypes || [];
    const updatedTypes = currentTypes.includes(propertyType) ? currentTypes.filter(type => type !== propertyType) : [...currentTypes, propertyType];
    onDataChange({
      propertyTypes: updatedTypes as PropertyType[]
    });
  };
  
  const handleBedroomToggle = (value: string) => {
    const numValue = value === "8+" ? 8 : parseInt(value);
    const currentBedrooms = Array.isArray(lead.bedrooms) ? [...lead.bedrooms] : lead.bedrooms ? [lead.bedrooms] : [];
    const newBedrooms = currentBedrooms.includes(numValue) ? currentBedrooms.filter(b
