import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/layout/Navbar';
import SubNavigation from '@/components/layout/SubNavigation';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, MapPin, BedDouble, Home, Loader2, Filter, ArrowRight, ArrowLeft, Heart, Grid3x3, LayoutList, Share, SlidersHorizontal, Star, CircleX } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useAuth } from '@/hooks/useAuth';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
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
interface Filters {
  country: string | null;
  city: string | null;
  propertyType: string | null;
  minPrice: string | null;
  maxPrice: string | null;
  bedrooms: number | null;
  favoritesOnly: boolean;
}
interface SortOptions {
  field: 'price' | 'position';
  direction: 'asc' | 'desc';
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

// Helper function to extract numeric price value for sorting
const extractNumericPrice = (priceString: string | null): number => {
  if (!priceString) return 0;
  const cleanPrice = priceString.replace(/[^\d.,-]/g, '');
  const numPrice = parseFloat(cleanPrice.replace(',', '.'));
  return isNaN(numPrice) ? 0 : numPrice;
};
const PropertiesPage = () => {
  const [properties, setProperties] = useState<GadaitProperty[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalProperties, setTotalProperties] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<Filters>({
    country: null,
    city: null,
    propertyType: null,
    minPrice: null,
    maxPrice: null,
    bedrooms: null,
    favoritesOnly: false
  });
  const [sortOptions, setSortOptions] = useState<SortOptions>({
    field: 'position',
    direction: 'asc'
  });
  const [availableFilters, setAvailableFilters] = useState({
    countries: [] as string[],
    cities: [] as string[],
    propertyTypes: [] as string[]
  });
  const [favorites, setFavorites] = useState<number[]>([]);
  const {
    user
  } = useAuth();
  const propertiesPerPage = 9;

  // Charger les propriétés au chargement de la page et quand les filtres changent
  useEffect(() => {
    loadProperties();
  }, [currentPage, filters, sortOptions]);

  // Charger les favoris si l'utilisateur est connecté
  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  // Charger les options disponibles pour les filtres
  useEffect(() => {
    loadFilterOptions();
  }, []);

  // Fonction pour charger les options de filtres
  const loadFilterOptions = async () => {
    try {
      // Pour les pays - utiliser une sélection distincte
      const {
        data: countriesData,
        error: countriesError
      } = await supabase.from('Gadait_Listings_Buy').select('country').not('country', 'is', null);
      if (countriesError) throw countriesError;

      // Filtrer manuellement pour obtenir des valeurs uniques
      const uniqueCountries = [...new Set(countriesData.map(item => item.country))].sort();

      // Pour les villes - utiliser une sélection distincte
      const {
        data: citiesData,
        error: citiesError
      } = await supabase.from('Gadait_Listings_Buy').select('city').not('city', 'is', null);
      if (citiesError) throw citiesError;

      // Filtrer manuellement pour obtenir des valeurs uniques
      const uniqueCities = [...new Set(citiesData.map(item => item.city))].sort();

      // Pour les types de propriété - utiliser une sélection distincte
      const {
        data: propertyTypesData,
        error: propertyTypesError
      } = await supabase.from('Gadait_Listings_Buy').select('Property Type').not('Property Type', 'is', null);
      if (propertyTypesError) throw propertyTypesError;

      // Filtrer manuellement pour obtenir des valeurs uniques
      const uniquePropertyTypes = [...new Set(propertyTypesData.map(item => item["Property Type"]))].sort();
      setAvailableFilters({
        countries: uniqueCountries.filter(Boolean) as string[],
        cities: uniqueCities.filter(Boolean) as string[],
        propertyTypes: uniquePropertyTypes.filter(Boolean) as string[]
      });
    } catch (error) {
      console.error("Erreur lors du chargement des options de filtre:", error);
    }
  };

  // Fonction pour charger les favoris de l'utilisateur
  const loadFavorites = async () => {
    if (!user?.id) return;
    try {
      const {
        data,
        error
      } = await supabase.from('user_favorites').select('property_position').eq('user_id', user.id);
      if (error) throw error;
      const favoritePositions = data.map(f => f.property_position);
      setFavorites(favoritePositions);
    } catch (error) {
      console.error("Erreur lors du chargement des favoris:", error);
    }
  };

  // Fonction pour ajouter/supprimer un favori
  const toggleFavorite = async (propertyPosition: number) => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour ajouter des favoris",
        variant: "destructive"
      });
      return;
    }
    const isFavorite = favorites.includes(propertyPosition);
    try {
      if (isFavorite) {
        // Supprimer des favoris
        await supabase.from('user_favorites').delete().eq('user_id', user.id).eq('property_position', propertyPosition);
        setFavorites(prev => prev.filter(pos => pos !== propertyPosition));
        toast({
          title: "Favori supprimé",
          description: "La propriété a été supprimée de vos favoris"
        });
      } else {
        // Ajouter aux favoris
        await supabase.from('user_favorites').insert({
          user_id: user.id,
          property_position: propertyPosition
        });
        setFavorites(prev => [...prev, propertyPosition]);
        toast({
          title: "Favori ajouté",
          description: "La propriété a été ajoutée à vos favoris"
        });
      }
    } catch (error) {
      console.error("Erreur lors de la gestion des favoris:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la gestion des favoris",
        variant: "destructive"
      });
    }
  };

  // Fonction pour partager une propriété
  const shareProperty = (property: GadaitProperty, method: 'whatsapp' | 'email') => {
    if (!property["Property Link"]) {
      toast({
        title: "Erreur",
        description: "Aucun lien disponible pour cette propriété",
        variant: "destructive"
      });
      return;
    }
    const propertyLink = property["Property Link"];
    const propertyTitle = property.Title || "Propriété de luxe";
    if (method === 'whatsapp') {
      // Partager via WhatsApp
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${propertyTitle} - ${propertyLink}`)}`;
      window.open(whatsappUrl, '_blank');
    } else if (method === 'email') {
      // Partager via email
      const mailtoUrl = `mailto:?subject=${encodeURIComponent(`Propriété: ${propertyTitle}`)}&body=${encodeURIComponent(`Découvrez cette propriété : ${propertyTitle}\n\n${propertyLink}`)}`;
      window.location.href = mailtoUrl;
    }
  };

  // Fonction pour charger les propriétés
  const loadProperties = async () => {
    setIsLoading(true);
    try {
      console.log("Chargement des propriétés depuis Supabase avec filtres:", filters);

      // Construire la requête de base
      let query = supabase.from('Gadait_Listings_Buy').select('*', {
        count: 'exact'
      });

      // Appliquer les filtres
      if (filters.country) {
        query = query.eq('country', filters.country);
      }
      if (filters.city) {
        query = query.eq('city', filters.city);
      }
      if (filters.propertyType) {
        query = query.eq('Property Type', filters.propertyType);
      }
      if (filters.bedrooms && filters.bedrooms > 0) {
        query = query.gte('Bedrooms', filters.bedrooms);
      }
      if (filters.favoritesOnly && favorites.length > 0) {
        query = query.in('Position', favorites);
      }

      // Gérer le tri
      if (sortOptions.field === 'price') {
        // Note: Le tri par prix est approximatif car les prix sont stockés comme texte
        // Dans un cas idéal, il faudrait avoir une colonne numérique pour le prix
        query = query.order('price', {
          ascending: sortOptions.direction === 'asc'
        });
      } else {
        // Tri par défaut sur la position
        query = query.order('Position', {
          ascending: true
        });
      }

      // Paginer les résultats
      const from = (currentPage - 1) * propertiesPerPage;
      const to = from + propertiesPerPage - 1;
      query = query.range(from, to);
      const {
        data,
        count,
        error
      } = await query;
      if (error) {
        console.error("Erreur lors de la récupération des propriétés:", error);
        throw error;
      }
      console.log(`${data?.length || 0} propriétés récupérées sur ${count} total`);
      setTotalProperties(count || 0);
      setProperties(data || []);

      // Appliquer les filtres de prix côté client (car stockés comme texte)
      if (filters.minPrice || filters.maxPrice) {
        const filteredByPrice = (data || []).filter(property => {
          const numericPrice = extractNumericPrice(property.price);
          const minPriceValue = filters.minPrice ? parseFloat(filters.minPrice) : 0;
          const maxPriceValue = filters.maxPrice ? parseFloat(filters.maxPrice) : Infinity;
          return numericPrice >= minPriceValue && numericPrice <= maxPriceValue;
        });
        setProperties(filteredByPrice);
        setTotalProperties(filteredByPrice.length);
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

  // Fonction pour actualiser manuellement les données
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setSyncStatus("Synchronisation en cours...");
    try {
      // Récupérer le token de session
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      console.log("Appel de la fonction de synchronisation...");
      const response = await fetch('https://hxqoqkfnhbpwzkjgukrc.supabase.co/functions/v1/properties-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
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
        loadProperties();
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
    const additionalImages = [property["Additional Image 1"], property["Additional Image 2"], property["Additional Image 3"], property["Additional Image 4"], property["Additional Image 5"]];
    for (const img of additionalImages) {
      if (img) return img;
    }

    // Sinon, utiliser le placeholder par défaut
    return '/placeholder.svg';
  };

  // Handler pour réinitialiser tous les filtres
  const resetFilters = () => {
    setFilters({
      country: null,
      city: null,
      propertyType: null,
      minPrice: null,
      maxPrice: null,
      bedrooms: null,
      favoritesOnly: false
    });
    setCurrentPage(1);
  };

  // Calculer le nombre total de pages
  const totalPages = Math.ceil(totalProperties / propertiesPerPage);

  // Générer les numéros de page pour la pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5; // Nombre maximum de pages visibles dans la pagination

    if (totalPages <= maxVisiblePages) {
      // Afficher toutes les pages si leur nombre est inférieur au maximum
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Calculer quelles pages afficher
      const halfVisiblePages = Math.floor(maxVisiblePages / 2);
      if (currentPage <= halfVisiblePages + 1) {
        // On est proche du début
        for (let i = 1; i <= maxVisiblePages - 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - halfVisiblePages) {
        // On est proche de la fin
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - (maxVisiblePages - 2); i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        // On est au milieu
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }
    return pageNumbers;
  };

  // Compter les filtres actifs
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.country) count++;
    if (filters.city) count++;
    if (filters.propertyType) count++;
    if (filters.minPrice) count++;
    if (filters.maxPrice) count++;
    if (filters.bedrooms) count++;
    if (filters.favoritesOnly) count++;
    return count;
  }, [filters]);
  return <>
      <Navbar />
      <SubNavigation />
      <div className="p-4 md:p-6 bg-white min-h-screen">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-2xl text-loro-navy font-normal md:text-lg">Propriétés de luxe à vendre</h1>
              <p className="text-gray-500 mt-1">{totalProperties} propriétés trouvées</p>
            </div>
            
            <div className="flex gap-2 mt-4 md:mt-0">
              <Button variant="outline" size="sm" className="flex items-center gap-2 text-loro-navy border-loro-navy/30" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
                {viewMode === 'grid' ? <LayoutList className="h-4 w-4" /> : <Grid3x3 className="h-4 w-4" />}
                {viewMode === 'grid' ? 'Vue liste' : 'Vue grille'}
              </Button>
              
              {/* Bouton de filtre avec panneau latéral */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant={activeFiltersCount > 0 ? "default" : "outline"} size="sm" className="flex items-center gap-2 text-loro-navy border-loro-navy/30 relative">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filtres
                    {activeFiltersCount > 0 && <span className="absolute -top-1 -right-1 bg-white text-primary rounded-full h-5 w-5 flex items-center justify-center text-xs">
                        {activeFiltersCount}
                      </span>}
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Filtres</SheetTitle>
                    <SheetDescription>
                      Affinez votre recherche de propriétés
                    </SheetDescription>
                  </SheetHeader>
                  
                  <div className="py-4 space-y-6">
                    {/* Filtre par pays */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Pays</h4>
                      <Select value={filters.country || ""} onValueChange={value => {
                      setFilters(prev => ({
                        ...prev,
                        country: value || null
                      }));
                      setCurrentPage(1);
                    }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Tous les pays" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Tous les pays</SelectItem>
                          {availableFilters.countries.map(country => <SelectItem key={country} value={country}>{country}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Filtre par ville */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Ville</h4>
                      <Select value={filters.city || ""} onValueChange={value => {
                      setFilters(prev => ({
                        ...prev,
                        city: value || null
                      }));
                      setCurrentPage(1);
                    }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Toutes les villes" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Toutes les villes</SelectItem>
                          {availableFilters.cities.map(city => <SelectItem key={city} value={city}>{city}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Filtre par type de propriété */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Type de bien</h4>
                      <Select value={filters.propertyType || ""} onValueChange={value => {
                      setFilters(prev => ({
                        ...prev,
                        propertyType: value || null
                      }));
                      setCurrentPage(1);
                    }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Tous les types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Tous les types</SelectItem>
                          {availableFilters.propertyTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Filtre par nombre de chambres */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Chambres (minimum)</h4>
                      <Select value={filters.bedrooms?.toString() || ""} onValueChange={value => {
                      setFilters(prev => ({
                        ...prev,
                        bedrooms: value ? parseInt(value) : null
                      }));
                      setCurrentPage(1);
                    }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Toutes" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Toutes</SelectItem>
                          <SelectItem value="1">1+ chambre</SelectItem>
                          <SelectItem value="2">2+ chambres</SelectItem>
                          <SelectItem value="3">3+ chambres</SelectItem>
                          <SelectItem value="4">4+ chambres</SelectItem>
                          <SelectItem value="5">5+ chambres</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Filtre par budget */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Budget</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Input type="text" placeholder="Prix min" value={filters.minPrice || ""} onChange={e => setFilters(prev => ({
                          ...prev,
                          minPrice: e.target.value || null
                        }))} />
                        </div>
                        <div>
                          <Input type="text" placeholder="Prix max" value={filters.maxPrice || ""} onChange={e => setFilters(prev => ({
                          ...prev,
                          maxPrice: e.target.value || null
                        }))} />
                        </div>
                      </div>
                    </div>
                    
                    {/* Filtre pour favoris seulement */}
                    {user && <div className="flex items-center space-x-2">
                        <Checkbox id="favoris" checked={filters.favoritesOnly} onCheckedChange={checked => {
                      setFilters(prev => ({
                        ...prev,
                        favoritesOnly: Boolean(checked)
                      }));
                      setCurrentPage(1);
                    }} />
                        <label htmlFor="favoris" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Afficher uniquement mes favoris
                        </label>
                      </div>}
                  </div>
                  
                  <SheetFooter className="sm:justify-start gap-2 mt-4">
                    <Button variant="default" onClick={() => {
                    resetFilters();
                    setCurrentPage(1);
                  }}>
                      Réinitialiser les filtres
                    </Button>
                    <SheetClose asChild>
                      <Button variant="outline">Fermer</Button>
                    </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>

              {/* Menu déroulant pour le tri */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-1 text-loro-navy border-loro-navy/30">
                    <Filter className="h-4 w-4" />
                    {sortOptions.field === 'price' ? `Prix ${sortOptions.direction === 'asc' ? '↑' : '↓'}` : 'Tri par défaut'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSortOptions({
                  field: 'position',
                  direction: 'asc'
                })}>
                    Tri par défaut
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortOptions({
                  field: 'price',
                  direction: 'asc'
                })}>
                    Prix croissant
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortOptions({
                  field: 'price',
                  direction: 'desc'
                })}>
                    Prix décroissant
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button onClick={handleRefresh} disabled={isRefreshing} variant="outline" size="sm" className="flex items-center gap-1 text-loro-navy border-loro-navy/30">
                {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                Synchroniser
              </Button>
            </div>
          </div>
          
          {/* Affichage des filtres actifs */}
          {activeFiltersCount > 0 && <div className="mb-4 flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-500">Filtres actifs:</span>
              
              {filters.country && <Badge className="bg-loro-navy/10 text-loro-navy hover:bg-loro-navy/20 border-0" onClick={() => setFilters(prev => ({
            ...prev,
            country: null
          }))}>
                  Pays: {filters.country} <CircleX className="ml-1 h-3 w-3" />
                </Badge>}
              
              {filters.city && <Badge className="bg-loro-navy/10 text-loro-navy hover:bg-loro-navy/20 border-0" onClick={() => setFilters(prev => ({
            ...prev,
            city: null
          }))}>
                  Ville: {filters.city} <CircleX className="ml-1 h-3 w-3" />
                </Badge>}
              
              {filters.propertyType && <Badge className="bg-loro-navy/10 text-loro-navy hover:bg-loro-navy/20 border-0" onClick={() => setFilters(prev => ({
            ...prev,
            propertyType: null
          }))}>
                  Type: {filters.propertyType} <CircleX className="ml-1 h-3 w-3" />
                </Badge>}
              
              {filters.bedrooms && <Badge className="bg-loro-navy/10 text-loro-navy hover:bg-loro-navy/20 border-0" onClick={() => setFilters(prev => ({
            ...prev,
            bedrooms: null
          }))}>
                  {filters.bedrooms}+ chambres <CircleX className="ml-1 h-3 w-3" />
                </Badge>}
              
              {filters.minPrice && <Badge className="bg-loro-navy/10 text-loro-navy hover:bg-loro-navy/20 border-0" onClick={() => setFilters(prev => ({
            ...prev,
            minPrice: null
          }))}>
                  Min: {filters.minPrice}€ <CircleX className="ml-1 h-3 w-3" />
                </Badge>}
              
              {filters.maxPrice && <Badge className="bg-loro-navy/10 text-loro-navy hover:bg-loro-navy/20 border-0" onClick={() => setFilters(prev => ({
            ...prev,
            maxPrice: null
          }))}>
                  Max: {filters.maxPrice}€ <CircleX className="ml-1 h-3 w-3" />
                </Badge>}
              
              {filters.favoritesOnly && <Badge className="bg-loro-navy/10 text-loro-navy hover:bg-loro-navy/20 border-0" onClick={() => setFilters(prev => ({
            ...prev,
            favoritesOnly: false
          }))}>
                  Favoris uniquement <CircleX className="ml-1 h-3 w-3" />
                </Badge>}
              
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground h-7" onClick={resetFilters}>
                Effacer tout
              </Button>
            </div>}
          
          {syncStatus && <div className={`mb-4 p-3 rounded ${syncStatus.startsWith('Erreur') ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
              {syncStatus}
            </div>}
          
          {isLoading ? <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-loro-navy" />
            </div> : properties.length === 0 ? <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Aucune propriété ne correspond à vos critères.</p>
              {activeFiltersCount > 0 ? <Button onClick={resetFilters} variant="outline">
                  Réinitialiser les filtres
                </Button> : <Button onClick={handleRefresh} variant="outline">
                  Synchroniser les propriétés
                </Button>}
            </div> : <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
              {properties.map(property => <Card key={property.Position} className="overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
                  <div className={`${viewMode === 'grid' ? 'aspect-video' : 'aspect-[3/1]'} w-full relative`}>
                    <img src={getPropertyImage(property)} alt={property.Title || "Propriété"} className="object-cover w-full h-full" onError={() => handleImageError(property.Position)} />
                    
                    {/* Bouton favoris */}
                    <button className="absolute top-2 right-2 bg-white/80 rounded-full p-2 hover:bg-white transition-colors" onClick={() => toggleFavorite(property.Position)}>
                      <Heart className={`w-5 h-5 ${favorites.includes(property.Position) ? 'text-red-500 fill-red-500' : 'text-gray-600'} hover:scale-110 transition-transform`} />
                    </button>
                    
                    {/* Bouton partager */}
                    <div className="absolute top-2 right-12 dropdown-button">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="bg-white/80 rounded-full p-2 hover:bg-white transition-colors">
                            <Share className="w-5 h-5 text-gray-600" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => shareProperty(property, 'whatsapp')}>
                            Partager via WhatsApp
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => shareProperty(property, 'email')}>
                            Partager par email
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    {/* Badges pour type de propriété */}
                    <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
                      {property["Property Type"] && <Badge className="bg-loro-navy/80 text-white hover:bg-loro-navy border-0">
                          {property["Property Type"]}
                        </Badge>}
                      
                      {/* Badge "Nouveau" */}
                      {property.is_new && <Badge className="bg-loro-terracotta/80 text-white border-0 hover:bg-loro-terracotta">
                          Nouveau
                        </Badge>}
                      
                      {/* Badge "Exclusivité" */}
                      {property.is_exclusive && <Badge className="bg-amber-500/80 text-white border-0 hover:bg-amber-500">
                          Exclusivité
                        </Badge>}
                    </div>
                  </div>
                  
                  <CardContent className={`p-4 ${viewMode === 'list' ? 'md:flex md:justify-between md:items-start' : ''}`}>
                    <div className={`${viewMode === 'list' ? 'md:w-1/2 lg:w-2/3' : ''}`}>
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold line-clamp-2">{property.Title || "Propriété sans titre"}</h3>
                        {favorites.includes(property.Position) && <Star className="h-4 w-4 text-amber-500 ml-2" />}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span>{property.city || property.country || 'Emplacement non spécifié'}</span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm">
                        {property["Property Type"] && <div className="flex items-center">
                            <Home className="w-4 h-4 mr-1 text-loro-navy flex-shrink-0" />
                            <span>{property["Property Type"]}</span>
                          </div>}
                        
                        {property.Bedrooms !== null && <div className="flex items-center">
                            <BedDouble className="w-4 h-4 mr-1 text-loro-navy flex-shrink-0" />
                            <span>{property.Bedrooms} ch.</span>
                          </div>}
                        
                        {property.Area && <div className="flex items-center">
                            <span>{property.Area}</span>
                          </div>}
                      </div>
                    </div>
                    
                    <div className={`mt-4 ${viewMode === 'list' ? 'md:mt-0 md:w-1/2 lg:w-1/3 md:flex md:flex-col md:items-end' : ''}`}>
                      <div className="texte en terracota">
                        {formatPrice(property.price)}
                      </div>
                      
                      <Button variant="outline" size="sm" className={`${viewMode === 'list' ? 'ml-auto' : ''} flex items-center gap-1 border-loro-navy/30 text-loro-navy`} onClick={() => property["Property Link"] && window.open(property["Property Link"], '_blank')}>
                        Voir la propriété <ExternalLink className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>)}
            </div>}
          
          {/* Pagination */}
          {totalPages > 1 && <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)} className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} />
                </PaginationItem>
                
                {getPageNumbers().map((page, index) => <PaginationItem key={index}>
                    {page === '...' ? <span className="px-4 py-2">...</span> : <PaginationLink isActive={page === currentPage} onClick={() => typeof page === 'number' && setCurrentPage(page)} className="cursor-pointer">
                        {page}
                      </PaginationLink>}
                  </PaginationItem>)}
                
                <PaginationItem>
                  <PaginationNext onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)} className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>}
        </div>
      </div>
    </>;
};
export default PropertiesPage;