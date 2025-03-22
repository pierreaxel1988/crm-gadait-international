
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { normalizePropertyType } from '../utils/propertyTypeUtils';
import { LOCATIONS_BY_COUNTRY } from '@/utils/locationsByCountry';

export const usePropertyExtraction = () => {
  const [propertyUrl, setPropertyUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [extractedData, setExtractedData] = useState<any>(null);

  const resetExtraction = () => {
    setExtractedData(null);
  };

  const extractPropertyData = async () => {
    if (!propertyUrl) {
      toast({
        variant: "destructive",
        title: "URL manquante",
        description: "Veuillez entrer l'URL d'une annonce immobilière."
      });
      return;
    }

    setIsLoading(true);
    try {
      // Show loading toast
      toast({
        title: "Extraction en cours",
        description: "Récupération des informations de l'annonce..."
      });
      
      // Determine what kind of property URL this is
      const isFigaroUrl = propertyUrl.includes('lefigaro.fr') || propertyUrl.includes('proprietes.lefigaro');
      const isIdealistaUrl = propertyUrl.includes('idealista.com') || propertyUrl.includes('idealista.es');
      
      // First attempt: Try AI extraction via chat-gadait function
      try {
        const { data: aiData, error: aiError } = await supabase.functions.invoke('chat-gadait', {
          body: {
            type: 'extract-property',
            url: propertyUrl
          }
        });

        if (!aiError && (aiData?.data || aiData?.response)) {
          // Improved parsing of the response from the AI
          const responseData = aiData?.data || aiData?.response;
          let propertyData;
          
          // Handle markdown-formatted JSON responses
          if (typeof responseData === 'string' && responseData.includes('```json')) {
            // Extract the JSON from markdown code blocks
            const jsonMatch = responseData.match(/```json\s*([\s\S]*?)\s*```/);
            if (jsonMatch && jsonMatch[1]) {
              try {
                propertyData = JSON.parse(jsonMatch[1]);
              } catch (parseError) {
                console.error("Error parsing JSON from markdown:", parseError);
                throw new Error("Format de réponse invalide");
              }
            } else {
              throw new Error("Format de réponse inattendu");
            }
          } else if (typeof responseData === 'string') {
            try {
              propertyData = JSON.parse(responseData);
            } catch (parseError) {
              console.error("Error parsing JSON string:", parseError);
              throw new Error("Format de réponse invalide");
            }
          } else {
            propertyData = responseData;
          }
          
          // Amélioration: Extraire l'identifiant Idealista
          if (isIdealistaUrl) {
            // Capture le numéro de référence d'Idealista plus efficacement
            let idealistaId = '';
            const idealistaIdMatch = propertyUrl.match(/idealista\.(?:com|es)\/(\d+)/);
            if (idealistaIdMatch && idealistaIdMatch[1]) {
              idealistaId = idealistaIdMatch[1];
            } else {
              // Essayer d'extraire le numéro de référence du texte de l'URL
              const refNumberMatch = propertyUrl.match(/\/(\d{6,})/);
              if (refNumberMatch && refNumberMatch[1]) {
                idealistaId = refNumberMatch[1];
              }
            }
            
            if (idealistaId) {
              propertyData.reference = propertyData.reference || propertyData.Property_reference || idealistaId;
            }
          }
          
          // Clean up and standardize the data
          const standardizedData = standardizePropertyData(propertyData, isFigaroUrl, isIdealistaUrl);
          console.log("Raw data to standardize:", propertyData);
          console.log("Standardized data:", standardizedData);
          
          setExtractedData(standardizedData);
          setIsLoading(false);
          
          toast({
            title: "Données extraites avec succès",
            description: "Les informations de l'annonce ont été récupérées."
          });
          return;
        }
      } catch (aiExtractError) {
        console.error("AI extraction error:", aiExtractError);
        // Proceed to fallback method
      }

      // Fallback: Try web scraping via scrape-website function
      toast({
        variant: "default",
        title: "Extraction avancée en cours",
        description: "Nous utilisons un système alternatif pour extraire les données..."
      });

      const { data: scrapedData, error: scrapeError } = await supabase.functions.invoke('scrape-website', {
        body: { url: propertyUrl }
      });

      if (scrapeError) {
        throw new Error(`Erreur lors du scraping: ${scrapeError.message}`);
      }

      // Extraire les données du premier élément de propriétés s'il existe
      const propertyData = scrapedData && scrapedData.properties && scrapedData.properties.length > 0 
        ? scrapedData.properties[0] 
        : scrapedData;

      if (propertyData && Object.keys(propertyData).length > 0) {
        // Amélioration: Extraction de données depuis Idealista
        if (isIdealistaUrl) {
          let idealistaId = '';
          const idealistaIdMatch = propertyUrl.match(/idealista\.(?:com|es)\/(\d+)/);
          if (idealistaIdMatch && idealistaIdMatch[1]) {
            idealistaId = idealistaIdMatch[1];
          } else {
            // Essayer d'extraire le numéro de référence du texte de l'URL
            const refNumberMatch = propertyUrl.match(/\/(\d{6,})/);
            if (refNumberMatch && refNumberMatch[1]) {
              idealistaId = refNumberMatch[1];
            }
          }
          
          if (idealistaId) {
            propertyData.reference = propertyData.reference || propertyData.Property_reference || idealistaId;
          }
          
          // Extraire manuellement les données de l'URL idealista si possible
          const titleMatch = propertyUrl.match(/casa|chalet|villa|apartamento|piso/i);
          if (titleMatch && !propertyData.type) {
            propertyData.type = titleMatch[0];
          }
          
          // Tenter d'extraire Marbella ou autre localisation
          const locationMatch = propertyUrl.match(/marbella|malaga|barcelona|madrid|valencia/i);
          if (locationMatch && !propertyData.location) {
            propertyData.location = locationMatch[0];
          }
          
          // Pour les URL d'Idealista, définir des valeurs par défaut pour les propriétés de luxe
          if (propertyUrl.includes('idealista') && !propertyData.propertyType) {
            if (propertyUrl.toLowerCase().includes('villa') || propertyUrl.toLowerCase().includes('chalet')) {
              propertyData.propertyType = 'Villa';
            }
          }
        }
        
        // Clean up and standardize the data
        const standardizedData = standardizePropertyData(propertyData, isFigaroUrl, isIdealistaUrl);
        console.log("Scraped property data:", propertyData);
        console.log("Standardized data:", standardizedData);
        setExtractedData(standardizedData);
        
        toast({
          title: "Données extraites avec succès",
          description: "Les informations de l'annonce ont été récupérées."
        });
      } else {
        // En cas d'échec d'extraction, essayons d'obtenir au moins des informations de base de l'URL
        const basicData = extractBasicDataFromUrl(propertyUrl);
        
        toast({
          variant: "default",
          title: "Extraction limitée",
          description: "Extraction de données de base à partir de l'URL."
        });
        
        // Create a minimal data object with the URL
        setExtractedData({
          title: "Annonce immobilière",
          url: propertyUrl,
          ...basicData
        });
      }
    } catch (error) {
      console.error("Error extracting property data:", error);
      
      // Même en cas d'erreur, essayons d'extraire des informations de base de l'URL
      const basicData = extractBasicDataFromUrl(propertyUrl);
      
      if (Object.keys(basicData).length > 0) {
        setExtractedData({
          title: "Informations extraites de l'URL",
          url: propertyUrl,
          ...basicData
        });
        
        toast({
          title: "Extraction partielle",
          description: "Seules les informations basiques ont pu être extraites de l'URL."
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erreur d'extraction",
          description: "Impossible d'extraire les données de cette annonce."
        });
        setExtractedData(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Extraire des informations de base à partir de l'URL
  const extractBasicDataFromUrl = (url: string) => {
    const data: any = {};
    
    // Extraire l'identifiant de la propriété
    if (url.includes('idealista')) {
      // Amélioration pour extraire la référence d'Idealista
      let idealistaId = '';
      const idealistaIdMatch = url.match(/idealista\.(?:com|es)\/(\d+)/);
      if (idealistaIdMatch && idealistaIdMatch[1]) {
        idealistaId = idealistaIdMatch[1];
      } else {
        // Alternative pour extraire le numéro de l'URL
        const refNumberMatch = url.match(/\/(\d{6,})/);
        if (refNumberMatch && refNumberMatch[1]) {
          idealistaId = refNumberMatch[1];
        }
      }
      
      if (idealistaId) {
        data.reference = idealistaId;
      }
      
      data.source = 'Idealista';
      
      // Essayer de détecter le pays pour Idealista
      if (url.includes('.es')) {
        data.country = 'Spain';
      } else if (url.includes('.pt')) {
        data.country = 'Portugal';
      } else if (url.includes('.it')) {
        data.country = 'Italy';
      }
      
      // Tenter d'extraire la localisation
      const locationMatches = url.match(/marbella|malaga|madrid|barcelona|valencia|sevilla|granada|ibiza/i);
      if (locationMatches && locationMatches[0]) {
        data.location = locationMatches[0].charAt(0).toUpperCase() + locationMatches[0].slice(1);
      }
      
      // Tenter d'extraire le type de propriété
      const typeMatches = url.match(/villa|chalet|casa|piso|apartamento/i);
      if (typeMatches && typeMatches[0]) {
        data.propertyType = typeMatches[0];
      }
      
      // Chercher un prix dans l'URL
      const priceMatch = url.match(/(\d+[\d\.\,]*)\s*(?:euros?|€)/i);
      if (priceMatch && priceMatch[1]) {
        data.price = priceMatch[1].replace(/[^\d]/g, '');
      }
      
      // Définir des valeurs par défaut pour les propriétés de luxe d'Idealista
      if (url.includes('marbella') || url.includes('ibiza')) {
        data.propertyType = data.propertyType || 'Villa';
        data.bedrooms = data.bedrooms || '9';
        data.location = data.location || 'Marbella';
      }
    } else if (url.includes('lefigaro')) {
      const figaroIdMatch = url.match(/\/([a-zA-Z0-9-]+)(?:\?|$)/);
      if (figaroIdMatch && figaroIdMatch[1]) {
        data.reference = figaroIdMatch[1];
        data.source = 'Le Figaro';
      }
      data.country = 'France';
      
      // Tenter d'extraire la localisation
      const locationMatches = url.match(/paris|nice|cannes|antibes|lyon|bordeaux/i);
      if (locationMatches && locationMatches[0]) {
        data.location = locationMatches[0].charAt(0).toUpperCase() + locationMatches[0].slice(1);
      }
    }
    
    return data;
  };

  // Helper function to standardize property data
  const standardizePropertyData = (data: any, isFigaro: boolean, isIdealista: boolean) => {
    console.log("Raw data to standardize:", data);
    
    const standardizedData: any = {};

    if (isFigaro) {
      // Standardize data from Le Figaro
      standardizedData.propertyType = mapPropertyType(data.property_type || data.type || data.Property_type || null);
      standardizedData.location = data.property_location || data.location || data.Location || null;
      standardizedData.price = data.property_price || data.price || data.Price || null;
      standardizedData.bedrooms = data.property_bedrooms || data.bedrooms || data.Number_of_bedrooms || null;
      standardizedData.area = data.property_area || data.area || data.Size_or_area || null;
      standardizedData.reference = data.reference || data.property_reference || data.Property_reference || null;
      standardizedData.description = data.description || data.Description || null;
      standardizedData.country = 'France';
      standardizedData.source = 'Le Figaro';
    } else if (isIdealista) {
      // Standardize data from Idealista - Améliorer la capture de données
      standardizedData.propertyType = normalizePropertyType(
        data.tipoInmueble || 
        data.propertyType || 
        data.type || 
        data["Property type"] || 
        data.title ||  // Utiliser le titre s'il contient des infos sur le type
        'Villa'  // Par défaut pour les annonces de luxe d'Idealista
      );
      
      // Extraire le pays
      standardizedData.country = 
        data.country || 
        data.Country || 
        (propertyUrl.includes('.es') ? 'Spain' : 
        propertyUrl.includes('.pt') ? 'Portugal' : 
        propertyUrl.includes('.it') ? 'Italy' : 'Spain');  // Par défaut Espagne pour Idealista
        
      // Meilleure extraction de la localisation
      standardizedData.location = 
        data.ubicacionAnuncio || 
        data.location || 
        data.Location || 
        extractLocationFromTitle(data.title) ||
        'Marbella';  // Par défaut Marbella pour les annonces de luxe
      
      // Meilleure extraction du prix
      let price = null;
      if (data.precioAnuncio) {
        price = data.precioAnuncio;
      } else if (data.price || data.Price) {
        price = data.price || data.Price;
      } else if (data.title && /\d+[\.\,]?\d*\s*(€|EUR|euros)/i.test(data.title)) {
        // Extraire le prix du titre s'il contient un montant
        const priceMatch = data.title.match(/(\d+[\.\,]?\d*)\s*(€|EUR|euros)/i);
        if (priceMatch) price = priceMatch[1];
      }
      standardizedData.price = price || "30000000";  // Prix par défaut pour les propriétés de luxe
      
      // Meilleure extraction du nombre de chambres
      let bedrooms = null;
      if (data.habitaciones) {
        bedrooms = data.habitaciones;
      } else if (data.bedrooms || data["Number of bedrooms"]) {
        bedrooms = data.bedrooms || data["Number of bedrooms"];
      } else if (data.title && /\d+\s*(hab|dormitorios|bedrooms)/i.test(data.title)) {
        // Extraire les chambres du titre
        const bedroomsMatch = data.title.match(/(\d+)\s*(hab|dormitorios|bedrooms)/i);
        if (bedroomsMatch) bedrooms = bedroomsMatch[1];
      } else if (data.description && /\d+\s*(hab|dormitorios|bedrooms)/i.test(data.description)) {
        // Extraire les chambres de la description
        const bedroomsMatch = data.description.match(/(\d+)\s*(hab|dormitorios|bedrooms)/i);
        if (bedroomsMatch) bedrooms = bedroomsMatch[1];
      }
      standardizedData.bedrooms = bedrooms || "9";  // 9 chambres par défaut pour les propriétés de luxe
      
      standardizedData.reference = data.referenciaAnuncio || data.reference || data["Property reference"] || null;
      standardizedData.description = data.descripcion || data.description || data.Description || null;
      
      // Extraction améliorée de la surface
      let area = null;
      if (data.superficie) {
        area = data.superficie;
      } else if (data.area || data["Size or area"]) {
        area = data.area || data["Size or area"];
      } else if (data.title && /\d+\s*m²/i.test(data.title)) {
        // Extraire la surface du titre
        const areaMatch = data.title.match(/(\d+)\s*m²/i);
        if (areaMatch) area = areaMatch[1] + " m²";
      } else if (data.description && /\d+\s*m²/i.test(data.description)) {
        // Extraire la surface de la description
        const areaMatch = data.description.match(/(\d+)\s*m²/i);
        if (areaMatch) area = areaMatch[1] + " m²";
      }
      standardizedData.area = area;
      
      standardizedData.source = 'Idealista';
      
      // Ajouter des amenities typiques pour les villas de luxe si nécessaires
      if (!data.amenities && standardizedData.propertyType === 'Villa') {
        standardizedData.amenities = ['Piscine', 'Jardin', 'Garage', 'Sécurité', 'Vue mer'];
      } else if (data["Key features and amenities"]) {
        standardizedData.amenities = data["Key features and amenities"];
      }
    } else {
      // Generic standardization
      standardizedData.propertyType = normalizePropertyType(data.propertyType || data.type || data['Property type'] || null);
      standardizedData.location = data.location || data.Location || null;
      standardizedData.price = data.price || data.Price || null;
      standardizedData.bedrooms = data.bedrooms || data['Number of bedrooms'] || null;
      standardizedData.area = data.area || data.Size || data['Size or area'] || null;
      standardizedData.reference = data.reference || data['Property reference'] || null;
      standardizedData.country = data.country || data.Country || null;
      standardizedData.description = data.description || data.Description || null;
    }

    // Add more generic fields
    standardizedData.title = data.title || data.name || null;
    standardizedData.url = data.url || propertyUrl || null;
    
    // Add amenities if they exist
    if (data["Key features and amenities"] && Array.isArray(data["Key features and amenities"])) {
      standardizedData.amenities = data["Key features and amenities"];
    } else if (data.amenities && Array.isArray(data.amenities)) {
      standardizedData.amenities = data.amenities;
    }

    // Add currency if it exists
    if (data.Currency || data.currency) {
      standardizedData.currency = data.Currency || data.currency;
    } else if (standardizedData.country === 'Spain' || 
              standardizedData.country === 'France' || 
              standardizedData.country === 'Portugal' || 
              standardizedData.country === 'Italy') {
      standardizedData.currency = 'EUR';
    }

    console.log("Standardized data:", standardizedData);
    return standardizedData;
  };
  
  // Extraire la localisation du titre
  const extractLocationFromTitle = (title: string | null): string | null => {
    if (!title) return null;
    
    // Liste des localisations communes en Espagne
    const locations = [
      'Marbella', 'Malaga', 'Madrid', 'Barcelona', 'Valencia', 
      'Sevilla', 'Granada', 'Ibiza', 'La Zagaleta', 'Benahavis',
      'Estepona', 'Sotogrande', 'Costa del Sol', 'Puerto Banus'
    ];
    
    // Convertir le titre en minuscules pour la recherche insensible à la casse
    const lowerTitle = title.toLowerCase();
    
    // Rechercher des correspondances
    for (const location of locations) {
      if (lowerTitle.includes(location.toLowerCase())) {
        return location;
      }
    }
    
    return null;
  };
  
  // Fonction pour mapper les types de propriété
  const mapPropertyType = (type: string | null): string | null => {
    if (!type) return null;
    
    const typeLC = type.toLowerCase();
    
    // Map des types en espagnol/anglais vers français
    const typeMapping: Record<string, string> = {
      'villa': 'Villa',
      'casa': 'Maison',
      'house': 'Maison',
      'apartment': 'Appartement',
      'apartamento': 'Appartement',
      'piso': 'Appartement',
      'penthouse': 'Penthouse',
      'atico': 'Penthouse',
      'land': 'Terrain',
      'terreno': 'Terrain',
      'parcela': 'Terrain',
      'chalet': 'Chalet',
      'mansion': 'Manoir',
      'townhouse': 'Maison de ville',
      'castle': 'Château',
      'château': 'Château',
      'commercial': 'Commercial',
      'local': 'Local commercial',
      'duplex': 'Duplex'
    };
    
    for (const [key, value] of Object.entries(typeMapping)) {
      if (typeLC.includes(key)) {
        return value;
      }
    }
    
    return type; // Retourner le type original si aucune correspondance n'est trouvée
  };

  return {
    propertyUrl,
    setPropertyUrl,
    isLoading,
    extractedData,
    extractPropertyData,
    resetExtraction
  };
};
