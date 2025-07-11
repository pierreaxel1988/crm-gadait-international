import React, { useEffect, useState } from 'react';
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

      // Limit to 6 properties for mobile display
      query = query.limit(6);

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
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : properties.length > 0 ? (
        <div className="space-y-4">
          {properties.map((property) => (
            <Card key={property.id} className="overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  {property.main_image && (
                    <div className="flex-shrink-0">
                      <img
                        src={property.main_image}
                        alt={property.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900 truncate pr-2">
                        {property.title}
                      </h4>
                      {property.is_featured && (
                        <Star className="h-4 w-4 text-yellow-500 flex-shrink-0" fill="currentColor" />
                      )}
                    </div>
                    
                    <p className="text-sm font-semibold text-loro-terracotta mb-2">
                      {formatPrice(property.price, property.currency)}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
                      {property.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">
                            {property.location}
                            {property.country && ` ${countryToFlag(property.country)}`}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        {property.bedrooms && (
                          <div className="flex items-center gap-1">
                            <Bed className="h-3 w-3" />
                            <span>{property.bedrooms}</span>
                          </div>
                        )}
                        {property.bathrooms && (
                          <div className="flex items-center gap-1">
                            <Bath className="h-3 w-3" />
                            <span>{property.bathrooms}</span>
                          </div>
                        )}
                        {property.area && (
                          <div className="flex items-center gap-1">
                            <Maximize2 className="h-3 w-3" />
                            <span>{property.area} {property.area_unit || 'm²'}</span>
                          </div>
                        )}
                      </div>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs px-2 py-1 h-6"
                        onClick={() => window.open(property.url, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {properties.length === 6 && (
            <div className="text-center pt-2">
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