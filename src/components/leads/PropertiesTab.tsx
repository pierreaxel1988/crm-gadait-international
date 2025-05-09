
import React, { useState, useEffect } from 'react';
import { LeadDetailed } from '@/types/lead';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, MapPin, BedDouble, Home, Loader2, Heart, Filter } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface PropertiesTabProps {
  leadId: string;
  lead: LeadDetailed;
}

interface GadaitProperty {
  Position: number;
  Title: string;
  price: string | null;
  "Property Type": string | null;
  Bedrooms: number | null;
  Area: string | null;
  country: string | null;
  city: string | null;
  "Property Link": string | null;
  "Main Image": string | null;
  "Secondary Image": string | null;
  "Additional Image 1": string | null;
  "Additional Image 2": string | null;
  "Additional Image 3": string | null;
  "Additional Image 4": string | null;
  "Additional Image 5": string | null;
  is_new: boolean | null;
  is_exclusive: boolean | null;
}

interface FilterOptions {
  countries: string[];
  cities: string[];
  propertyTypes: string[];
}

interface FiltersState {
  country: string | null;
  city: string | null;
  propertyType: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  minBedrooms: number | null;
  showExclusiveOnly: boolean;
  showNewOnly: boolean;
}

const formatPrice = (price: string | null) => {
  if (!price) return "Prix sur demande";
  
  // Si le prix contient déjà un symbole de devise, le retourner tel quel
  if (price.includes('€') || price.includes('$') || price.includes('£')) {
    return price;
  }
  
  // Essayer de convertir le prix en nombre et le formater
  try {
    // Nettoyer le prix en supprimant tout sauf les chiffres
    const cleanPrice = price.replace(/[^\d.,-]/g, '');
    const numPrice = parseFloat(cleanPrice.replace(',', '.'));
    
    if (isNaN(numPrice)) {
      return price; // Si la conversion échoue, retourner le prix original
    }
    
    // Par défaut, utiliser l'euro comme devise
    return `€${numPrice.toLocaleString('fr-FR')}`;
  } catch (e) {
    return price; // En cas d'erreur, retourner le prix original
  }
};

// Fonction pour extraire un prix numérique à partir d'une chaîne
const extractNumericPrice = (priceString: string | null): number | null => {
  if (!priceString) return null;
  
  const matches = priceString.match(/[\d,.]+/g);
  if (!matches || matches.length === 0) return null;
  
  // Prendre la première correspondance et la nettoyer
  const numericPart = matches[0].replace(/,/g, '');
  const price = parseFloat(numericPart);
  
  return isNaN(price) ? null : price;
};

