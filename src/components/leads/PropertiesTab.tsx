
import React, { useEffect, useState } from 'react';
import { LeadDetailed } from '@/types/lead';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Home } from 'lucide-react';
import PropertyCard from '@/components/pipeline/PropertyCard';
import PropertySelectionHistory from './PropertySelectionHistory';
import { normalizeCountryForDatoCMS, normalizePropertyTypesForDatoCMS } from '@/utils/propertyMatchingUtils';

interface GadaitProperty {
  id: string;
  external_id?: string;
  title: string;
  description?: string;
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
  features?: string[];
  amenities?: string[];
  external_url?: string;
  slug?: string;
  status?: string;
  is_featured?: boolean;
}

interface PropertiesTabProps {
  leadId: string;
  lead: LeadDetailed;
}

const PropertiesTab: React.FC<PropertiesTabProps> = ({ leadId, lead }) => {
  const [properties, setProperties] = useState<GadaitProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGadaitProperties();
  }, [lead.country, lead.desiredLocation, lead.propertyTypes, lead.budget, lead.bedrooms]);

  const fetchGadaitProperties = async () => {
    try {
      setLoading(true);
      
      // Build dynamic query based on lead criteria
      let query = supabase
        .from('properties_backoffice')
        .select('*')
        .eq('status', 'published');

      // Filter by listing type based on pipeline type
      if (lead.pipelineType === 'purchase') {
        query = query.eq('listing_type', 'sale');
      } else if (lead.pipelineType === 'rental') {
        query = query.eq('listing_type', 'rental');
      }

      // Filter by country - normalize to DatoCMS format
      if (lead.country) {
        const normalizedCountry = normalizeCountryForDatoCMS(lead.country);
        if (normalizedCountry) {
          query = query.eq('country', normalizedCountry);
        }
      }

      // Filter by location(s) - handle both array and string formats
      if (lead.desiredLocation && Array.isArray(lead.desiredLocation) && lead.desiredLocation.length > 0) {
        // Use OR conditions for multiple locations with ILIKE for partial matches
        const locationConditions = lead.desiredLocation.map(loc => `location.ilike.%${loc}%`).join(',');
        query = query.or(locationConditions);
      } else if (lead.desiredLocation && typeof lead.desiredLocation === 'string') {
        query = query.ilike('location', `%${lead.desiredLocation}%`);
      }

      // Filter by property type(s) - normalize to DatoCMS format (English lowercase)
      if (lead.propertyTypes && lead.propertyTypes.length > 0) {
        const normalizedTypes = normalizePropertyTypesForDatoCMS(lead.propertyTypes);
        if (normalizedTypes && normalizedTypes.length > 0) {
          query = query.in('property_type', normalizedTypes);
        }
      }

      // Filter by bedrooms (minimum)
      const bedroomsValue = Array.isArray(lead.bedrooms) ? lead.bedrooms[0] : lead.bedrooms;
      if (bedroomsValue && bedroomsValue > 0) {
        query = query.gte('bedrooms', bedroomsValue);
      }

      // Filter by budget (maximum price) - use price_eur for consistency
      if (lead.budget) {
        const budgetNum = parseFloat(lead.budget.replace(/[^0-9.]/g, ''));
        if (!isNaN(budgetNum)) {
          query = query.lte('price_eur', budgetNum);
        }
      }

      query = query.order('created_at', { ascending: false }).limit(50);

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setProperties(data || []);
    } catch (err) {
      console.error('Erreur lors du chargement des propriétés:', err);
      setError('Erreur lors du chargement des propriétés');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-4">
        <h2 className="text-xl font-normal mb-4">Propriétés Gadait</h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-loro-navy"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg p-4">
        <h2 className="text-xl font-normal mb-4">Propriétés Gadait</h2>
        <div className="text-center py-8 text-red-600">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Historique des sélections envoyées */}
      <PropertySelectionHistory leadId={leadId} />
      
      {/* Propriétés Gadait disponibles */}
      <div className="bg-white rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-normal">Propriétés Matchées</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {lead.country && `Pays: ${lead.country}`}
              {lead.desiredLocation && Array.isArray(lead.desiredLocation) && lead.desiredLocation.length > 0 && 
                ` • Localisations: ${lead.desiredLocation.join(', ')}`}
              {lead.propertyTypes && lead.propertyTypes.length > 0 && 
                ` • Types: ${lead.propertyTypes.join(', ')}`}
            </p>
          </div>
          <Badge variant="secondary">{properties.length} propriétés</Badge>
        </div>
        
        {properties.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Home className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Aucune propriété ne correspond aux critères du lead.</p>
            <p className="text-xs mt-2">Modifiez les critères de recherche pour voir plus de résultats.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertiesTab;
