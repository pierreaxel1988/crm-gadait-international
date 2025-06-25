import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, MapPin, Home, Bath, Bed, RefreshCw, Database, Zap, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import PropertyCard from './PropertyCard';

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
  const [syncingDatoCms, setSyncingDatoCms] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [clearing, setClearing] = useState(false);
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
        .limit(50);

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

  const handleClearAllProperties = async () => {
    try {
      setClearing(true);
      
      toast({
        title: "Suppression en cours...",
        description: "Suppression de toutes les propriétés existantes",
      });

      console.log('Suppression de toutes les propriétés');

      const { error } = await supabase
        .from('gadait_properties')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

      if (error) {
        console.error('Erreur lors de la suppression:', error);
        throw error;
      }

      // Rafraîchir la liste des propriétés
      await fetchGadaitProperties();

      toast({
        title: "Suppression réussie",
        description: "Toutes les propriétés ont été supprimées",
      });
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      toast({
        title: "Erreur de suppression",
        description: "Impossible de supprimer les propriétés",
        variant: "destructive",
      });
    } finally {
      setClearing(false);
    }
  };

  const handleSyncFromDatoCms = async () => {
    try {
      setSyncingDatoCms(true);
      
      toast({
        title: "Synchronisation DatoCMS en cours...",
        description: "Récupération des propriétés depuis l'API DatoCMS",
      });

      console.log('Démarrage de la synchronisation DatoCMS');

      const { data, error } = await supabase.functions.invoke('sync-datocms-properties', {
        body: {}
      });

      if (error) {
        console.error('Erreur lors de l\'appel de la fonction DatoCMS:', error);
        throw error;
      }

      console.log('Réponse complète de la fonction DatoCMS:', data);

      // Rafraîchir la liste des propriétés après la synchronisation
      await fetchGadaitProperties();

      toast({
        title: "Synchronisation DatoCMS réussie",
        description: `${data?.storedCount || 0} propriétés mises à jour (${data?.totalFromDatoCms || 0} récupérées depuis DatoCMS)`,
      });
    } catch (err) {
      console.error('Erreur lors de la synchronisation DatoCMS:', err);
      toast({
        title: "Erreur de synchronisation DatoCMS",
        description: "Impossible de synchroniser depuis DatoCMS. Vérifiez les logs pour plus de détails.",
        variant: "destructive",
      });
    } finally {
      setSyncingDatoCms(false);
    }
  };

  const handleMigrateOldData = async () => {
    try {
      setMigrating(true);
      
      toast({
        title: "Migration en cours...",
        description: "Import des données existantes",
      });

      // Récupérer les données de l'ancienne table
      const { data: oldData, error: fetchError } = await supabase
        .from('Gadait_Listings_Buy')
        .select('*')
        .limit(100);

      if (fetchError) {
        throw fetchError;
      }

      if (!oldData || oldData.length === 0) {
        toast({
          title: "Aucune donnée à migrer",
          description: "L'ancienne table ne contient pas de données",
        });
        return;
      }

      // Convertir et insérer les données dans la nouvelle table
      const convertedProperties = oldData.map((item: any) => ({
        external_id: item.Position?.toString() || 'legacy-' + Math.random().toString(36).substr(2, 9),
        title: item.Title || 'Propriété sans titre',
        description: item['Price and Location'] || '',
        price: item.price ? parseFloat(item.price.replace(/[^0-9.]/g, '')) || null : null,
        currency: 'EUR',
        location: item.city || '',
        country: item.country || 'Mauritius',
        property_type: item['Property Type'] || 'Property',
        bedrooms: item.Bedrooms || null,
        bathrooms: null,
        area: item.Area ? parseFloat(item.Area.replace(/[^0-9.]/g, '')) || null : null,
        area_unit: 'm²',
        main_image: item['Main Image'] || item['Secondary Image'] || '',
        images: [
          item['Main Image'],
          item['Secondary Image'],
          item['Additional Image 1'],
          item['Additional Image 2'],
          item['Additional Image 3'],
          item['Additional Image 4'],
          item['Additional Image 5']
        ].filter(Boolean),
        features: [],
        amenities: [],
        url: item['Property Link'] || 'https://gadait-international.com',
        is_available: true,
        is_featured: item.is_exclusive || false
      }));

      // Insérer par batch pour éviter les erreurs
      let insertedCount = 0;
      for (const property of convertedProperties) {
        try {
          const { error: insertError } = await supabase
            .from('gadait_properties')
            .upsert(property, { 
              onConflict: 'external_id',
              ignoreDuplicates: false 
            });

          if (!insertError) {
            insertedCount++;
          }
        } catch (err) {
          console.error('Erreur lors de l\'insertion:', err);
        }
      }

      await fetchGadaitProperties();

      toast({
        title: "Migration réussie",
        description: `${insertedCount} propriétés importées depuis l'ancienne base`,
      });
    } catch (err) {
      console.error('Erreur lors de la migration:', err);
      toast({
        title: "Erreur de migration",
        description: "Impossible de migrer les données",
        variant: "destructive",
      });
    } finally {
      setMigrating(false);
    }
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
          <p className="text-gray-600 mt-1">Synchronisation depuis l'API DatoCMS officielle</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{properties.length} propriétés</Badge>
          <Button 
            onClick={handleClearAllProperties}
            disabled={clearing}
            variant="destructive"
            size="sm"
          >
            {clearing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Suppression...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer tout
              </>
            )}
          </Button>
          <Button 
            onClick={handleMigrateOldData}
            disabled={migrating}
            variant="outline"
            size="sm"
          >
            {migrating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Migration...
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                Importer données
              </>
            )}
          </Button>
          <Button 
            onClick={handleSyncFromDatoCms}
            disabled={syncingDatoCms}
            variant="default"
            size="sm"
          >
            {syncingDatoCms ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Sync DatoCMS...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Sync DatoCMS
              </>
            )}
          </Button>
        </div>
      </div>
      
      {properties.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Home className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="mb-4">Aucune propriété disponible pour le moment.</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={handleMigrateOldData} disabled={migrating} variant="outline">
              {migrating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Migration en cours...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4 mr-2" />
                  Importer les données existantes
                </>
              )}
            </Button>
            <Button onClick={handleSyncFromDatoCms} disabled={syncingDatoCms}>
              {syncingDatoCms ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Synchronisation DatoCMS...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Synchroniser depuis DatoCMS
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertiesTabContent;
