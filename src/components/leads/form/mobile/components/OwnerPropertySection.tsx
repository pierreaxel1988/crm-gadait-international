import React from 'react';
import { LeadDetailed, PropertyState } from '@/types/lead';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Building, 
  Compass, 
  Camera, 
  DoorClosed, 
  FileText, 
  Settings 
} from 'lucide-react';
import { getIcon, AllowedIconName } from '@/utils/icons';
import StyledSelect from './StyledSelect';

interface OwnerPropertySectionProps {
  lead: LeadDetailed;
  onDataChange: (data: Partial<LeadDetailed>) => void;
}

const OwnerPropertySection: React.FC<OwnerPropertySectionProps> = ({
  lead,
  onDataChange
}) => {
  const handleBedroomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numValue = value === '' ? undefined : Number(value);
    onDataChange({ bedrooms: numValue });
  };

  const handleMultipleChoice = (field: keyof LeadDetailed, value: string) => {
    const currentValues = lead[field] as string[] || [];
    const updated = currentValues.includes(value) 
      ? currentValues.filter(v => v !== value) 
      : [...currentValues, value];
    onDataChange({ [field]: updated });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-3">Caractéristiques essentielles</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="livingArea" className="text-sm">Surface habitable (m²)</Label>
            <Input 
              id="livingArea" 
              value={lead.livingArea || ''} 
              onChange={e => onDataChange({ livingArea: e.target.value })} 
              placeholder="Ex : 120 m²" 
              className="w-full font-futura" 
              type="text" 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="landArea" className="text-sm">Surface du terrain (m²)</Label>
            <Input 
              id="landArea" 
              value={lead.landArea || ''} 
              onChange={e => onDataChange({ landArea: e.target.value })} 
              placeholder="Ex : 500 m²" 
              className="w-full font-futura" 
              type="text" 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bedrooms" className="text-sm">Chambres</Label>
            <Input 
              id="bedrooms" 
              value={typeof lead.bedrooms === 'number' ? lead.bedrooms.toString() : ''} 
              onChange={handleBedroomChange} 
              placeholder="Ex : 3" 
              className="w-full font-futura" 
              type="number" 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bathrooms" className="text-sm">Salles de bain/douche</Label>
            <Input 
              id="bathrooms" 
              value={lead.bathrooms?.toString() || ''} 
              onChange={e => onDataChange({ 
                bathrooms: e.target.value ? Number(e.target.value) : undefined 
              })} 
              placeholder="Ex : 2" 
              className="w-full font-futura" 
              type="number" 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="propertyType" className="text-sm">Type de bien</Label>
            <StyledSelect
              id="propertyType"
              value={lead.propertyType || ''}
              onChange={e => onDataChange({ propertyType: e.target.value })}
              placeholder="Sélectionner un type"
              options={[
                { value: "Villa", label: "Villa" },
                { value: "Appartement", label: "Appartement" },
                { value: "Penthouse", label: "Penthouse" },
                { value: "Maison", label: "Maison" },
                { value: "Duplex", label: "Duplex" },
                { value: "Chalet", label: "Chalet" },
                { value: "Terrain", label: "Terrain" },
                { value: "Manoir", label: "Manoir" },
                { value: "Maison de ville", label: "Maison de ville" },
                { value: "Château", label: "Château" },
                { value: "Local commercial", label: "Local commercial" }
              ]}
              icon={<Building className="h-4 w-4" />}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="constructionYear" className="text-sm">Année de construction</Label>
            <Input 
              id="constructionYear" 
              value={lead.constructionYear || ''} 
              onChange={e => onDataChange({ constructionYear: e.target.value })} 
              placeholder="Ex : 1980" 
              className="w-full font-futura" 
              type="text" 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="propertyState" className="text-sm">État général</Label>
            <StyledSelect
              id="propertyState"
              value={lead.propertyState || ''}
              onChange={e => onDataChange({ propertyState: e.target.value as PropertyState })}
              placeholder="Sélectionner un état"
              options={[
                { value: "Neuf", label: "Neuf" },
                { value: "Bon état", label: "Bon état" },
                { value: "À rafraîchir", label: "À rafraîchir" },
                { value: "À rénover", label: "À rénover" },
                { value: "À reconstruire", label: "À reconstruire" }
              ]}
              icon={<Settings className="h-4 w-4" />}
            />
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
            <StyledSelect
              id="exposure"
              value={lead.exposure || ''}
              onChange={e => onDataChange({
                exposure: e.target.value
              })}
              placeholder="Sélectionner"
              options={[
                { value: "Très lumineux", label: "Très lumineux" },
                { value: "Lumineux", label: "Lumineux" },
                { value: "Peu lumineux", label: "Peu lumineux" },
                { value: "Sombre", label: "Sombre" }
              ]}
            />
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
    </div>
  );
};

export default OwnerPropertySection;
