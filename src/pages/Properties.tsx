
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import SubNavigation from '@/components/layout/SubNavigation';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, MapPin, BedDouble, Home, ArrowRight, Loader2, Filter } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { isToday } from 'date-fns';

interface Property {
  id: string;
  title: string;
  property_type: string;
  bedrooms: number | null;
  area: number | null;
  area_unit: string;
  price: number | null;
  currency: string;
  location: string | null;
  country: string | null;
  url: string | null;
  images: string[];
  created_at: string;
  updated_at: string;
}

const formatPrice = (price: number | null, currency: string) => {
  if (!price) return "Prix sur demande";
  
  const currencySymbol = 
    currency === 'EUR' ? '€' :
    currency === 'USD' ? '$' : 
    currency === 'GBP' ? '£' : '';
    
  return `${currencySymbol}${price.toLocaleString('fr-FR')}`;
};

const PropertiesPage = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Charger les propriétés au chargement de la page
  useEffect(() => {
    loadProperties();
  }, []);
  
  // Fonction pour charger les propriétés
  const loadProperties = async () => {
    setIsLoading(true);
    try {
      console.log("Chargement des propriétés depuis Supabase...");
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      console.log(`${data?.length || 0} propriétés récupérées`);
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
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      
      console.log("Appel de la fonction de synchronisation...");
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

  // Vérifier si une date est aujourd'hui
  const isUpdatedToday = (dateString: string) => {
    if (!dateString) return false;
    return isToday(new Date(dateString));
  };

  return (
    <>
      <Navbar />
      <SubNavigation />
      <div className="p-4 md:p-6 bg-white min-h-screen">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-loro-navy">Propriétés</h1>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="hidden md:flex items-center gap-2 text-loro-navy border-loro-navy/30"
              >
                <Filter className="h-4 w-4" />
                Filtrer
              </Button>
              <Button 
                onClick={handleRefresh}
                disabled={isRefreshing}
                variant="outline"
                size="sm"
                className="flex items-center gap-1 text-loro-navy border-loro-navy/30"
              >
                {isRefreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : null}
                Synchroniser
              </Button>
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
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Aucune propriété disponible pour le moment.</p>
              <Button onClick={handleRefresh} variant="outline">
                Synchroniser les propriétés
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <Card key={property.id} className="overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="aspect-video w-full relative">
                    {property.images && property.images.length > 0 ? (
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          // Fallback en cas d'erreur de chargement d'image
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <Home className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Badge pour les propriétés mises à jour aujourd'hui */}
                    {isUpdatedToday(property.updated_at) && (
                      <div className="absolute top-2 right-2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                        🔁 Mis à jour aujourd'hui
                      </div>
                    )}
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold line-clamp-1">{property.title}</h3>
                      <div className="text-lg font-bold text-loro-terracotta">
                        {formatPrice(property.price, property.currency)}
                      </div>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{property.location || property.country || 'Maurice'}</span>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-3 text-sm">
                      {property.property_type && (
                        <div className="flex items-center">
                          <Home className="w-4 h-4 mr-1 text-loro-navy" />
                          <span>{property.property_type}</span>
                        </div>
                      )}
                      
                      {property.bedrooms !== null && (
                        <div className="flex items-center">
                          <BedDouble className="w-4 h-4 mr-1 text-loro-navy" />
                          <span>{property.bedrooms} ch.</span>
                        </div>
                      )}
                      
                      {property.area !== null && (
                        <div>
                          {property.area} {property.area_unit}
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 flex justify-end">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex items-center gap-1 border-loro-navy/30 text-loro-navy"
                        onClick={() => property.url && window.open(property.url, '_blank')}
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
      </div>
    </>
  );
};

export default PropertiesPage;
