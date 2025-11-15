import React, { useEffect, useState } from 'react';
import { LeadDetailed } from '@/types/lead';
import { supabase } from '@/integrations/supabase/client';
import { getExternalPropertyUrl } from '@/utils/slugUtils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Home, Building2, Sparkles, Mail, Share2, X, Globe } from 'lucide-react';
import PropertyCard from '@/components/pipeline/PropertyCard';
import PropertySkeleton from '@/components/pipeline/PropertySkeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { useToast } from '@/hooks/use-toast';

// Use the Supabase generated type directly
import { Database } from '@/integrations/supabase/types';
type GadaitProperty = Database['public']['Tables']['properties_backoffice']['Row'];

interface SuggestedPropertiesFullViewProps {
  lead: LeadDetailed;
}

const PROPERTIES_PER_PAGE = 12; // Propriétés chargées à chaque fois

const SuggestedPropertiesFullView: React.FC<SuggestedPropertiesFullViewProps> = ({ lead }) => {
  const [properties, setProperties] = useState<GadaitProperty[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedProperties, setSelectedProperties] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [locale, setLocale] = useState<'fr' | 'en'>('fr');
  const [exchangeRates, setExchangeRates] = useState<{ usd_to_eur: number; mur_to_eur: number } | null>(null);
  const { toast } = useToast();

  // Fetch exchange rates on component mount
  useEffect(() => {
    const fetchExchangeRates = async () => {
      const { data } = await supabase.from('fx_rates').select('rate_usd_to_eur, rate_mur_to_eur').single();
      if (data) {
        setExchangeRates({
          usd_to_eur: data.rate_usd_to_eur,
          mur_to_eur: data.rate_mur_to_eur
        });
      }
    };
    fetchExchangeRates();
  }, []);

  // Convert price to lead's currency
  const convertPrice = (price: number | null, fromCurrency: string | null): number | null => {
    if (!price || !exchangeRates) return price;
    
    const targetCurrency = lead.currency || 'EUR';
    const sourceCurrency = (fromCurrency || 'EUR').toUpperCase();
    
    if (sourceCurrency === targetCurrency) return price;
    
    // Convert to EUR first (as base)
    let priceInEur = price;
    if (sourceCurrency === 'USD') {
      priceInEur = price * exchangeRates.usd_to_eur;
    } else if (sourceCurrency === 'MUR') {
      priceInEur = price * exchangeRates.mur_to_eur;
    }
    
    // Convert from EUR to target currency
    if (targetCurrency === 'EUR') {
      return priceInEur;
    } else if (targetCurrency === 'USD') {
      return priceInEur / exchangeRates.usd_to_eur;
    } else if (targetCurrency === 'MUR') {
      return priceInEur / exchangeRates.mur_to_eur;
    }
    
    return priceInEur;
  };

  useEffect(() => {
    // Reset et charger la première page
    setProperties([]);
    setHasMore(true);
    fetchSuggestedProperties(true);
  }, [lead.country, lead.desiredLocation, lead.propertyTypes, lead.budget, lead.bedrooms]);

  const fetchSuggestedProperties = async (reset: boolean = false) => {
    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    
    try {
      const currentLength = reset ? 0 : properties.length;
      let query = supabase.from('properties_backoffice').select('*', { count: 'exact' });

      // Filter by published status
      query = query.eq('status', 'published');

      // Filter by country (optional)
      if (lead.country) {
        query = query.eq('country', lead.country);
      }

      // Filter by location (optional)
      if (lead.desiredLocation) {
        query = query.ilike('location', `%${lead.desiredLocation}%`);
      }

      // Filter by property types (optional) - convert to lowercase for case-insensitive matching
      if (lead.propertyTypes && lead.propertyTypes.length > 0) {
        query = query.in('property_type', lead.propertyTypes.map(t => t.toLowerCase()));
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

      // Pagination pour scroll infini
      query = query.range(currentLength, currentLength + PROPERTIES_PER_PAGE - 1);

      // Order by price desc to show expensive properties first
      query = query.order('price', { ascending: false });

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching suggested properties:', error);
        return;
      }

      const newProperties = data || [];
      
      // Convert all property prices to lead's currency
      const convertedProperties = newProperties.map(property => ({
        ...property,
        price: convertPrice(property.price, property.currency),
        currency: lead.currency || 'EUR'
      }));
      
      if (reset) {
        setProperties(convertedProperties);
      } else {
        setProperties(prev => [...prev, ...convertedProperties]);
      }
      
      // Vérifier s'il reste des propriétés à charger
      setHasMore(newProperties.length === PROPERTIES_PER_PAGE && (currentLength + newProperties.length) < (count || 0));
    } catch (error) {
      console.error('Error fetching suggested properties:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchSuggestedProperties(false);
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
      console.log('🔍 Selection updated:', { propertyId, size: newSelection.size, selected: Array.from(newSelection) });
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

  // Fonction pour déterminer la langue du lead
  const getLeadLanguage = (): 'en' | 'fr' => {
    // Priorité 1: preferredLanguage du lead
    if (lead.preferredLanguage) {
      return lead.preferredLanguage.toLowerCase() === 'english' ? 'en' : 'fr';
    }
    
    // Priorité 2: pays du lead
    if (lead.country) {
      const frenchSpeakingCountries = [
        'France', 'Monaco', 'Belgium', 'Belgique', 'Switzerland', 'Suisse', 'Luxembourg',
        'Senegal', 'Sénégal', 'Ivory Coast', "Côte d'Ivoire", 'Mali', 'Burkina Faso',
        'Niger', 'Chad', 'Tchad', 'Guinea', 'Guinée', 'Rwanda', 'Burundi', 'Benin', 'Bénin',
        'Togo', 'Central African Republic', 'République centrafricaine', 'Congo', 
        'Democratic Republic of the Congo', 'République démocratique du Congo', 'Gabon',
        'Comoros', 'Comores', 'Djibouti', 'Seychelles', 'Vanuatu', 'Madagascar',
        'Cameroon', 'Cameroun', 'Haiti', 'Haïti', 'Mauritius', 'Maurice', 'Tunisia', 'Tunisie',
        'Algeria', 'Algérie', 'Morocco', 'Maroc'
      ];
      return frenchSpeakingCountries.includes(lead.country) ? 'fr' : 'en';
    }
    
    // Par défaut: anglais
    return 'en';
  };

  const sendPropertiesToClient = async () => {
    const selectedProps = properties.filter(p => selectedProperties.has(p.id));
    
    if (selectedProps.length === 0) {
      toast({
        title: "Erreur",
        description: "Aucune propriété sélectionnée",
        variant: "destructive"
      });
      return;
    }

    // Vérifier que le lead a un email
    if (!lead.email || lead.email.trim() === '') {
      toast({
        title: "Email manquant",
        description: "Ce lead n'a pas d'adresse email. Veuillez ajouter une adresse email au lead avant d'envoyer une sélection.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Use the manually selected locale instead of automatic detection
      const language = locale; // Use the locale from the selector (FR/EN)
      const languagePrefix = language === 'en' ? '/en/properties/' : '/fr/proprietes/';
      
      const { data, error } = await supabase.functions.invoke('send-property-selection', {
        body: {
          leadId: lead.id,
          locale: locale, // Pass the selected locale to the edge function
          properties: selectedProps.map(prop => {
            // Cast to any to access new DB columns not yet in generated types
            const property = prop as any;
            
            // Get the appropriate title based on language
            const title = language === 'en' 
              ? (property.title_en || property.title_translations?.en || property.title)
              : (property.title_fr || property.title_translations?.fr || property.title);
            
            // Use the complete URL from the database (url_fr or url_en for DatoCMS properties)
            const propertyUrl = getExternalPropertyUrl(
              {
                source: property.source,
                url_fr: property.url_fr,
                url_en: property.url_en,
                url: property.url,
                slug_fr: property.slug_fr,
                slug_en: property.slug_en,
                slug: property.slug,
              },
              language === 'fr' ? 'fr' : 'en'
            );
            
            // Add tracking parameters
            const urlWithTracking = propertyUrl.includes('?')
              ? `${propertyUrl}&utm_source=crm&utm_medium=email&utm_campaign=property_selection&lead_id=${lead.id}`
              : `${propertyUrl}?utm_source=crm&utm_medium=email&utm_campaign=property_selection&lead_id=${lead.id}`;
            
            return {
              id: prop.id,
              title,
              location: prop.location,
              country: prop.country,
              price: prop.price,
              currency: prop.currency,
              main_image: prop.main_image,
              url: urlWithTracking,
              bedrooms: prop.bedrooms,
              bathrooms: prop.bathrooms,
              area: prop.area,
              area_unit: prop.area_unit,
              land_area: prop.land_area,
              land_area_unit: prop.land_area_unit,
              property_type: prop.property_type,
              reference: prop.reference,
              source: property.source,
              url_fr: property.url_fr,
              url_en: property.url_en,
              slug: property.slug,
              slug_fr: property.slug_fr,
              slug_en: property.slug_en,
            };
          }),
          leadName: lead.name,
          leadEmail: lead.email,
          senderName: "Équipe Gadait", // À adapter selon l'utilisateur connecté
          criteriaLabel: "Sélection de propriétés personnalisée"
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Email envoyé avec succès !",
        description: `${selectedProps.length} propriété(s) envoyée(s) à ${lead.name} avec copie à pierre@gadait-international.com`,
      });

      // Fermer le drawer et réinitialiser la sélection
      setIsDrawerOpen(false);
      clearSelection();

    } catch (error: any) {
      console.error("Erreur lors de l'envoi:", error);
      toast({
        title: "Erreur lors de l'envoi",
        description: error.message || "Une erreur est survenue lors de l'envoi de l'email",
        variant: "destructive"
      });
    }
  };

  const getSelectedProperties = () => {
    return properties.filter(p => selectedProperties.has(p.id));
  };

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
    <>
      <div className="space-y-4 pt-6 border-t border-gray-200">
        <div className="space-y-6">
        {/* En-tête moderne avec boutons de sélection */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-loro-terracotta" />
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
              {selectedProperties.size > 0 && (
                <Badge className="bg-blue-50 border-blue-200 text-blue-700 font-futura rounded-md px-2 py-0.5 text-xs font-medium tracking-wide shadow-none">
                  <span className="text-xs font-medium">{selectedProperties.size} sélectionnée(s)</span>
                </Badge>
              )}
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex items-center gap-2">
            {/* Sélecteur de langue */}
            <div className="flex items-center gap-1 border border-border rounded-lg p-1 mr-2">
              <Globe className="h-3 w-3 text-muted-foreground ml-1" />
              <Button
                variant={locale === 'fr' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setLocale('fr')}
                className="h-7 px-2 text-xs font-futura"
              >
                FR
              </Button>
              <Button
                variant={locale === 'en' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setLocale('en')}
                className="h-7 px-2 text-xs font-futura"
              >
                EN
              </Button>
            </div>

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
                  locale={locale}
                />
              ))}
            </div>
            
            {/* Bouton "Voir plus" pour scroll infini */}
            {hasMore && !loading && (
              <div className="flex justify-center pt-6">
                <Button
                  onClick={loadMore}
                  disabled={loadingMore}
                  variant="outline"
                  className="font-futura"
                >
                  {loadingMore ? 'Chargement...' : 'Voir plus de propriétés'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>

    {/* Bouton fixe en bas quand des propriétés sont sélectionnées */}
    {selectedProperties.size > 0 && (
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.15)] p-4 z-[100]">
        <div className="max-w-screen-2xl mx-auto flex gap-3">
          <Button
            onClick={clearSelection}
            variant="outline"
            size="lg"
            className="flex-1 font-futura"
          >
            Annuler ({selectedProperties.size})
          </Button>
          <Button
            onClick={sendPropertiesToClient}
            size="lg"
            className="flex-1 font-futura bg-loro-sand text-loro-navy hover:bg-loro-sand/90"
          >
            <Mail className="h-4 w-4 mr-2" />
            Envoyer ({selectedProperties.size})
          </Button>
        </div>
      </div>
    )}
  </>
  );
};

export default SuggestedPropertiesFullView;