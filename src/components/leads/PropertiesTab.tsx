
import React, { useEffect, useState } from 'react';
import { LeadDetailed } from '@/types/lead';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, MapPin, BedDouble, Home, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PropertiesTabProps {
  leadId: string;
  lead: LeadDetailed;
}

interface Property {
  id: string;
  title: string;
  property_type: string;
  bedrooms: number | null;
  area: number | null;
  area_unit: string;
  price: number | null;
  currency: string;
  location: string | null;
  country: string | null;
  url: string | null;
  images: string[];
}

const formatPrice = (price: number | null, currency: string) => {
  if (!price) return "Prix sur demande";
  
  const currencySymbol = 
    currency === 'EUR' ? '€' :
    currency === 'USD' ? '$' : 
    currency === 'GBP' ? '£' : '';
    
  return `${currencySymbol}${price.toLocaleString('fr-FR')}`;
};

const PropertiesTab: React.FC<PropertiesTabProps> = ({ leadId, lead }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Charger les propriétés correspondant aux critères du lead
  useEffect(() => {
    const loadProperties = async () => {
      setIsLoading(true);
      try {
        let query = supabase
          .from('properties')
          .select('*')
          .order('created_at', { ascending: false });
        
        // Filtrage par pays si spécifié
        if (lead.country) {
          query = query.eq('country', lead.country);
        }
        
        // Filtrage par type de propriété si spécifié
        if (lead.propertyTypes && lead.propertyTypes.length > 0) {
          // Chercher si l'un des types de propriété du lead correspond
          query = query.or(
            lead.propertyTypes.map(type => `property_type.ilike.%${type}%`).join(',')
          );
        }
        
        // Filtrage par nombre de chambres si spécifié
        if (lead.bedrooms) {
          const bedroomFilters = Array.isArray(lead.bedrooms) ? lead.bedrooms : [lead.bedrooms];
          if (bedroomFilters.length > 0) {
            // Pour les chambres, on prend les propriétés qui ont au moins le nombre minimum spécifié
            const minBedrooms = Math.min(...bedroomFilters.filter(b => typeof b === 'number') as number[]);
            query = query.gte('bedrooms', minBedrooms);
          }
        }
        
        // Limiter à 20 résultats
        query = query.limit(20);
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        setProperties(data || []);
      } catch (error) {
        console.error("Erreur lors du chargement des propriétés:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les propriétés",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProperties();
  }, [lead]);
  
  // Fonction pour actualiser manuellement les données
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Fix: Get the session token using the correct method
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      
      const response = await fetch('https://hxqoqkfnhbpwzkjgukrc.supabase.co/functions/v1/properties-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Synchronisation réussie",
          description: result.message
        });
        
        // Recharger les propriétés
        window.location.reload();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Erreur lors de la synchronisation:", error);
      toast({
        title: "Erreur de synchronisation",
        description: error.message || "Impossible de synchroniser les propriétés",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Propriétés</h2>
        <Button 
          onClick={handleRefresh}
          disabled={isRefreshing}
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
        >
          {isRefreshing ? (
            <Loader2 className="h-4 w-4 animate-spin mr-1" />
          ) : null}
          Synchroniser
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-loro-navy" />
        </div>
      ) : properties.length === 0 ? (
        <p className="text-gray-500 py-4 text-center">
          Aucune propriété ne correspond aux critères du lead. Essayez d'élargir les filtres.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {properties.map((property) => (
            <Card key={property.id} className="overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
              <div className="aspect-video w-full relative">
                {property.images && property.images.length > 0 ? (
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      // Fallback en cas d'erreur de chargement d'image
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <Home className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>
              
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold line-clamp-1">{property.title}</h3>
                  <div className="text-lg font-bold text-loro-terracotta">
                    {formatPrice(property.price, property.currency)}
                  </div>
                </div>
                
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{property.location || property.country || 'Maurice'}</span>
                </div>
                
                <div className="flex items-center gap-4 mt-3 text-sm">
                  {property.property_type && (
                    <div className="flex items-center">
                      <Home className="w-4 h-4 mr-1 text-loro-navy" />
                      <span>{property.property_type}</span>
                    </div>
                  )}
                  
                  {property.bedrooms !== null && (
                    <div className="flex items-center">
                      <BedDouble className="w-4 h-4 mr-1 text-loro-navy" />
                      <span>{property.bedrooms} ch.</span>
                    </div>
                  )}
                  
                  {property.area !== null && (
                    <div>
                      {property.area} {property.area_unit}
                    </div>
                  )}
                </div>
                
                <div className="mt-4 flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex items-center gap-1 border-loro-navy/30 text-loro-navy"
                    onClick={() => window.open(property.url || '', '_blank')}
                  >
                    Voir <ExternalLink className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertiesTab;
