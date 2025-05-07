import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import SubNavigation from '@/components/layout/SubNavigation';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, MapPin, BedDouble, Home, Loader2, Filter, ArrowRight, ArrowLeft, Heart, Grid3x3, LayoutList } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
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
const PropertiesPage = () => {
  const [properties, setProperties] = useState<GadaitProperty[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalProperties, setTotalProperties] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const propertiesPerPage = 9;

  // Charger les propriétés au chargement de la page
  useEffect(() => {
    loadProperties();
  }, [currentPage]);

  // Fonction pour charger les propriétés
  const loadProperties = async () => {
    setIsLoading(true);
    try {
      console.log("Chargement des propriétés depuis Supabase (table Gadait_Listings_Buy)...");

      // Récupérer d'abord le nombre total de propriétés pour la pagination
      const countResponse = await supabase.from('Gadait_Listings_Buy').select('Position', {
        count: 'exact',
        head: true
      });
      console.log("Nombre total de propriétés:", countResponse.count);
      setTotalProperties(countResponse.count || 0);

      // Récupérer les propriétés pour la page actuelle
      const {
        data,
        error
      } = await supabase.from('Gadait_Listings_Buy').select('*').range((currentPage - 1) * propertiesPerPage, currentPage * propertiesPerPage - 1).order('Position', {
        ascending: true
      });
      if (error) {
        console.error("Erreur lors de la récupération des propriétés:", error);
        throw error;
      }
      console.log(`${data?.length || 0} propriétés récupérées:`, data);
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
              <Button variant="outline" size="sm" className="flex items-center gap-2 text-loro-navy border-loro-navy/30">
                <Filter className="h-4 w-4" />
                Filtrer
              </Button>
              <Button onClick={handleRefresh} disabled={isRefreshing} variant="outline" size="sm" className="flex items-center gap-1 text-loro-navy border-loro-navy/30">
                {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                Synchroniser
              </Button>
            </div>
          </div>
          
          {syncStatus && <div className={`mb-4 p-3 rounded ${syncStatus.startsWith('Erreur') ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
              {syncStatus}
            </div>}
          
          {isLoading ? <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-loro-navy" />
            </div> : properties.length === 0 ? <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Aucune propriété disponible pour le moment.</p>
              <Button onClick={handleRefresh} variant="outline">
                Synchroniser les propriétés
              </Button>
            </div> : <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
              {properties.map(property => <Card key={property.Position} className="overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
                  <div className={`${viewMode === 'grid' ? 'aspect-video' : 'aspect-[3/1]'} w-full relative`}>
                    <img src={getPropertyImage(property)} alt={property.Title || "Propriété"} className="object-cover w-full h-full" onError={() => handleImageError(property.Position)} />
                    <button className="absolute top-2 right-2 bg-white/80 rounded-full p-2 hover:bg-white transition-colors">
                      <Heart className="w-5 h-5 text-gray-600 hover:text-red-500 transition-colors" />
                    </button>
                    {property["Property Type"] && <div className="absolute bottom-2 left-2 bg-loro-navy/80 text-white px-3 py-1 rounded-full text-xs font-medium">
                        {property["Property Type"]}
                      </div>}
                  </div>
                  
                  <CardContent className={`p-4 ${viewMode === 'list' ? 'md:flex md:justify-between md:items-start' : ''}`}>
                    <div className={`${viewMode === 'list' ? 'md:w-1/2 lg:w-2/3' : ''}`}>
                      <h3 className="text-lg font-semibold line-clamp-2 mb-2">{property.Title || "Propriété sans titre"}</h3>
                      
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
                      <div className={`${viewMode === 'list' ? 'text-right' : ''} text-lg font-bold text-loro-terracotta mb-2`}>
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