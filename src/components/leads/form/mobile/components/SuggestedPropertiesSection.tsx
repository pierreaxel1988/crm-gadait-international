import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LeadDetailed } from '@/types/lead';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, MapPin, Bed, Bath, Maximize2, ExternalLink, Star, Sparkles } from 'lucide-react';
import { countryToFlag } from '@/utils/countryUtils';

interface SuggestedPropertiesSectionProps {
  lead: LeadDetailed;
}

interface GadaitProperty {
  id: string;
  title: string;
  price?: number;
  currency?: string;
  location?: string;
  country?: string;
  property_type?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  area_unit?: string;
  main_image?: string;
  images?: string[];
  url: string;
  is_featured?: boolean;
}

const SuggestedPropertiesSection: React.FC<SuggestedPropertiesSectionProps> = ({ lead }) => {
  const [properties, setProperties] = useState<GadaitProperty[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSuggestedProperties();
  }, [lead.country, lead.desiredLocation, lead.propertyTypes, lead.budget, lead.bedrooms]);

  const fetchSuggestedProperties = async () => {
    if (!lead.country && !lead.desiredLocation && !lead.propertyTypes?.length) {
      setProperties([]);
      return;
    }

    setLoading(true);
    try {
      let query = supabase.from('gadait_properties').select('*');

      // Filter by country
      if (lead.country) {
        query = query.eq('country', lead.country);
      }

      // Filter by location
      if (lead.desiredLocation) {
        query = query.ilike('location', `%${lead.desiredLocation}%`);
      }

      // Filter by property types
      if (lead.propertyTypes && lead.propertyTypes.length > 0) {
        query = query.in('property_type', lead.propertyTypes);
      }

      // Filter by bedrooms (minimum) - limit to reasonable values
      if (lead.bedrooms) {
        const bedroomValue = Array.isArray(lead.bedrooms) ? lead.bedrooms[0] : lead.bedrooms;
        if (bedroomValue && bedroomValue > 0 && bedroomValue <= 10) {
          query = query.gte('bedrooms', bedroomValue);
        } else if (bedroomValue && bedroomValue > 10) {
          // For unrealistic values, search for properties with 5+ bedrooms instead
          query = query.gte('bedrooms', 5);
        }
      }

      // Filter by budget (maximum)
      if (lead.budget) {
        const budgetNumber = parseFloat(lead.budget.replace(/[^\d.-]/g, ''));
        if (!isNaN(budgetNumber)) {
          query = query.lte('price', budgetNumber);
        }
      }

      // Limit to 4 properties for grid display
      query = query.limit(4);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching suggested properties:', error);
        return;
      }

      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching suggested properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price?: number, currency?: string) => {
    if (!price) return 'Prix sur demande';
    
    const formattedPrice = new Intl.NumberFormat('fr-FR').format(price);
    const currencySymbol = currency === 'EUR' ? '€' : 
                          currency === 'USD' ? '$' : 
                          currency || '';
    
    return `${formattedPrice} ${currencySymbol}`;
  };

  const handlePropertyClick = (propertyId: string) => {
    navigate(`/properties/${propertyId}?returnTo=lead&leadId=${lead.id}`);
  };

  if (!lead.country && !lead.desiredLocation && !lead.propertyTypes?.length) {
    return null;
  }

  return (
    <div className="space-y-4 pt-6 border-t border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-loro-terracotta" />
        <h3 className="text-lg font-normal text-brown-700">
          Propriétés suggérées
        </h3>
        <Badge variant="outline" className="ml-auto font-light">
          {properties.length} bien{properties.length > 1 ? 's' : ''}
        </Badge>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-[4/3] bg-gray-200"></div>
              <CardContent className="p-5 space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : properties.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {properties.map((property) => (
            <Card 
              key={property.id} 
              className="group overflow-hidden hover:shadow-xl transition-all duration-500 border-loro-pearl bg-loro-white cursor-pointer hover:-translate-y-1 rounded-xl" 
              onClick={() => handlePropertyClick(property.id)}
            >
              {/* Image avec aspect ratio */}
              <div className="relative aspect-[4/3] overflow-hidden">
                {property.main_image ? (
                  <>
                    <img 
                      src={property.main_image} 
                      alt={property.title} 
                      className="w-full h-full object-cover transition-all duration-200 ease-out group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    
                    {/* Fallback pour images cassées */}
                    <div className="hidden absolute inset-0 bg-gradient-to-br from-loro-pearl to-loro-white flex items-center justify-center">
                      <Building2 className="h-16 w-16 text-loro-navy/30" />
                    </div>
                    
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                    
                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex gap-2">
                      {property.is_featured && (
                        <Badge className="bg-loro-sand/95 text-loro-navy font-futura shadow-lg backdrop-blur-sm">
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          Featured
                        </Badge>
                      )}
                      {property.property_type && (
                        <Badge variant="outline" className="bg-loro-white/95 text-loro-navy border-loro-pearl font-futura backdrop-blur-sm">
                          {property.property_type}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Prix */}
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-loro-white/90 text-loro-navy border-loro-pearl font-futura shadow-sm backdrop-blur-sm">
                        {formatPrice(property.price, property.currency)}
                      </Badge>
                    </div>
                    
                    {/* Caractéristiques en bas de l'image */}
                    <div className="absolute bottom-4 left-4 flex gap-2 flex-wrap">
                      <Badge variant="outline" className="bg-loro-white/90 text-loro-navy border-loro-pearl font-futura text-xs backdrop-blur-sm">
                        <Maximize2 className="h-3 w-3 mr-1" />
                        {property.area ? `${property.area} ${property.area_unit || 'm²'}` : 'N/A'}
                      </Badge>
                      <Badge variant="outline" className="bg-loro-white/90 text-loro-navy border-loro-pearl font-futura text-xs backdrop-blur-sm">
                        <Bed className="h-3 w-3 mr-1" />
                        {property.bedrooms || 'N/A'}
                      </Badge>
                      <Badge variant="outline" className="bg-loro-white/90 text-loro-navy border-loro-pearl font-futura text-xs backdrop-blur-sm">
                        <Bath className="h-3 w-3 mr-1" />
                        {property.bathrooms || 'N/A'}
                      </Badge>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-loro-pearl to-loro-white flex items-center justify-center">
                    <Building2 className="h-16 w-16 text-loro-navy/30" />
                  </div>
                )}
              </div>
              
              <CardContent className="p-5 space-y-4">
                {/* Titre et localisation */}
                <div className="space-y-2">
                  <h3 className="font-futura text-lg text-loro-navy line-clamp-2 transition-colors duration-300 font-medium">
                    {property.title}
                  </h3>
                  
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <MapPin className="h-4 w-4 text-loro-navy/60 flex-shrink-0" />
                      <span className="text-sm text-loro-navy/70 font-futura truncate">
                        {property.location || 'Localisation non spécifiée'}
                      </span>
                    </div>
                    
                    {property.country && property.country !== 'Non spécifié' && (
                      <Badge variant="outline" className="bg-loro-pearl/30 text-loro-navy border-loro-pearl font-futura text-xs">
                        <span className="mr-1">{countryToFlag(property.country)}</span>
                        {property.country}
                      </Badge>
                    )}
                  </div>
                </div>
                
                {/* CTA */}
                <Button 
                  variant="outline" 
                  className="w-full h-10 font-futura border-loro-sand text-loro-navy hover:bg-loro-sand hover:text-loro-navy hover:border-loro-hazel transition-all duration-300 hover:shadow-md" 
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(property.url, '_blank');
                  }}
                >
                  <ExternalLink className="h-4 w-4 mr-2 transition-transform group-hover:translate-x-1" />
                  Voir sur Gadait
                </Button>
              </CardContent>
            </Card>
          ))}
          
          {properties.length === 4 && (
            <div className="text-center pt-2 md:col-span-2">
              <Button variant="outline" size="sm" className="text-xs">
                Voir plus de propriétés
              </Button>
            </div>
          )}
        </div>
      ) : (
        <Card className="border-dashed border-2 border-gray-200">
          <CardContent className="p-6 text-center">
            <Building2 className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-600">
              Aucune propriété ne correspond aux critères actuels
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SuggestedPropertiesSection;