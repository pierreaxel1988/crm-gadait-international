import React from 'react';
import { LeadDetailed, Currency, PropertyType, ViewType, PurchaseTimeframe, FinancingMethod, PropertyUse } from '@/types/lead';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Camera, MapPin, Home, Bed, Compass, Building, Clock, CreditCard, Star, Waves, Mountain, TreePine, MoreHorizontal, Droplets, DoorClosed, Car, Shield, Snowflake, Crown, Building2, Warehouse } from 'lucide-react';
import LocationFilter from '@/components/pipeline/filters/LocationFilter';
import BudgetFilter from '@/components/pipeline/filters/BudgetFilter';
import StyledSelect from './StyledSelect';
import CountrySelectModal from './CountrySelectModal';

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
  
  const handleBedroomToggle = (value: string) => {
    const numValue = value === "8+" ? 8 : parseInt(value);
    const currentBedrooms = lead.bedrooms;
    
    // Pour les buyers, on utilise une sélection simple (integer), pas multiple
    const newBedrooms = currentBedrooms === numValue ? undefined : numValue;
    
    console.log('🛏️ Bedrooms Change:', {
      clicked: value,
      numValue,
      before: currentBedrooms,
      after: newBedrooms,
      leadId: lead.id
    });
    
    onDataChange({ bedrooms: newBedrooms });
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
    if (!lead.bedrooms) return [];
    // Pour les buyers, on a une sélection simple (integer), pas un array
    const value = typeof lead.bedrooms === 'number' ? lead.bedrooms : lead.bedrooms[0];
    return [value >= 8 ? "8+" : value.toString()];
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
  const bedroomOptions = ["1", "2", "3", "4", "5", "6", "7", "8+"];
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
          <div className="grid grid-cols-2 gap-2">
            {propertyTypesList.map(type => {
              const IconComponent = getPropertyTypeIcon(type);
              return (
                <button
                  key={type}
                  onClick={() => handlePropertyTypeChange(type)}
                  className={`flex items-center justify-center gap-2 p-2 rounded text-sm ${
                    (lead.propertyTypes || []).includes(type)
                      ? 'bg-chocolate-dark text-white'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Bed className="h-4 w-4 text-loro-terracotta" />
            Nombre de chambres
          </h4>
          <div className="grid grid-cols-4 gap-2">
            {bedroomOptions.map(option => (
              <button
                key={option}
                onClick={() => handleBedroomToggle(option)}
                className={`p-2 rounded text-center text-sm ${
                  getSelectedBedrooms().includes(option)
                    ? 'bg-chocolate-dark text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {option}
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
          <div className="grid grid-cols-2 gap-2">
            {viewTypesList.map(view => {
              const IconComponent = getViewIcon(view);
              return (
                <button
                  key={view}
                  onClick={() => handleViewToggle(view)}
                  className={`flex items-center justify-center gap-2 p-2 rounded text-sm ${
                    (lead.views || []).includes(view)
                      ? 'bg-chocolate-dark text-white'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  {view}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Star className="h-4 w-4 text-loro-terracotta" />
            Commodités souhaitées
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {amenitiesList.map(amenity => {
              const IconComponent = getAmenityIcon(amenity);
              return (
                <button
                  key={amenity}
                  onClick={() => handleAmenityToggle(amenity)}
                  className={`flex items-center justify-center gap-2 p-2 rounded text-sm ${
                    (lead.amenities || []).includes(amenity)
                      ? 'bg-chocolate-dark text-white'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  {amenity}
                </button>
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
    </div>
  );
};

export default BuyerCriteriaSection;
