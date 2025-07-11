import React from 'react';
import { LeadDetailed, Currency, PropertyType, ViewType, PurchaseTimeframe, FinancingMethod, PropertyUse } from '@/types/lead';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Camera, MapPin, Home, Bed, Compass, Building, Clock, CreditCard, Star, Waves, Mountain, TreePine, MoreHorizontal, Droplets, DoorClosed, Car, Shield, Snowflake, Crown, Building2, Warehouse } from 'lucide-react';
import LocationFilter from '@/components/pipeline/filters/LocationFilter';
import BudgetFilter from '@/components/pipeline/filters/BudgetFilter';
import StyledSelect from './StyledSelect';
import CountrySelectModal from './CountrySelectModal';
import SuggestedPropertiesSection from './SuggestedPropertiesSection';

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
    const updatedTypes = currentTypes.includes(propertyType) 
      ? currentTypes.filter(type => type !== propertyType) 
      : [...currentTypes, propertyType];
    
    console.log('🏠 Property Type Change:', {
      clicked: propertyType,
      before: currentTypes,
      after: updatedTypes,
      leadId: lead.id
    });
    
    onDataChange({ propertyTypes: updatedTypes as PropertyType[] });
  };
  
  const handleBedroomToggle = (value: number) => {
    console.log('🛏️ Bedrooms Change:', {
      clicked: value,
      before: lead.bedrooms,
      after: value === 0 ? undefined : value,
      leadId: lead.id
    });
    
    // 0 = "Toutes" (pas de filtre), sinon c'est le minimum
    onDataChange({ bedrooms: value === 0 ? undefined : value });
  };
  
  const handleViewToggle = (view: string) => {
    const currentViews = lead.views || [];
    const updatedViews = currentViews.includes(view) 
      ? currentViews.filter(v => v !== view) 
      : [...currentViews, view];
    
    console.log('👀 Views Change:', {
      clicked: view,
      before: currentViews,
      after: updatedViews,
      leadId: lead.id
    });
    
    onDataChange({ views: updatedViews as ViewType[] });
  };
  
  const handleAmenityToggle = (amenity: string) => {
    const currentAmenities = lead.amenities || [];
    const updatedAmenities = currentAmenities.includes(amenity) 
      ? currentAmenities.filter(a => a !== amenity) 
      : [...currentAmenities, amenity];
    
    console.log('⭐ Amenities Change:', {
      clicked: amenity,
      before: currentAmenities,
      after: updatedAmenities,
      leadId: lead.id
    });
    
    onDataChange({ amenities: updatedAmenities });
  };
  
  const handleBudgetChange = (type: 'min' | 'max', value: string) => {
    if (type === 'min') {
      onDataChange({ budgetMin: value });
    } else {
      onDataChange({ budget: value });
    }
  };
  
  const handleCurrencyChange = (value: string) => {
    onDataChange({ currency: value as Currency });
  };
  
  const handleLocationChange = (location: string) => {
    onDataChange({ desiredLocation: location });
  };
  
  const getSelectedBedrooms = () => {
    // Migration de l'ancien format vers le nouveau format
    const bedrooms = lead.bedrooms;
    if (!bedrooms) return 0; // "Toutes"
    
    // Handle both number and number[] types (legacy compatibility)
    const bedroomValue = Array.isArray(bedrooms) ? bedrooms[0] : bedrooms;
    if (!bedroomValue) return 0; // "Toutes"
    
    if (bedroomValue >= 5) return 5; // "5+" pour toutes les valeurs >= 5 (ancien "8+", "7", "6", "5")
    return bedroomValue; // 1, 2, 3, 4 restent identiques
  };

  const getPropertyTypeIcon = (type: PropertyType) => {
    switch (type) {
      case "Villa":
        return Home;
      case "Appartement":
        return Building;
      case "Penthouse":
        return Crown;
      case "Maison":
        return Home;
      case "Duplex":
        return Building2;
      case "Chalet":
        return Mountain;
      case "Terrain":
        return TreePine;
      case "Manoir":
        return Crown;
      case "Maison de ville":
        return Building2;
      case "Château":
        return Crown;
      case "Local commercial":
        return Warehouse;
      default:
        return Home;
    }
  };

  const getViewIcon = (view: ViewType) => {
    switch (view) {
      case "Mer":
        return Waves;
      case "Montagne":
        return Mountain;
      case "Golf":
        return TreePine;
      case "Autres":
        return MoreHorizontal;
      default:
        return Compass;
    }
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity) {
      case "Piscine":
        return Droplets;
      case "Terrasse":
        return Building;
      case "Balcon":
        return DoorClosed;
      case "Jardin":
        return TreePine;
      case "Parking":
        return Car;
      case "Ascenseur":
        return Building;
      case "Sécurité":
        return Shield;
      case "Climatisation":
        return Snowflake;
      default:
        return Star;
    }
  };
  
  const propertyTypesList: PropertyType[] = ["Villa", "Appartement", "Penthouse", "Chalet", "Maison", "Duplex", "Terrain", "Manoir", "Maison de ville", "Château", "Local commercial"];
  const bedroomOptions = [0, 1, 2, 3, 4, 5];
  const viewTypesList: ViewType[] = ["Mer", "Montagne", "Golf", "Autres"];
  const amenitiesList = ["Piscine", "Terrasse", "Balcon", "Jardin", "Parking", "Ascenseur", "Sécurité", "Climatisation"];
  
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="country" className="text-sm font-medium flex items-center gap-2">
            <MapPin className="h-4 w-4 text-loro-terracotta" />
            Pays recherché
          </Label>
          <CountrySelectModal
            value={lead.country || ''}
            onChange={(value) => onDataChange({ country: value })}
            placeholder="Sélectionner un pays"
          />
        </div>

        <div className="space-y-2">
          <LocationFilter 
            location={lead.desiredLocation || ''} 
            onLocationChange={handleLocationChange}
            country={lead.country}
          />
        </div>

        <div className="pt-2">
          <BudgetFilter 
            minBudget={lead.budgetMin || ''} 
            maxBudget={lead.budget || ''} 
            onBudgetChange={handleBudgetChange} 
            currency={lead.currency as string || 'EUR'} 
            onCurrencyChange={handleCurrencyChange} 
          />
        </div>

        <div className="space-y-2 pt-2">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Building className="h-4 w-4 text-loro-terracotta" />
            Type de propriété
          </h4>
          <div className="flex flex-wrap gap-2">
            {propertyTypesList.map(type => (
              <Badge
                key={type}
                variant={(lead.propertyTypes || []).includes(type) ? "default" : "outline"}
                weight="normal"
                className={`cursor-pointer transition-all duration-200 font-futura ${
                  (lead.propertyTypes || []).includes(type)
                    ? 'bg-chocolate-dark text-white hover:bg-chocolate-dark/90'
                    : 'border-gray-300 text-gray-800 hover:bg-gray-100 hover:border-gray-400'
                }`}
                onClick={() => handlePropertyTypeChange(type)}
              >
                {type}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Bed className="h-4 w-4 text-loro-terracotta" />
            Nombre minimum de chambres
          </h4>
          <div className="flex flex-wrap gap-2">
            {bedroomOptions.map(option => (
              <button
                key={option}
                onClick={() => handleBedroomToggle(option)}
                className={`p-2 rounded text-center text-sm font-futura transition-all duration-200 ${
                  getSelectedBedrooms() === option
                    ? 'bg-chocolate-dark text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {option === 0 ? 'Toutes' : `${option}+`}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="livingArea" className="text-sm font-medium flex items-center gap-2">
            <Home className="h-4 w-4 text-loro-terracotta" />
            Surface habitable (m²)
          </Label>
          <Input
            id="livingArea"
            value={lead.livingArea || ''}
            onChange={e => onDataChange({ livingArea: e.target.value })}
            placeholder="Ex: 120"
            className="w-full font-futura"
          />
        </div>

        <div className="space-y-2 pt-2">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Camera className="h-4 w-4 text-loro-terracotta" />
            Vue souhaitée
          </h4>
          <div className="flex flex-wrap gap-2">
            {viewTypesList.map(view => {
              const IconComponent = getViewIcon(view);
              return (
                <Badge
                  key={view}
                  variant={(lead.views || []).includes(view) ? "default" : "outline"}
                  weight="normal"
                  className={`cursor-pointer transition-all duration-200 font-futura ${
                    (lead.views || []).includes(view)
                      ? 'bg-chocolate-dark text-white hover:bg-chocolate-dark/90'
                      : 'border-gray-300 text-gray-800 hover:bg-gray-100 hover:border-gray-400'
                  }`}
                  onClick={() => handleViewToggle(view)}
                >
                  <IconComponent className="h-4 w-4 mr-1" />
                  {view}
                </Badge>
              );
            })}
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Star className="h-4 w-4 text-loro-terracotta" />
            Commodités souhaitées
          </h4>
          <div className="flex flex-wrap gap-2">
            {amenitiesList.map(amenity => {
              const IconComponent = getAmenityIcon(amenity);
              return (
                <Badge
                  key={amenity}
                  variant={(lead.amenities || []).includes(amenity) ? "default" : "outline"}
                  weight="normal"
                  className={`cursor-pointer transition-all duration-200 font-futura ${
                    (lead.amenities || []).includes(amenity)
                      ? 'bg-chocolate-dark text-white hover:bg-chocolate-dark/90'
                      : 'border-gray-300 text-gray-800 hover:bg-gray-100 hover:border-gray-400'
                  }`}
                  onClick={() => handleAmenityToggle(amenity)}
                >
                  <IconComponent className="h-4 w-4 mr-1" />
                  {amenity}
                </Badge>
              );
            })}
          </div>
        </div>

        <div className="pt-2">
          <div className="space-y-2">
            <Label htmlFor="purchaseTimeframe" className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-loro-terracotta" />
              Délai d'acquisition
            </Label>
            <StyledSelect
              id="purchaseTimeframe"
              value={lead.purchaseTimeframe || ''}
              onChange={e =>
                onDataChange({
                  purchaseTimeframe: e.target.value as PurchaseTimeframe,
                })
              }
              placeholder="Sélectionner"
              options={[
                { value: 'Immédiat', label: 'Immédiat' },
                { value: '1-3 mois', label: '1-3 mois' },
                { value: '3-6 mois', label: '3-6 mois' },
                { value: '6-12 mois', label: '6-12 mois' },
                { value: '+12 mois', label: '+12 mois' },
              ]}
            />
          </div>
        </div>

        <div className="pt-2">
          <div className="space-y-2">
            <Label htmlFor="financingMethod" className="text-sm font-medium flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-loro-terracotta" />
              Mode de financement
            </Label>
            <StyledSelect
              id="financingMethod"
              value={lead.financingMethod || ''}
              onChange={e =>
                onDataChange({
                  financingMethod: e.target.value as FinancingMethod,
                })
              }
              placeholder="Sélectionner"
              options={[
                { value: 'Cash', label: 'Cash' },
                { value: 'Crédit', label: 'Crédit' },
                { value: 'Mixte', label: 'Mixte' },
              ]}
            />
          </div>
        </div>

        <div className="pt-2">
          <div className="space-y-2">
            <Label htmlFor="propertyUse" className="text-sm font-medium flex items-center gap-2">
              <Home className="h-4 w-4 text-loro-terracotta" />
              Utilisation prévue
            </Label>
            <StyledSelect
              id="propertyUse"
              value={lead.propertyUse || ''}
              onChange={e =>
                onDataChange({
                  propertyUse: e.target.value as PropertyUse,
                })
              }
              placeholder="Sélectionner"
              options={[
                { value: 'Résidence principale', label: 'Résidence principale' },
                { value: 'Résidence secondaire', label: 'Résidence secondaire' },
                { value: 'Investissement', label: 'Investissement' },
              ]}
            />
          </div>
        </div>
      </div>

      <SuggestedPropertiesSection lead={lead} />
    </div>
  );
};

export default BuyerCriteriaSection;
