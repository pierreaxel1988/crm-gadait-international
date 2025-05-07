
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from "@/components/ui/checkbox"
import { Heart, ExternalLink, MapPin, BedDouble, Home, Loader2, SlidersHorizontal } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { toast } from '@/hooks/use-toast';
import ActionButtons from '@/components/pipeline/filters/ActionButtons';

interface Property {
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
  isFavorite?: boolean;
}

interface FilterOptions {
  country: string | null;
  city: string | null;
  propertyType: string | null;
  minPrice: string | null;
  maxPrice: string | null;
  bedrooms: number | null;
  favoritesOnly: boolean;
}

interface FilterOptionsData {
  countries: string[];
  cities: string[];
  propertyTypes: string[];
}

const Properties: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(12);
  const [totalProperties, setTotalProperties] = useState<number>(0);
  const [filterOptions, setFilterOptions] = useState<FilterOptionsData>({
    countries: [],
    cities: [],
    propertyTypes: []
  });
  const [filters, setFilters] = useState<FilterOptions>({
    country: null,
    city: null,
    propertyType: null,
    minPrice: null,
    maxPrice: null,
    bedrooms: null,
    favoritesOnly: false
  });
  const [favoriteProperties, setFavoriteProperties] = useState<Set<number>>(new Set());

  // Function to process Select option data to ensure non-empty values
  const processSelectOptions = (options: string[] | null | undefined) => {
    if (!options) return [];
    
    // Filter out any empty strings and ensure values are unique
    return [...new Set(options.filter(option => option && option.trim() !== ""))];
  };

  // Load properties based on current filters and pagination
  const loadProperties = async () => {
    setLoading(true);
    console.log("Chargement des propriétés...");
    
    try {
      let query = supabase
        .from('Gadait_Listings_Buy')
        .select('*', { count: 'exact' });
      
      // Apply filters to the query
      if (filters.country) {
        query = query.eq('country', filters.country);
      }
      
      if (filters.city) {
        query = query.eq('city', filters.city);
      }
      
      if (filters.propertyType) {
        query = query.ilike('Property Type', `%${filters.propertyType}%`);
      }
      
      if (filters.bedrooms) {
        query = query.eq('Bedrooms', filters.bedrooms);
      }
      
      // Apply favorite filter
      if (filters.favoritesOnly) {
        const favoritesArray = Array.from(favoriteProperties);
        if (favoritesArray.length > 0) {
          query = query.in('Position', favoritesArray);
        } else {
          // If no favorites but filter is on, return no results
          setProperties([]);
          setTotalProperties(0);
          setLoading(false);
          return;
        }
      }
      
      // Apply pagination
      const startIndex = (currentPage - 1) * itemsPerPage;
      query = query.range(startIndex, startIndex + itemsPerPage - 1);
      
      // Apply order
      query = query.order('Position', { ascending: true });
      
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      console.log(`${data?.length || 0} propriétés récupérées sur ${count} total`);
      setTotalProperties(count || 0);
      
      // Initialize data array
      let filteredProperties = data || [];
      
      // Apply price filters client-side (since they're stored as text)
      if (filters.minPrice || filters.maxPrice) {
        filteredProperties = filteredProperties.filter(property => {
          const numericPrice = extractNumericPrice(property.price);
          const minPriceValue = filters.minPrice ? parseFloat(filters.minPrice) : 0;
          const maxPriceValue = filters.maxPrice ? parseFloat(filters.maxPrice) : Infinity;
          
          return numericPrice >= minPriceValue && numericPrice <= maxPriceValue;
        });
      }
      
      // Mark favorites
      filteredProperties = filteredProperties.map(property => ({
        ...property,
        isFavorite: favoriteProperties.has(property.Position)
      }));
      
      setProperties(filteredProperties);
      
      // Update total count if price filters are applied
      if (filters.minPrice || filters.maxPrice) {
        setTotalProperties(filteredProperties.length);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des propriétés:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les propriétés",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Load filter options from the database
  const loadFilterOptions = async () => {
    console.log("Chargement des options de filtre...");

    try {
      // Get countries
      const { data: countriesData, error: countriesError } = await supabase
        .from('Gadait_Listings_Buy')
        .select('country')
        .not('country', 'is', null);
      
      if (countriesError) throw countriesError;
      
      // Get cities
      const { data: citiesData, error: citiesError } = await supabase
        .from('Gadait_Listings_Buy')
        .select('city')
        .not('city', 'is', null);
      
      if (citiesError) throw citiesError;
      
      // Get property types
      const { data: typesData, error: typesError } = await supabase
        .from('Gadait_Listings_Buy')
        .select('"Property Type"')
        .not('Property Type', 'is', null);
      
      if (typesError) throw typesError;
      
      // Process the data to get unique values and handle empty strings
      const countries = processSelectOptions(countriesData.map(item => item.country));
      const cities = processSelectOptions(citiesData.map(item => item.city));
      const propertyTypes = processSelectOptions(typesData.map(item => item["Property Type"]));
      
      setFilterOptions({
        countries,
        cities,
        propertyTypes
      });
    } catch (error) {
      console.error("Erreur lors du chargement des options de filtre:", error);
    }
  };

  // Load favorite properties from local storage
  useEffect(() => {
    const storedFavorites = localStorage.getItem('favoriteProperties');
    if (storedFavorites) {
      setFavoriteProperties(new Set(JSON.parse(storedFavorites)));
    }
  }, []);

  // Save favorite properties to local storage
  useEffect(() => {
    localStorage.setItem('favoriteProperties', JSON.stringify(Array.from(favoriteProperties)));
  }, [favoriteProperties]);

  // Load properties and filter options on component mount
  useEffect(() => {
    loadProperties();
    loadFilterOptions();
  }, [currentPage]);

  // Function to extract numeric price from string
  const extractNumericPrice = (price: string | null): number => {
    if (!price) return 0;
    const numericString = price.replace(/[^\d]/g, '');
    return parseFloat(numericString) || 0;
  };

  // Function to toggle favorite status
  const toggleFavorite = (propertyPosition: number) => {
    const newFavorites = new Set(favoriteProperties);
    if (newFavorites.has(propertyPosition)) {
      newFavorites.delete(propertyPosition);
    } else {
      newFavorites.add(propertyPosition);
    }
    setFavoriteProperties(newFavorites);
  };

  // Handler to reset all filters
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
    toast({
      title: "Filtres réinitialisés",
      description: "Tous les filtres ont été supprimés",
      duration: 2000
    });
  };

  // Handler to apply filters
  const applyFilters = useCallback(() => {
    setCurrentPage(1);
    loadProperties();
    toast({
      title: "Filtres appliqués",
      description: `${activeFiltersCount()} filtres actifs`,
      duration: 2000
    });
  }, [filters]);

  // Calculate total pages
  const totalPages = Math.ceil(totalProperties / itemsPerPage);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Calculate active filters count
  const activeFiltersCount = () => {
    let count = 0;
    if (filters.country) count++;
    if (filters.city) count++;
    if (filters.propertyType) count++;
    if (filters.minPrice) count++;
    if (filters.maxPrice) count++;
    if (filters.bedrooms) count++;
    if (filters.favoritesOnly) count++;
    return count;
  };

  return (
    <div className="container py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Propriétés</h1>
        <div className="flex gap-4">
          {/* Filter Panel */}
          <Sheet>
            <SheetTrigger asChild>
              <Button className="gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Filtres {activeFiltersCount() > 0 && <Badge className="ml-1">{activeFiltersCount()}</Badge>}
              </Button>
            </SheetTrigger>
            <SheetContent className="overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filtres</SheetTitle>
                <SheetDescription>
                  Affinez votre recherche avec les filtres ci-dessous.
                </SheetDescription>
              </SheetHeader>
              
              <div className="py-4 flex flex-col gap-4">
                {/* Country filter */}
                <div className="grid gap-2">
                  <Label htmlFor="country">Pays</Label>
                  <Select
                    value={filters.country || ""}
                    onValueChange={(value) => {
                      setFilters(prev => ({ ...prev, country: value === "placeholder" ? null : value }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les pays" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="placeholder">Tous les pays</SelectItem>
                      {filterOptions.countries.map(country => (
                        <SelectItem key={country} value={country}>{country}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* City filter */}
                <div className="grid gap-2">
                  <Label htmlFor="city">Ville</Label>
                  <Select
                    value={filters.city || ""}
                    onValueChange={(value) => {
                      setFilters(prev => ({ ...prev, city: value === "placeholder" ? null : value }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes les villes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="placeholder">Toutes les villes</SelectItem>
                      {filterOptions.cities.map(city => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Property type filter */}
                <div className="grid gap-2">
                  <Label htmlFor="type">Type de bien</Label>
                  <Select
                    value={filters.propertyType || ""}
                    onValueChange={(value) => {
                      setFilters(prev => ({ ...prev, propertyType: value === "placeholder" ? null : value }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="placeholder">Tous les types</SelectItem>
                      {filterOptions.propertyTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Bedrooms filter */}
                <div className="grid gap-2">
                  <Label htmlFor="bedrooms">Chambres</Label>
                  <Select
                    value={filters.bedrooms?.toString() || ""}
                    onValueChange={(value) => {
                      setFilters(prev => ({ ...prev, bedrooms: value === "placeholder" ? null : parseInt(value) }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Nombre de chambres" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="placeholder">Toutes les chambres</SelectItem>
                      {[1, 2, 3, 4, 5, 6].map(num => (
                        <SelectItem key={num} value={num.toString()}>{num}+ chambres</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Price range filters */}
                <div className="grid gap-2">
                  <Label>Fourchette de prix</Label>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label htmlFor="minPrice" className="text-xs">Min</Label>
                      <Input
                        id="minPrice"
                        type="number"
                        placeholder="Min"
                        value={filters.minPrice || ""}
                        onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value || null }))}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="maxPrice" className="text-xs">Max</Label>
                      <Input
                        id="maxPrice"
                        type="number"
                        placeholder="Max"
                        value={filters.maxPrice || ""}
                        onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value || null }))}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Favorites filter */}
                <div className="flex items-center space-x-2 mt-4">
                  <Checkbox
                    id="favoris"
                    checked={filters.favoritesOnly}
                    onCheckedChange={(checked) => {
                      setFilters(prev => ({ ...prev, favoritesOnly: Boolean(checked) }));
                    }}
                  />
                  <label htmlFor="favoris" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Afficher uniquement mes favoris
                  </label>
                </div>
              </div>
              
              <ActionButtons
                onClear={resetFilters}
                onApply={applyFilters}
              />
              
              <div className="mt-4">
                <SheetClose>
                  <Button variant="ghost" className="w-full">Fermer</Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : properties.length === 0 ? (
        <p className="text-gray-500 py-4 text-center">Aucune propriété ne correspond aux critères de recherche.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map(property => (
            <Card key={property.Position} className="overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
              <div className="aspect-video w-full relative">
                <img
                  src={property["Main Image"] || property["Secondary Image"] || '/placeholder.svg'}
                  alt={property.Title || "Propriété"}
                  className="object-cover w-full h-full"
                />
                {property["Property Type"] && (
                  <div className="absolute bottom-2 left-2 bg-black/80 text-white px-3 py-1 rounded-full text-xs font-medium">
                    {property["Property Type"]}
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold line-clamp-1">{property.Title || "Propriété sans titre"}</h3>
                  <div className="text-lg font-bold text-blue-500">
                    {property.price || "Prix sur demande"}
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{property.city || property.country || 'Non spécifié'}</span>
                </div>
                <div className="flex items-center gap-4 mt-3 text-sm">
                  {property["Property Type"] && (
                    <div className="flex items-center">
                      <Home className="w-4 h-4 mr-1 text-gray-700" />
                      <span>{property["Property Type"]}</span>
                    </div>
                  )}
                  {property.Bedrooms !== null && (
                    <div className="flex items-center">
                      <BedDouble className="w-4 h-4 mr-1 text-gray-700" />
                      <span>{property.Bedrooms} ch.</span>
                    </div>
                  )}
                  {property.Area && (
                    <div>
                      {property.Area}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center p-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => property["Property Link"] && window.open(property["Property Link"], '_blank')}
                >
                  Voir <ExternalLink className="w-3.5 h-3.5 ml-1" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleFavorite(property.Position)}
                >
                  <Heart
                    className={`w-5 h-5 ${favoriteProperties.has(property.Position) ? 'text-red-500 fill-red-500' : 'text-gray-500'}`}
                  />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalProperties > itemsPerPage && (
        <div className="mt-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) handlePageChange(currentPage - 1);
                  }}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Show first page, last page, current page and one page before and after current page
                let pageNum: number | null = null;
                
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  const pages = [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
                  pageNum = pages[i];
                }
                
                if (pageNum === null || pageNum < 1 || pageNum > totalPages) {
                  return null;
                }
                
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(pageNum as number);
                      }}
                      isActive={currentPage === pageNum}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) handlePageChange(currentPage + 1);
                  }}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default Properties;
