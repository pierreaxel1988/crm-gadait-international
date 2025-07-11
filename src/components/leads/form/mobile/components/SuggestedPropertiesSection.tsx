import React, { useEffect, useState } from 'react';
import { LeadDetailed } from '@/types/lead';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, Sparkles } from 'lucide-react';
import SuggestedPropertyCard from './SuggestedPropertyCard';

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
            <SuggestedPropertyCard 
              key={property.id} 
              property={property} 
              leadId={lead.id}
            />
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