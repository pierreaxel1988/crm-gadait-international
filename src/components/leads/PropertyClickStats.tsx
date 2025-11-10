import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MousePointer2, TrendingUp, Clock, Eye } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface PropertyClickStatsProps {
  leadId: string;
}

interface PropertyClickData {
  id: string;
  property_id: string;
  clicked_at: string;
  redirect_url: string;
  gadait_properties?: {
    title: string;
    location: string;
    main_image: string;
    price: number;
    currency: string;
  };
}

interface PropertyStats {
  propertyId: string;
  title: string;
  location: string;
  mainImage: string;
  price: number;
  currency: string;
  clickCount: number;
  lastClick: string;
}

const PropertyClickStats: React.FC<PropertyClickStatsProps> = ({ leadId }) => {
  const [loading, setLoading] = useState(true);
  const [totalClicks, setTotalClicks] = useState(0);
  const [lastClick, setLastClick] = useState<PropertyClickData | null>(null);
  const [topProperties, setTopProperties] = useState<PropertyStats[]>([]);

  useEffect(() => {
    fetchClickStats();
  }, [leadId]);

  const fetchClickStats = async () => {
    setLoading(true);
    try {
      // Récupérer tous les clics du lead
      const { data: clicks, error } = await supabase
        .from('property_click_tracking')
        .select('id, property_id, clicked_at, redirect_url')
        .eq('lead_id', leadId)
        .order('clicked_at', { ascending: false });

      if (error) {
        console.error('Error fetching click stats:', error);
        return;
      }

      if (!clicks || clicks.length === 0) {
        setLoading(false);
        return;
      }

      // Total de clics
      setTotalClicks(clicks.length);

      // Récupérer les IDs uniques des propriétés
      const uniquePropertyIds = [...new Set(clicks.map(c => c.property_id))];

      // Récupérer les détails des propriétés
      const { data: properties, error: propertiesError } = await supabase
        .from('gadait_properties')
        .select('id, title, location, main_image, price, currency')
        .in('id', uniquePropertyIds);

      if (propertiesError) {
        console.error('Error fetching properties:', propertiesError);
        setLoading(false);
        return;
      }

      // Créer un map des propriétés par ID
      const propertyMap = new Map(
        properties?.map(p => [p.id, p]) || []
      );

      // Dernier clic avec données de propriété
      const lastClickProperty = propertyMap.get(clicks[0].property_id);
      if (lastClickProperty) {
        setLastClick({
          ...clicks[0],
          gadait_properties: lastClickProperty,
        } as PropertyClickData);
      }

      // Grouper par propriété et compter les clics
      const statsMap = new Map<string, PropertyStats>();

      clicks.forEach((click) => {
        const propertyId = click.property_id;
        const property = propertyMap.get(propertyId);

        if (!property) return;

        if (statsMap.has(propertyId)) {
          const stats = statsMap.get(propertyId)!;
          stats.clickCount++;
          // Garder le clic le plus récent
          if (new Date(click.clicked_at) > new Date(stats.lastClick)) {
            stats.lastClick = click.clicked_at;
          }
        } else {
          statsMap.set(propertyId, {
            propertyId,
            title: property.title,
            location: property.location,
            mainImage: property.main_image || '',
            price: property.price || 0,
            currency: property.currency || 'EUR',
            clickCount: 1,
            lastClick: click.clicked_at,
          });
        }
      });

      // Trier par nombre de clics et prendre le top 3
      const sortedProperties = Array.from(statsMap.values())
        .sort((a, b) => b.clickCount - a.clickCount)
        .slice(0, 3);

      setTopProperties(sortedProperties);
    } catch (error) {
      console.error('Error in fetchClickStats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `Il y a ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
    } else if (diffHours < 24) {
      return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    } else if (diffDays < 7) {
      return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }
  };

  if (loading) {
    return (
      <Card className="border-loro-sand/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-loro-navy">
            <MousePointer2 className="h-5 w-5 text-loro-terracotta" />
            Statistiques de consultation
          </CardTitle>
          <CardDescription>Suivi des propriétés consultées par ce lead</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (totalClicks === 0) {
    return (
      <Card className="border-loro-sand/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-loro-navy">
            <MousePointer2 className="h-5 w-5 text-loro-terracotta" />
            Statistiques de consultation
          </CardTitle>
          <CardDescription>Suivi des propriétés consultées par ce lead</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Eye className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">Aucune consultation enregistrée</p>
            <p className="text-sm mt-1">
              Les consultations seront affichées ici lorsque le lead cliquera sur les propriétés envoyées.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-loro-sand/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-loro-navy">
          <MousePointer2 className="h-5 w-5 text-loro-terracotta" />
          Statistiques de consultation
        </CardTitle>
        <CardDescription>
          {totalClicks} consultation{totalClicks > 1 ? 's' : ''} au total
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Résumé rapide */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-700">Total clics</span>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-900">{totalClicks}</p>
          </div>
          
          {lastClick && (
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-purple-700">Dernier clic</span>
                <Clock className="h-4 w-4 text-purple-600" />
              </div>
              <p className="text-sm font-semibold text-purple-900">
                {formatDate(lastClick.clicked_at)}
              </p>
            </div>
          )}
        </div>

        {/* Propriétés les plus consultées */}
        {topProperties.length > 0 && (
          <div>
            <h4 className="font-semibold text-loro-navy mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-loro-terracotta" />
              Propriétés les plus consultées
            </h4>
            <div className="space-y-3">
              {topProperties.map((property, index) => (
                <div
                  key={property.propertyId}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {/* Rang */}
                  <div className="flex-shrink-0">
                    <Badge
                      variant={index === 0 ? 'default' : 'outline'}
                      className={
                        index === 0
                          ? 'bg-loro-sand text-loro-navy'
                          : 'border-gray-300 text-gray-700'
                      }
                    >
                      #{index + 1}
                    </Badge>
                  </div>

                  {/* Image */}
                  {property.mainImage && (
                    <img
                      src={property.mainImage}
                      alt={property.title}
                      className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                    />
                  )}

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-loro-navy text-sm truncate">
                      {property.title}
                    </p>
                    <p className="text-xs text-gray-600 truncate">
                      📍 {property.location}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-xs font-semibold text-loro-sand">
                        {property.price
                          ? `${property.price.toLocaleString()} ${property.currency}`
                          : 'Prix sur demande'}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        <MousePointer2 className="h-3 w-3 mr-1" />
                        {property.clickCount} clic{property.clickCount > 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dernier clic détaillé */}
        {lastClick && lastClick.gadait_properties && (
          <div className="pt-4 border-t border-gray-200">
            <h4 className="font-semibold text-loro-navy mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-loro-terracotta" />
              Dernière propriété consultée
            </h4>
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
              {lastClick.gadait_properties.main_image && (
                <img
                  src={lastClick.gadait_properties.main_image}
                  alt={lastClick.gadait_properties.title}
                  className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-loro-navy text-sm">
                  {lastClick.gadait_properties.title}
                </p>
                <p className="text-xs text-gray-600 mb-2">
                  📍 {lastClick.gadait_properties.location}
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs border-blue-300 text-blue-700">
                    {formatDate(lastClick.clicked_at)}
                  </Badge>
                  <span className="text-xs font-semibold text-loro-sand">
                    {lastClick.gadait_properties.price
                      ? `${lastClick.gadait_properties.price.toLocaleString()} ${lastClick.gadait_properties.currency}`
                      : 'Prix sur demande'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PropertyClickStats;
