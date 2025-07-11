import React, { useEffect, useState } from 'react';
import { LeadDetailed } from '@/types/lead';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Home, Building2, Sparkles, Mail, Share2, X } from 'lucide-react';
import PropertyCard from '@/components/pipeline/PropertyCard';
import PropertySkeleton from '@/components/pipeline/PropertySkeleton';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Card, CardContent } from '@/components/ui/card';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { useToast } from '@/hooks/use-toast';

// Use the Supabase generated type directly
import { Database } from '@/integrations/supabase/types';
type GadaitProperty = Database['public']['Tables']['gadait_properties']['Row'];

interface SuggestedPropertiesFullViewProps {
  lead: LeadDetailed;
}

const PROPERTIES_PER_PAGE = 12; // Moins de propriétés par page pour les suggestions

const SuggestedPropertiesFullView: React.FC<SuggestedPropertiesFullViewProps> = ({ lead }) => {
  const [properties, setProperties] = useState<GadaitProperty[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedProperties, setSelectedProperties] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSuggestedProperties();
  }, [lead.country, lead.desiredLocation, lead.propertyTypes, lead.budget, lead.bedrooms, currentPage]);

  const fetchSuggestedProperties = async () => {
    if (!lead.country && !lead.desiredLocation && !lead.propertyTypes?.length) {
      setProperties([]);
      setTotalCount(0);
      return;
    }

    setLoading(true);
    try {
      let query = supabase.from('gadait_properties').select('*', { count: 'exact' });

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

      // Pagination
      const startIndex = (currentPage - 1) * PROPERTIES_PER_PAGE;
      query = query.range(startIndex, startIndex + PROPERTIES_PER_PAGE - 1);

      // Order by price desc to show expensive properties first
      query = query.order('price', { ascending: false });

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching suggested properties:', error);
        return;
      }

      setProperties(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching suggested properties:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fonctions de gestion de la sélection
  const togglePropertySelection = (propertyId: string) => {
    setSelectedProperties(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(propertyId)) {
        newSelection.delete(propertyId);
      } else {
        newSelection.add(propertyId);
      }
      return newSelection;
    });
  };

  const clearSelection = () => {
    setSelectedProperties(new Set());
    setSelectionMode(false);
  };

  const selectAll = () => {
    setSelectedProperties(new Set(properties.map(p => p.id)));
  };

  const toggleSelectionMode = () => {
    if (selectionMode) {
      clearSelection();
    } else {
      setSelectionMode(true);
    }
  };

  // Fonction d'envoi par email (à implémenter)
  const sendPropertiesToClient = async () => {
    const selectedProps = properties.filter(p => selectedProperties.has(p.id));
    
    toast({
      title: "Sélection envoyée",
      description: `${selectedProps.length} propriété(s) envoyée(s) à ${lead.name}`,
    });
    
    // TODO: Implémenter l'envoi d'email
    console.log("Propriétés sélectionnées:", selectedProps);
    clearSelection();
  };

  const getSelectedProperties = () => {
    return properties.filter(p => selectedProperties.has(p.id));
  };

  const totalPages = Math.ceil(totalCount / PROPERTIES_PER_PAGE);
  const hasActiveFilters = lead.country || lead.desiredLocation || lead.propertyTypes?.length || lead.budget || lead.bedrooms;

  if (!hasActiveFilters) {
    return (
      <div className="space-y-4 pt-6 border-t border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-loro-terracotta" />
          <h3 className="text-lg font-normal text-brown-700">
            Propriétés suggérées
          </h3>
        </div>
        
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 font-futura">
            Remplissez les critères de recherche pour voir les propriétés suggérées
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4 pt-6 border-t border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-loro-terracotta" />
          <h3 className="text-lg font-normal text-brown-700">
            Propriétés suggérées
          </h3>
        </div>

        <div className="space-y-6">
          {/* Header skeleton */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-6 w-48 bg-loro-pearl rounded animate-pulse" />
              <div className="h-4 w-64 bg-loro-pearl rounded animate-pulse" />
            </div>
          </div>
          
          {/* Grid skeleton */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <PropertySkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-6 border-t border-gray-200">
      <div className="space-y-6">
        {/* En-tête moderne avec boutons de sélection */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-loro-sand" />
              <h3 className="text-xl font-futura font-medium text-loro-navy">
                Propriétés suggérées pour {lead.name}
              </h3>
            </div>
            <p className="text-loro-navy/70 font-futura text-sm">
              Sélection personnalisée basée sur les critères de recherche
            </p>
            <div className="flex items-center gap-2 mt-4">
              <Badge variant="outline" className="bg-white border-gray-200 text-gray-700 font-futura rounded-md px-2 py-0.5 text-xs font-normal tracking-wide shadow-none">
                <span className="text-xs font-medium">{properties.length} propriétés affichées</span>
              </Badge>
              <Badge variant="outline" className="bg-gray-50 border-gray-200 text-gray-600 font-futura rounded-md px-2 py-0.5 text-xs font-light tracking-wide shadow-none">
                <span className="text-xs font-light">{totalCount} au total</span>
              </Badge>
              {totalPages > 1 && (
                <Badge variant="outline" className="bg-gray-50 border-gray-200 text-gray-600 font-futura rounded-md px-2 py-0.5 text-xs font-light tracking-wide shadow-none">
                  <span className="text-xs font-light">Page {currentPage} sur {totalPages}</span>
                </Badge>
              )}
              {selectedProperties.size > 0 && (
                <Badge className="bg-blue-50 border-blue-200 text-blue-700 font-futura rounded-md px-2 py-0.5 text-xs font-medium tracking-wide shadow-none">
                  <span className="text-xs font-medium">{selectedProperties.size} sélectionnée(s)</span>
                </Badge>
              )}
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex items-center gap-2">
            <Button
              variant={selectionMode ? "default" : "outline"}
              size="sm"
              onClick={toggleSelectionMode}
              className="font-futura"
            >
              {selectionMode ? "Annuler" : "Sélectionner"}
            </Button>
            
            {selectionMode && (
              <Button
                variant="outline"
                size="sm"
                onClick={selectAll}
                className="font-futura"
              >
                Tout sélectionner
              </Button>
            )}
            
            {selectedProperties.size > 0 && (
              <Drawer>
                <DrawerTrigger asChild>
                  <Button
                    variant="default"
                    size="sm"
                    className="font-futura bg-loro-sand text-loro-navy hover:bg-loro-sand/90"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Envoyer ({selectedProperties.size})
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader>
                    <DrawerTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-loro-sand" />
                      Envoyer la sélection à {lead.name}
                    </DrawerTitle>
                  </DrawerHeader>
                  <div className="p-4 space-y-4">
                    <div className="grid gap-3 max-h-96 overflow-y-auto">
                      {getSelectedProperties().map((property) => (
                        <Card key={property.id} className="relative">
                          <CardContent className="p-3">
                            <div className="flex gap-3">
                              {property.main_image && (
                                <img
                                  src={property.main_image}
                                  alt={property.title}
                                  className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm text-loro-navy truncate">
                                  {property.title}
                                </h4>
                                <p className="text-xs text-loro-navy/70 truncate">
                                  {property.location}
                                </p>
                                <p className="text-sm font-semibold text-loro-sand">
                                  {property.price ? `${property.price.toLocaleString()} ${property.currency || 'EUR'}` : 'Prix sur demande'}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => togglePropertySelection(property.id)}
                                className="h-6 w-6 p-0 flex-shrink-0"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    
                    <div className="flex gap-2 pt-4 border-t">
                      <Button
                        variant="outline"
                        onClick={clearSelection}
                        className="flex-1 font-futura"
                      >
                        Annuler
                      </Button>
                      <Button
                        onClick={sendPropertiesToClient}
                        className="flex-1 font-futura bg-loro-sand text-loro-navy hover:bg-loro-sand/90"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Envoyer par email
                      </Button>
                    </div>
                  </div>
                </DrawerContent>
              </Drawer>
            )}
          </div>
        </div>

        {properties.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-futura font-medium text-loro-navy mb-2">
              Aucune propriété trouvée
            </h3>
            <p className="text-loro-navy/70 font-futura">
              Aucune propriété ne correspond aux critères actuels de {lead.name}
            </p>
          </div>
        ) : (
          <>
            {/* Grille des propriétés avec ReturnTo */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-fade-in">
              {properties.map(property => (
                <PropertyCard 
                  key={property.id} 
                  property={property}
                  returnTo="lead"
                  leadId={lead.id}
                  selectionMode={selectionMode}
                  isSelected={selectedProperties.has(property.id)}
                  onToggleSelection={togglePropertySelection}
                />
              ))}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'} 
                      />
                    </PaginationItem>
                    
                    {/* Pages numérotées */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }
                      
                      return (
                        <PaginationItem key={pageNumber}>
                          <PaginationLink
                            onClick={() => setCurrentPage(pageNumber)}
                            isActive={currentPage === pageNumber}
                            className="cursor-pointer"
                          >
                            {pageNumber}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'} 
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SuggestedPropertiesFullView;