
import React, { useState, useEffect } from 'react';
import { LeadDetailed } from '@/types/lead';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, MapPin, BedDouble, Home, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { isToday } from 'date-fns';

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

const PropertiesTab: React.FC<PropertiesTabProps> = ({ leadId, lead }) => {
  const [properties, setProperties] = useState<GadaitProperty[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  // Charger les propriétés correspondant aux critères du lead
  useEffect(() => {
    const loadProperties = async () => {
      setIsLoading(true);
      try {
        console.log("Chargement des propriétés pour le lead:", leadId);
        let query = supabase
          .from('Gadait_Listings_Buy')
          .select('*')
          .order('Position', { ascending: true });
        
        // Filtrage par pays si spécifié
        if (lead.country) {
          query = query.eq('country', lead.country);
        }
        
        // Filtrage par type de propriété si spécifié
        if (lead.propertyTypes && lead.propertyTypes.length > 0) {
          // Chercher si l'un des types de propriété du lead correspond
          const propertyTypeConditions = lead.propertyTypes.map(type => `"Property Type".ilike.%${type}%`);
          query = query.or(propertyTypeConditions.join(','));
        }
        
        // Filtrage par nombre de chambres si spécifié
        if (lead.bedrooms) {
          const bedroomFilters = Array.isArray(lead.bedrooms) ? lead.bedrooms : [lead.bedrooms];
          if (bedroomFilters.length > 0) {
            // Pour les chambres, on prend les propriétés qui ont au moins le nombre minimum spécifié
            const minBedrooms = Math.min(...bedroomFilters.filter(b => typeof b === 'number') as number[]);
            query = query.gte('Bedrooms', minBedrooms);
          }
        }
        
        // Limiter à 20 résultats
        query = query.limit(20);
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        console.log(`${data?.length || 0} propriétés trouvées pour le lead`);
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
  }, [lead, leadId]);
  
  // Fonction pour actualiser manuellement les données
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setSyncStatus("Synchronisation en cours...");
    try {
      // Get the session token using the correct method
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
      console.log("Résultat de la synchronisation:", result);
      
      if (result.success) {
        setSyncStatus(`Succès: ${result.message}`);
        toast({
          title: "Synchronisation réussie",
          description: result.message
        });
        
        // Recharger les propriétés
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

  // Nouvelle fonction pour gérer les erreurs d'image
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
        <p className="text-gray-500 py-4 text-center">
          Aucune propriété ne correspond aux critères du lead. Essayez d'élargir les filtres.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
    </div>
  );
};

export default PropertiesTab;