const PropertiesTab: React.FC<PropertiesTabProps> = ({ leadId, lead }) => {
  const [properties, setProperties] = useState<GadaitProperty[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    countries: [],
    cities: [],
    propertyTypes: [],
  });
  const [filters, setFilters] = useState<FiltersState>({
    country: null,
    city: null,
    propertyType: null,
    minPrice: null,
    maxPrice: null,
    minBedrooms: null,
    showExclusiveOnly: false,
    showNewOnly: false,
  });
  const [favorites, setFavorites] = useState<number[]>([]);
  const propertiesPerPage = 12;

  // Charger les options de filtres
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        // Charger les pays disponibles
        const { data: countries } = await supabase
          .from('Gadait_Listings_Buy')
          .select('country')
          .eq('country', 'not.is.null');

        // Charger les villes disponibles
        const { data: cities } = await supabase
          .from('Gadait_Listings_Buy')
          .select('city')
          .eq('city', 'not.is.null');

        // Charger les types de propriétés
        const { data: propertyTypes } = await supabase
          .from('Gadait_Listings_Buy')
          .select('"Property Type"')
          .eq('Property Type', 'not.is.null');

        // Extraire les valeurs uniques
        const uniqueCountries = [...new Set(countries?.map(item => item.country).filter(Boolean))];
        const uniqueCities = [...new Set(cities?.map(item => item.city).filter(Boolean))];
        const uniquePropertyTypes = [...new Set(propertyTypes?.map(item => item["Property Type"]).filter(Boolean))];
        
        setFilterOptions({
          countries: uniqueCountries,
          cities: uniqueCities,
          propertyTypes: uniquePropertyTypes,
        });
      } catch (error) {
        console.error("Erreur lors du chargement des options de filtre:", error);
      }
    };
    
    loadFilterOptions();
  }, []);

  // Charger les propriétés correspondant aux critères du lead
  useEffect(() => {
    const loadProperties = async () => {
      setIsLoading(true);
      try {
        console.log("Chargement des propriétés pour le lead:", leadId);
        let query = supabase
          .from('Gadait_Listings_Buy')
          .select('*', { count: 'exact' });
        
        // Appliquer les filtres:
        
        // 1. Filtres de base provenant du lead
        if (lead.country) {
          query = query.eq('country', lead.country);
        }
        
        if (lead.bedrooms) {
          const bedroomFilters = Array.isArray(lead.bedrooms) ? lead.bedrooms : [lead.bedrooms];
          if (bedroomFilters.length > 0) {
            // Pour les chambres, on prend les propriétés qui ont au moins le nombre minimum spécifié
            const minBedrooms = Math.min(...bedroomFilters.filter(b => typeof b === 'number') as number[]);
            query = query.gte('Bedrooms', minBedrooms);
          }
        }
        
        if (lead.propertyTypes && lead.propertyTypes.length > 0) {
          // Chercher si l'un des types de propriété du lead correspond
          const propertyTypeConditions = lead.propertyTypes.map(type => `"Property Type".ilike.%${type}%`);
          query = query.or(propertyTypeConditions.join(','));
        }
        
        // 2. Filtres avancés sélectionnés par l'utilisateur
        if (filters.country) {
          query = query.eq('country', filters.country);
        }
        
        if (filters.city) {
          query = query.eq('city', filters.city);
        }
        
        if (filters.propertyType) {
          query = query.eq('Property Type', filters.propertyType);
        }
        
        if (filters.minBedrooms) {
          query = query.gte('Bedrooms', filters.minBedrooms);
        }
        
        if (filters.showExclusiveOnly) {
          query = query.eq('is_exclusive', true);
        }
        
        if (filters.showNewOnly) {
          query = query.eq('is_new', true);
        }
        
        // Filtres de prix - nécessitent un traitement spécial
        // Note: Cette logique peut ne pas fonctionner parfaitement car le prix est stocké comme une chaîne
        // Une solution idéale serait d'extraire les prix numériques dans une colonne séparée
        
        // Tri et pagination
        query = query.order('Position', { ascending: true });
        
        // D'abord, obtenir le nombre total pour la pagination
        const { count, error: countError } = await query;
        
        if (countError) {
          throw countError;
        }
        
        setTotalCount(count || 0);
        
        // Calculer la plage pour la pagination
        const from = (currentPage - 1) * propertiesPerPage;
        const to = from + propertiesPerPage - 1;
        
        // Ajouter la pagination à la requête
        const { data, error } = await query.range(from, to);
        
        if (error) throw error;
        
        console.log(`${data?.length || 0} propriétés chargées sur cette page (sur ${count} au total)`);
        setProperties(data || []);
        
        // Charger les propriétés favorites de l'utilisateur actuel
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: favoritesData } = await supabase
            .from('user_favorites')
            .select('property_position')
            .eq('user_id', user.id);
            
          if (favoritesData) {
            setFavorites(favoritesData.map(f => f.property_position));
          }
        }
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
  }, [lead, leadId, currentPage, filters]);
  
  // Fonction pour actualiser manuellement les données
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setSyncStatus("Synchronisation en cours...");
    try {
      // Get the session token using the correct method
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      
      const response = await fetch(`${process.env.SUPABASE_URL || 'https://hxqoqkfnhbpwzkjgukrc.supabase.co'}/functions/v1/properties-sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          url: "https://the-private-collection.com/en/search/"
        }),
      });
      
      const result = await response.json();
      console.log("Résultat de la synchronisation:", result);
      
      if (result.success) {
        setSyncStatus(`Succès: ${result.message}`);
        toast({
          title: "Synchronisation réussie",
          description: result.message
        });
        
        // Recharger les propriétés
        setCurrentPage(1); // Revenir à la première page
        setFilters({
          country: null,
          city: null,
          propertyType: null,
          minPrice: null,
          maxPrice: null,
          minBedrooms: null,
          showExclusiveOnly: false,
          showNewOnly: false,
        });
        
        // Recharger la page au lieu de simplement rafraîchir les données
        window.location.reload();
      } else {
        setSyncStatus(`Erreur: ${result.message}`);
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
      // Cacher le statut de synchronisation après un délai
      setTimeout(() => setSyncStatus(null), 5000);
    }
  };

  // Fonction pour gérer les erreurs d'image
  const handleImageError = (propertyPosition: number) => {
    setImageErrors(prev => ({
      ...prev,
      [propertyPosition]: true
    }));
  };

  // Fonction pour obtenir l'image d'une propriété
  const getPropertyImage = (property: GadaitProperty) => {
    // Si l'image a déjà échoué, utiliser directement le placeholder
    if (imageErrors[property.Position]) {
      return '/placeholder.svg';
    }
    
    // Essayer d'utiliser l'image principale
    if (property["Main Image"]) {
      return property["Main Image"];
    }
    
    // Sinon essayer l'image secondaire
    if (property["Secondary Image"]) {
      return property["Secondary Image"];
    }
    
    // Essayer les images additionnelles dans l'ordre
    const additionalImages = [
      property["Additional Image 1"],
      property["Additional Image 2"],
      property["Additional Image 3"],
      property["Additional Image 4"],
      property["Additional Image 5"],
    ];
    
    for (const img of additionalImages) {
      if (img) return img;
    }
    
    // Sinon, utiliser le placeholder par défaut
    return '/placeholder.svg';
  };

  // Fonction pour ajouter/retirer des favoris
  const toggleFavorite = async (propertyPosition: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Non connecté",
          description: "Vous devez être connecté pour ajouter aux favoris",
          variant: "destructive"
        });
        return;
      }
      
      const isFavorited = favorites.includes(propertyPosition);
      
      if (isFavorited) {
        // Supprimer des favoris
        await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('property_position', propertyPosition);
        
        setFavorites(favorites.filter(pos => pos !== propertyPosition));
        
        toast({
          title: "Retiré des favoris",
          description: "La propriété a été retirée de vos favoris"
        });
      } else {
        // Ajouter aux favoris
        await supabase
          .from('user_favorites')
          .insert({
            user_id: user.id,
            property_position: propertyPosition,
            added_at: new Date().toISOString()
          });
        
        setFavorites([...favorites, propertyPosition]);
        
        toast({
          title: "Ajouté aux favoris",
          description: "La propriété a été ajoutée à vos favoris"
        });
      }
    } catch (error) {
      console.error("Erreur lors de la gestion des favoris:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les favoris",
        variant: "destructive"
      });
    }
  };

  // Calculer le nombre total de pages
  const totalPages = Math.ceil(totalCount / propertiesPerPage);

  // Fonction pour changer de page
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="bg-white rounded-lg p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <h2 className="text-xl font-bold">Propriétés</h2>
        <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-1 w-full md:w-auto"
              >
                <Filter className="h-4 w-4" />
                Filtrer
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h4 className="font-medium">Filtres</h4>
                
                <div className="space-y-2">
                  <label className="text-sm">Pays</label>
                  <Select 
                    value={filters.country || ""} 
                    onValueChange={(value) => setFilters({...filters, country: value || null})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les pays" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Tous les pays</SelectItem>
                      {filterOptions.countries.map(country => (
                        <SelectItem key={country} value={country}>{country}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm">Ville</label>
                  <Select 
                    value={filters.city || ""} 
                    onValueChange={(value) => setFilters({...filters, city: value || null})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes les villes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Toutes les villes</SelectItem>
                      {filterOptions.cities.map(city => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm">Type de propriété</label>
                  <Select 
                    value={filters.propertyType || ""} 
                    onValueChange={(value) => setFilters({...filters, propertyType: value || null})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Tous les types</SelectItem>
                      {filterOptions.propertyTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm">Chambres (min)</label>
                  <Select 
                    value={filters.minBedrooms?.toString() || ""} 
                    onValueChange={(value) => setFilters({...filters, minBedrooms: value ? parseInt(value) : null})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tout" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Tout</SelectItem>
                      {[1, 2, 3, 4, 5, 6].map(n => (
                        <SelectItem key={n} value={n.toString()}>{n}+</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="exclusive" 
                      checked={filters.showExclusiveOnly}
                      onCheckedChange={(checked) => setFilters({...filters, showExclusiveOnly: checked === true})}
                    />
                    <label htmlFor="exclusive" className="text-sm font-medium leading-none">
                      Exclusivités seulement
                    </label>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="new" 
                      checked={filters.showNewOnly}
                      onCheckedChange={(checked) => setFilters({...filters, showNewOnly: checked === true})}
                    />
                    <label htmlFor="new" className="text-sm font-medium leading-none">
                      Nouveautés seulement
                    </label>
                  </div>
                </div>
                
                <div className="pt-2 flex justify-between">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setFilters({
                      country: null,
                      city: null,
                      propertyType: null,
                      minPrice: null,
                      maxPrice: null,
                      minBedrooms: null,
                      showExclusiveOnly: false,
                      showNewOnly: false,
                    })}
                  >
                    Réinitialiser
                  </Button>
                  
                  <Button size="sm" onClick={() => setCurrentPage(1)}>
                    Appliquer
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <div className="flex items-center gap-2">
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
            
            <span className="text-sm text-gray-500 whitespace-nowrap">
              {totalCount} propriétés
            </span>
          </div>
        </div>
      </div>
      
      {syncStatus && (
        <div className={`mb-4 p-3 rounded ${syncStatus.startsWith('Erreur') ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
          {syncStatus}
        </div>
      )}
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-loro-navy" />
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 py-4">
            Aucune propriété ne correspond aux critères. Essayez d'élargir les filtres.
          </p>
          <Button 
            variant="outline" 
            onClick={() => setFilters({
              country: null,
              city: null,
              propertyType: null,
              minPrice: null,
              maxPrice: null,
              minBedrooms: null,
              showExclusiveOnly: false,
              showNewOnly: false,
            })}
          >
            Réinitialiser les filtres
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties.map((property) => (
            <Card key={property.Position} className="overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
              <div className="aspect-video w-full relative">
                <img
                  src={getPropertyImage(property)}
                  alt={property.Title || "Propriété"}
                  className="object-cover w-full h-full"
                  onError={() => handleImageError(property.Position)}
                />
                
                {property["Property Type"] && (
                  <div className="absolute bottom-2 left-2 bg-loro-navy/80 text-white px-3 py-1 rounded-full text-xs font-medium">
                    {property["Property Type"]}
                  </div>
                )}
                
                {property.is_exclusive && (
                  <div className="absolute top-2 right-2 bg-amber-500/80 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Exclusivité
                  </div>
                )}
                
                {property.is_new && (
                  <div className="absolute top-2 left-2 bg-loro-terracotta/80 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Nouveau
                  </div>
                )}
                
                {/* Bouton favori */}
                <button 
                  className="absolute top-2 right-2 h-8 w-8 flex items-center justify-center bg-white/80 rounded-full hover:bg-white transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleFavorite(property.Position);
                  }}
                >
                  <Heart 
                    className={`h-5 w-5 ${favorites.includes(property.Position) ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} 
                  />
                </button>
              </div>
              
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold line-clamp-1">{property.Title || "Propriété sans titre"}</h3>
                  <div className="text-lg font-bold text-loro-terracotta">
                    {formatPrice(property.price)}
                  </div>
                </div>
                
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{property.city || property.country || 'Non spécifié'}</span>
                </div>
                
                <div className="flex items-center gap-4 mt-3 text-sm">
                  {property["Property Type"] && (
                    <div className="flex items-center">
                      <Home className="w-4 h-4 mr-1 text-loro-navy" />
                      <span>{property["Property Type"]}</span>
                    </div>
                  )}
                  
                  {property.Bedrooms !== null && (
                    <div className="flex items-center">
                      <BedDouble className="w-4 h-4 mr-1 text-loro-navy" />
                      <span>{property.Bedrooms} ch.</span>
                    </div>
                  )}
                  
                  {property.Area && (
                    <div>
                      {property.Area}
                    </div>
                  )}
                </div>
                
                <div className="mt-4 flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex items-center gap-1 border-loro-navy/30 text-loro-navy"
                    onClick={() => property["Property Link"] && window.open(property["Property Link"], '_blank')}
                  >
                    Voir <ExternalLink className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Pagination plus complète */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
            >
              &lt;&lt;
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              &lt; Précédent
            </Button>
            
            {/* Pages numérotées */}
            <div className="flex items-center">
              {[...Array(Math.min(5, totalPages))].map((_, index) => {
                let pageNumber;
                
                // Calcul astucieux pour montrer les pages autour de la page actuelle
                if (totalPages <= 5) {
                  pageNumber = index + 1;
                } else if (currentPage <= 3) {
                  pageNumber = index + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + index;
                } else {
                  pageNumber = currentPage - 2 + index;
                }
                
                return (
                  <Button 
                    key={index}
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    size="sm"
                    className="mx-1 h-8 w-8 p-0"
                    onClick={() => handlePageChange(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                );
              })}
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Suivant &gt;
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
            >
              &gt;&gt;
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertiesTab;
