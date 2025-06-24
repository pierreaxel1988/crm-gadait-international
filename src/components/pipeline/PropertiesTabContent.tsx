
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, MapPin, Home, Bath, Bed, RefreshCw, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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
  url: string;
  is_available?: boolean;
  is_featured?: boolean;
}

const PropertiesTabContent: React.FC = () => {
  const [properties, setProperties] = useState<GadaitProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGadaitProperties();
  }, []);

  const fetchGadaitProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('gadait_properties')
        .select('*')
        .eq('is_available', true)
        .order('created_at', { ascending: false })
        .limit(20);

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

  const handleSyncProperties = async () => {
    try {
      setSyncing(true);
      
      toast({
        title: "Synchronisation en cours...",
        description: "Récupération des nouvelles propriétés depuis Gadait",
      });

      const { data, error } = await supabase.functions.invoke('scrape-website', {
        body: {
          url: 'https://gadait-international.com/en/buy',
          debug: false
        }
      });

      if (error) {
        throw error;
      }

      console.log('Résultat de la synchronisation:', data);

      // Rafraîchir la liste des propriétés après la synchronisation
      await fetchGadaitProperties();

      toast({
        title: "Synchronisation réussie",
        description: `${data?.storedCount || 0} propriétés synchronisées`,
      });
    } catch (err) {
      console.error('Erreur lors de la synchronisation:', err);
      toast({
        title: "Erreur de synchronisation",
        description: "Impossible de synchroniser les propriétés",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const formatPrice = (price?: number, currency?: string) => {
    if (!price) return 'Prix sur demande';
    return `${price.toLocaleString()} ${currency || 'EUR'}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-loro-navy"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">{error}</div>
        <Button onClick={fetchGadaitProperties} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Propriétés Gadait</h2>
          <p className="text-gray-600 mt-1">Synchronisation automatique toutes les heures</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{properties.length} propriétés</Badge>
          <Button 
            onClick={handleSyncProperties}
            disabled={syncing}
            variant="outline"
            size="sm"
          >
            {syncing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Synchronisation...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Synchroniser
              </>
            )}
          </Button>
        </div>
      </div>
      
      {properties.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Home className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="mb-4">Aucune propriété disponible pour le moment.</p>
          <Button onClick={handleSyncProperties} disabled={syncing}>
            {syncing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Synchronisation en cours...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Synchroniser les propriétés
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {property.main_image && (
                <div className="aspect-video relative">
                  <img
                    src={property.main_image}
                    alt={property.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  {property.is_featured && (
                    <Badge className="absolute top-2 left-2 bg-loro-navy">
                      Featured
                    </Badge>
                  )}
                </div>
              )}
              
              <CardHeader className="pb-2">
                <CardTitle className="text-lg line-clamp-2">
                  {property.title}
                </CardTitle>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{property.location || property.country}</span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-loro-navy">
                    {formatPrice(property.price, property.currency)}
                  </span>
                  {property.property_type && (
                    <Badge variant="outline">
                      {property.property_type}
                    </Badge>
                  )}
                </div>
                
                {(property.bedrooms || property.bathrooms || property.area) && (
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    {property.bedrooms && (
                      <div className="flex items-center gap-1">
                        <Bed className="h-4 w-4" />
                        <span>{property.bedrooms}</span>
                      </div>
                    )}
                    {property.bathrooms && (
                      <div className="flex items-center gap-1">
                        <Bath className="h-4 w-4" />
                        <span>{property.bathrooms}</span>
                      </div>
                    )}
                    {property.area && (
                      <div className="flex items-center gap-1">
                        <span>{property.area} {property.area_unit}</span>
                      </div>
                    )}
                  </div>
                )}
                
                {property.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {property.description}
                  </p>
                )}
                
                {property.features && property.features.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {property.features.slice(0, 3).map((feature, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                    {property.features.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{property.features.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => window.open(property.url, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Voir la propriété
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertiesTabContent;
