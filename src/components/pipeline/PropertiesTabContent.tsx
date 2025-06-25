import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, MapPin, Home, Bath, Bed, RefreshCw, Database, Zap, Trash2, Building2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import PropertyCard from './PropertyCard';
import PropertySearchBar from './PropertySearchBar';
import PropertyFilters from './PropertyFilters';
import PropertySort, { SortOption } from './PropertySort';
import PropertySkeleton from './PropertySkeleton';

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
  const [filteredProperties, setFilteredProperties] = useState<GadaitProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingDatoCms, setSyncingDatoCms] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // États des filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [transactionType, setTransactionType] = useState<'all' | 'buy' | 'rent'>('all');
  const [currentSort, setCurrentSort] = useState<SortOption>('newest');

  useEffect(() => {
    fetchGadaitProperties();
  }, []);

  // Filtrage et tri des propriétés
  useEffect(() => {
    let filtered = [...properties];

    // Filtre de recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(property =>
        property.title.toLowerCase().includes(term) ||
        property.location?.toLowerCase().includes(term) ||
        property.country?.toLowerCase().includes(term) ||
        property.property_type?.toLowerCase().includes(term)
      );
    }

    // Filtre par type de transaction
    if (transactionType !== 'all') {
      filtered = filtered.filter(property => {
        const title = property.title.toLowerCase();
        const description = property.description?.toLowerCase() || '';
        
        if (transactionType === 'rent') {
          return title.includes('location') || title.includes('louer') || title.includes('rent') ||
                 description.includes('location') || description.includes('louer') || description.includes('rent');
        } else if (transactionType === 'buy') {
          // For buy, we exclude properties that seem to be for rent
          return !(title.includes('location') || title.includes('louer') || title.includes('rent') ||
                  description.includes('location') || description.includes('louer') || description.includes('rent'));
        }
        return true;
      });
    }

    // Filtre par type
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(property =>
        property.property_type && selectedTypes.includes(property.property_type)
      );
    }

    // Filtre par pays
    if (selectedCountries.length > 0) {
      filtered = filtered.filter(property =>
        property.country && selectedCountries.some(country =>
          property.country?.toLowerCase().includes(country.toLowerCase()) ||
          country.toLowerCase().includes(property.country?.toLowerCase() || '')
        )
      );
    }

    // Filtre par localisation
    if (selectedLocations.length > 0) {
      filtered = filtered.filter(property =>
        property.location && selectedLocations.some(loc =>
          property.location?.toLowerCase().includes(loc.toLowerCase())
        )
      );
    }

    // Filtre par prix
    filtered = filtered.filter(property => {
      if (!property.price) return true;
      return property.price >= priceRange[0] && property.price <= priceRange[1];
    });

    // Tri
    filtered.sort((a, b) => {
      switch (currentSort) {
        case 'price-asc':
          return (a.price || 0) - (b.price || 0);
        case 'price-desc':
          return (b.price || 0) - (a.price || 0);
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'oldest':
          return a.id.localeCompare(b.id);
        case 'newest':
        default:
          return b.id.localeCompare(a.id);
      }
    });

    setFilteredProperties(filtered);
  }, [properties, searchTerm, selectedTypes, selectedLocations, selectedCountries, priceRange, currentSort, transactionType]);

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

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedTypes([]);
    setSelectedLocations([]);
    setSelectedCountries([]);
    setPriceRange([0, 10000000]);
    setTransactionType('all');
    setCurrentSort('newest');
  };

  const handleClearAllProperties = async () => {
    try {
      setClearing(true);
      
      toast({
        title: "Suppression en cours...",
        description: "Suppression de toutes les propriétés existantes",
      });

      console.log('Suppression de toutes les propriétés');

      // Supprimer TOUTES les propriétés sans condition
      const { error } = await supabase
        .from('gadait_properties')
        .delete()
        .gte('id', '00000000-0000-0000-0000-000000000000'); // Supprime tout

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
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-loro-pearl rounded animate-pulse" />
            <div className="h-4 w-64 bg-loro-pearl rounded animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-24 bg-loro-pearl rounded animate-pulse" />
            <div className="h-10 w-32 bg-loro-pearl rounded animate-pulse" />
          </div>
        </div>
        
        {/* Grid skeleton */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <PropertySkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4 font-futura">{error}</div>
        <Button onClick={fetchGadaitProperties} variant="outline" className="font-futura">
          <RefreshCw className="h-4 w-4 mr-2" />
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête moderne */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-loro-sand" />
            <h2 className="text-2xl font-futura font-medium text-loro-navy">
              Propriétés Gadait International
            </h2>
          </div>
          <p className="text-loro-navy/70 font-futura">
            Collection exclusive de propriétés de prestige synchronisées depuis DatoCMS
          </p>
          <div className="flex items-center gap-4 mt-3">
            <Badge variant="outline" className="bg-loro-white border-loro-sand text-loro-navy font-futura">
              {filteredProperties.length} propriétés affichées
            </Badge>
            <Badge variant="outline" className="bg-loro-white border-loro-pearl text-loro-navy/70 font-futura">
              {properties.length} au total
            </Badge>
            {transactionType !== 'all' && (
              <Badge variant="outline" className="bg-loro-sand border-loro-sand text-loro-navy font-futura">
                {transactionType === 'buy' ? 'Achat' : 'Location'}
              </Badge>
            )}
          </div>
        </div>
        
        {/* Boutons d'action */}
        <div className="flex items-center gap-3">
          <Button 
            onClick={handleClearAllProperties}
            disabled={clearing}
            variant="destructive"
            size="sm"
            className="font-futura"
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
            className="font-futura border-loro-pearl hover:bg-loro-white"
          >
            {migrating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Migration...
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                Migrer données
              </>
            )}
          </Button>
          
          <Button 
            onClick={handleSyncFromDatoCms}
            disabled={syncingDatoCms}
            className="bg-loro-sand text-loro-navy hover:bg-loro-sand/90 font-futura"
            size="sm"
          >
            {syncingDatoCms ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Synchronisation...
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
      
      {/* Barre de recherche et filtres */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <PropertySearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
          
          <div className="flex items-center gap-4">
            <PropertySort
              currentSort={currentSort}
              onSortChange={setCurrentSort}
            />
          </div>
        </div>
        
        <PropertyFilters
          priceRange={priceRange}
          onPriceRangeChange={setPriceRange}
          selectedTypes={selectedTypes}
          onTypesChange={setSelectedTypes}
          selectedLocations={selectedLocations}
          onLocationsChange={setSelectedLocations}
          selectedCountries={selectedCountries}
          onCountriesChange={setSelectedCountries}
          transactionType={transactionType}
          onTransactionTypeChange={setTransactionType}
          isOpen={filtersOpen}
          onToggle={() => setFiltersOpen(!filtersOpen)}
          onClearFilters={clearAllFilters}
        />
      </div>
      
      {/* Contenu principal */}
      {filteredProperties.length === 0 && !loading ? (
        <div className="text-center py-16 bg-gradient-to-br from-loro-white to-loro-pearl rounded-lg">
          <Building2 className="h-16 w-16 mx-auto mb-6 text-loro-navy/30" />
          {properties.length === 0 ? (
            <>
              <h3 className="text-xl font-futura font-medium text-loro-navy mb-3">
                Aucune propriété disponible
              </h3>
              <p className="text-loro-navy/70 font-futura mb-8 max-w-md mx-auto">
                Commencez par synchroniser vos propriétés depuis DatoCMS ou migrer vos données existantes.
              </p>
              <div className="flex gap-4 justify-center">
                <Button 
                  onClick={handleMigrateOldData} 
                  disabled={migrating} 
                  variant="outline"
                  className="font-futura border-loro-pearl hover:bg-loro-white"
                >
                  {migrating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Migration...
                    </>
                  ) : (
                    <>
                      <Database className="h-4 w-4 mr-2" />
                      Migrer les données
                    </>
                  )}
                </Button>
                <Button 
                  onClick={handleSyncFromDatoCms} 
                  disabled={syncingDatoCms}
                  className="bg-loro-sand text-loro-navy hover:bg-loro-sand/90 font-futura"
                >
                  {syncingDatoCms ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Synchronisation...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Synchroniser DatoCMS
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-xl font-futura font-medium text-loro-navy mb-3">
                Aucune propriété trouvée
              </h3>
              <p className="text-loro-navy/70 font-futura mb-6">
                Essayez de modifier vos critères de recherche ou d'effacer les filtres.
              </p>
              <Button 
                onClick={clearAllFilters}
                variant="outline"
                className="font-futura border-loro-sand text-loro-navy hover:bg-loro-sand hover:text-loro-navy"
              >
                Effacer tous les filtres
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-fade-in">
          {filteredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertiesTabContent;
