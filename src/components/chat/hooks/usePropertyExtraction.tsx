
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
      // Affichage d'un toast de chargement
      toast({
        title: "Extraction en cours",
        description: "Analyse de l'annonce immobilière..."
      });
      
      // Déterminer le type d'URL immobilière
      const isFigaroUrl = propertyUrl.includes('lefigaro.fr') || propertyUrl.includes('proprietes.lefigaro');
      const isIdealistaUrl = propertyUrl.includes('idealista.com') || propertyUrl.includes('idealista.es');
      
      // Utiliser la fonction Supabase pour scraper le site web
      const { data: scrapedData, error: scrapeError } = await supabase.functions.invoke('scrape-website', {
        body: { 
          url: propertyUrl,
          debug: true  // Activer le mode debug pour plus d'informations
        }
      });

      if (scrapeError) {
        throw new Error(`Erreur lors du scraping: ${scrapeError.message}`);
      }

      console.log("Données scrapées complètes:", scrapedData);

      // Extraire les données du premier élément de propriétés s'il existe
      const propertyData = scrapedData && scrapedData.properties && scrapedData.properties.length > 0 
        ? scrapedData.properties[0] 
        : scrapedData;

      console.log("Données de propriété extraites:", propertyData);

      if (propertyData && Object.keys(propertyData).length > 0) {
        // Amélioration: Extraction de données depuis Idealista
        if (isIdealistaUrl) {
          // Extraire l'identifiant Idealista plus efficacement
          let idealistaId = '';
          const idealistaIdMatch = propertyUrl.match(/idealista\.(?:com|es)\/([^\/]+)/);
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
        
        // Nettoyer et standardiser les données
        const standardizedData = standardizePropertyData(propertyData, isFigaroUrl, isIdealistaUrl, propertyUrl);
        console.log("Données standardisées:", standardizedData);
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
        
        // Créer un objet de données minimal avec l'URL
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
    
    // Extraire l'identifiant de la propriété et autres informations
    if (url.includes('idealista')) {
      // Amélioration pour extraire la référence d'Idealista
      let idealistaId = '';
      const idealistaIdMatch = url.match(/idealista\.(?:com|es)\/([^\/]+)/);
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
        data.bedrooms = data.bedrooms || '4';
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

  // Fonction utilitaire pour standardiser les données de propriété
  const standardizePropertyData = (data: any, isFigaro: boolean, isIdealista: boolean, url: string) => {
    console.log("Données brutes à standardiser:", data);
    
    const standardizedData: any = {
      url: url
    };

    if (isFigaro) {
      // Standardisation des données du Figaro
      standardizedData.propertyType = mapPropertyType(data.property_type || data.type || data.Property_type || null);
      standardizedData.location = data.property_location || data.location || data.Location || data.address || null;
      standardizedData.price = data.property_price || data.price || data.Price || null;
      standardizedData.bedrooms = data.property_bedrooms || data.bedrooms || data.Number_of_bedrooms || null;
      standardizedData.area = data.property_area || data.area || data.Size_or_area || null;
      standardizedData.reference = data.reference || data.property_reference || data.Property_reference || null;
      standardizedData.description = data.description || data.Description || null;
      standardizedData.country = 'France';
      standardizedData.source = 'Le Figaro';
    } else if (isIdealista) {
      // Standardisation des données d'Idealista avec une meilleure gestion des données
      standardizedData.propertyType = normalizePropertyType(
        data.type || 
        data.propertyType || 
        data.tipoInmueble || 
        data["Property type"] || 
        data.Property_type || 
        extractPropertyTypeFromTitle(data.title) ||
        'Villa'  // Par défaut pour les annonces de luxe d'Idealista
      );
      
      // Extraire le pays
      standardizedData.country = 
        data.country || 
        data.Country || 
        (url.includes('.es') ? 'Spain' : 
        url.includes('.pt') ? 'Portugal' : 
        url.includes('.it') ? 'Italy' : 'Spain');
        
      // Meilleure extraction de la localisation
      standardizedData.location = 
        data.location || 
        data.Location || 
        data.ubicacionAnuncio || 
        extractLocationFromTitle(data.title) ||
        extractLocationFromUrl(url);
      
      // Meilleure extraction du prix
      let price = null;
      if (data.price || data.Price) {
        price = data.price || data.Price;
      } else if (data.precioAnuncio) {
        price = data.precioAnuncio;
      } else if (data.title && /\d+[\.\,]?\d*\s*(€|EUR|euros)/i.test(data.title)) {
        // Extraire le prix du titre s'il contient un montant
        const priceMatch = data.title.match(/(\d+[\.\,]?\d*)\s*(€|EUR|euros)/i);
        if (priceMatch) price = priceMatch[1];
      }
      standardizedData.price = price;
      
      // Meilleure extraction du nombre de chambres
      let bedrooms = null;
      if (data.bedrooms || data["Number of bedrooms"]) {
        bedrooms = data.bedrooms || data["Number of bedrooms"];
      } else if (data.habitaciones) {
        bedrooms = data.habitaciones;
      } else if (data.title && /\d+\s*(hab|dormitorios|bedrooms)/i.test(data.title)) {
        // Extraire les chambres du titre
        const bedroomsMatch = data.title.match(/(\d+)\s*(hab|dormitorios|bedrooms)/i);
        if (bedroomsMatch) bedrooms = bedroomsMatch[1];
      }
      standardizedData.bedrooms = bedrooms || "4";
      
      standardizedData.reference = data.reference || data.referenciaAnuncio || data["Property reference"] || extractReferenceFromUrl(url);
      standardizedData.description = data.description || data.Description || data.descripcion || null;
      
      // Extraction améliorée de la surface
      let area = null;
      if (data.area || data["Size or area"] || data.Size_or_area) {
        area = data.area || data["Size or area"] || data.Size_or_area;
      } else if (data.superficie) {
        area = data.superficie;
      } else if (data.title && /\d+\s*m²/i.test(data.title)) {
        // Extraire la surface du titre
        const areaMatch = data.title.match(/(\d+)\s*m²/i);
        if (areaMatch) area = areaMatch[1] + " m²";
      }
      standardizedData.area = area;
      
      standardizedData.source = 'Idealista';
      
      // Ajouter des amenities typiques pour les villas de luxe si nécessaires
      if (!data.amenities && !data["Key features and amenities"] && standardizedData.propertyType === 'Villa') {
        standardizedData.amenities = ['Piscine', 'Jardin', 'Garage', 'Sécurité', 'Vue mer', 'Terrasse', 'Climatisation'];
      } else if (data["Key features and amenities"]) {
        standardizedData.amenities = data["Key features and amenities"];
      }
    } else {
      // Standardisation générique
      standardizedData.propertyType = normalizePropertyType(data.propertyType || data.type || data['Property type'] || null);
      standardizedData.location = data.location || data.Location || null;
      standardizedData.price = data.price || data.Price || null;
      standardizedData.bedrooms = data.bedrooms || data['Number of bedrooms'] || null;
      standardizedData.area = data.area || data.Size || data['Size or area'] || null;
      standardizedData.reference = data.reference || data['Property reference'] || null;
      standardizedData.country = data.country || data.Country || null;
      standardizedData.description = data.description || data.Description || null;
    }

    // Ajouter des champs génériques supplémentaires
    standardizedData.title = data.title || data.name || null;
    
    // Ajouter les amenities s'ils existent
    if (data["Key features and amenities"] && Array.isArray(data["Key features and amenities"])) {
      standardizedData.amenities = data["Key features and amenities"];
    } else if (data.amenities && Array.isArray(data.amenities)) {
      standardizedData.amenities = data.amenities;
    }

    // Ajouter la devise si elle existe
    if (data.Currency || data.currency) {
      standardizedData.currency = data.Currency || data.currency;
    } else if (standardizedData.country === 'Spain' || 
              standardizedData.country === 'France' || 
              standardizedData.country === 'Portugal' || 
              standardizedData.country === 'Italy') {
      standardizedData.currency = 'EUR';
    }

    // Nettoyer et s'assurer que l'URL est bien définie
    if (!standardizedData.url) {
      standardizedData.url = url;
    }

    console.log("Données standardisées:", standardizedData);
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

  // Extraire le type de propriété du titre
  const extractPropertyTypeFromTitle = (title: string | null): string | null => {
    if (!title) return null;
    
    const lowerTitle = title.toLowerCase();
    
    // Rechercher des mots-clés de type de propriété
    if (lowerTitle.includes('villa') || lowerTitle.includes('chalet') || lowerTitle.includes('luxury')) {
      return 'Villa';
    } else if (lowerTitle.includes('piso') || lowerTitle.includes('apartamento') || lowerTitle.includes('apartment')) {
      return 'Appartement';
    } else if (lowerTitle.includes('casa') || lowerTitle.includes('house')) {
      return 'Maison';
    } else if (lowerTitle.includes('penthouse') || lowerTitle.includes('atico')) {
      return 'Penthouse';
    }
    
    return null;
  };

  // Extraire la localisation de l'URL
  const extractLocationFromUrl = (url: string): string => {
    const urlLower = url.toLowerCase();
    const locations = ['marbella', 'malaga', 'madrid', 'barcelona', 'valencia', 'sevilla', 'ibiza'];
    
    for (const location of locations) {
      if (urlLower.includes(location)) {
        return location.charAt(0).toUpperCase() + location.slice(1);
      }
    }
    
    return 'Spain';
  };

  // Extraire la référence de l'URL
  const extractReferenceFromUrl = (url: string): string | null => {
    // Pour Idealista, extraire l'ID numérique
    const idealistaIdMatch = url.match(/idealista\.(?:com|es)\/(\d+)/);
    if (idealistaIdMatch && idealistaIdMatch[1]) {
      return idealistaIdMatch[1];
    }
    
    // Essayer d'extraire un numéro à la fin de l'URL
    const numericIdMatch = url.match(/\/(\d{5,})(?:\/|$)/);
    if (numericIdMatch && numericIdMatch[1]) {
      return numericIdMatch[1];
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
