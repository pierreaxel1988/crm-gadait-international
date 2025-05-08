
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as cheerio from "https://esm.sh/cheerio@1.0.0-rc.12";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Gestion des requêtes CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Récupérer les données de la requête
    const requestData = await req.json();
    const url = requestData.url || "https://the-private-collection.com/en/search/buy/";
    const debug = requestData.debug || false;
    const country = requestData.country || null;
    const region = requestData.region || null;
    const page = requestData.page || 1;

    console.log(`Scraping de l'URL: ${url} (page: ${page})`);

    // Construire l'URL avec les paramètres
    let targetUrl = url;
    if (country) {
      targetUrl += `${country}/`;
      if (region) {
        targetUrl += `${region}/`;
      }
    }
    
    // Ajouter le paramètre de page si nécessaire
    if (page > 1) {
      targetUrl += `?page=${page}`;
    }

    // Liste des user-agents pour rotation
    const userAgents = [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
    ];
    
    // Choisir un user agent aléatoire
    const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
    
    console.log(`Utilisation du User-Agent: ${userAgent.substring(0, 20)}...`);
    
    // Faire la requête avec le user agent choisi
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": userAgent,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5,fr;q=0.3,es;q=0.2",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1"
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération du site: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    console.log(`HTML récupéré avec succès (${html.length} caractères)`);

    // En mode debug, renvoyer un extrait du HTML
    if (debug) {
      console.log(`Premiers 500 caractères du HTML: ${html.substring(0, 500)}`);
    }

    // Analyser le HTML pour extraire les propriétés
    const result = extractPropertiesFromPrivateCollection(html, debug);
    
    // Vérifier s'il y a une pagination et retourner l'information
    const pagination = extractPagination(html);
    
    console.log(`${result.properties.length} propriétés extraites`);
    if (pagination) {
      console.log(`Pagination: page actuelle ${pagination.currentPage}, total ${pagination.totalPages} pages`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `${result.properties.length} propriétés extraites avec succès`,
        properties: result.properties,
        pagination,
        htmlSize: html.length,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Erreur lors du traitement de la requête:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: `Erreur serveur: ${error.message}`,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// Fonction spécifique pour extraire les propriétés de The Private Collection
function extractPropertiesFromPrivateCollection(html: string, debug = false) {
  const $ = cheerio.load(html);
  const properties = [];
  
  // Sélecteur optimisé pour les cartes de propriété sur The Private Collection
  const propertyCards = $('.property-item');
  
  console.log(`Nombre de cartes de propriété trouvées: ${propertyCards.length}`);
  
  if (propertyCards.length === 0 && debug) {
    // En mode debug, si aucune propriété n'est trouvée, essayer de comprendre pourquoi
    console.log("Aucune propriété trouvée. Voici les classes trouvées dans la page:");
    const classes = new Set();
    $('*').each((_, el) => {
      const className = $(el).attr('class');
      if (className) {
        className.split(' ').forEach(c => classes.add(c.trim()));
      }
    });
    console.log([...classes].join(', '));
  }
  
  propertyCards.each((index, element) => {
    try {
      const card = $(element);
      
      // Extraire les informations de base
      const title = card.find('.property-title h5').text().trim();
      const priceElement = card.find('.property-price .price-tag');
      const price = priceElement.text().trim();
      
      // Extraire les détails de localisation
      let location = card.find('.property-location').text().trim();
      
      // Extraire le pays
      let country = "Mauritius"; // Par défaut
      const countryMatch = location.match(/(Mauritius|Morocco|Spain|Portugal|France)/i);
      if (countryMatch) {
        country = countryMatch[0];
      }
      
      // Extraire la ville
      let city = "";
      const cityParts = location.split(',');
      if (cityParts.length > 1) {
        city = cityParts[0].trim();
      } else if (location && !location.includes(country)) {
        city = location;
      }
      
      // Extraire les images
      let mainImage = "";
      const imgElement = card.find('.property-thumbnail img');
      
      // Essayer différents attributs d'image
      mainImage = imgElement.attr('src') || imgElement.attr('data-src') || imgElement.attr('data-lazy-src') || '';
      
      // Si l'image est relative, la convertir en absolue
      if (mainImage && !mainImage.startsWith('http')) {
        mainImage = `https://the-private-collection.com${mainImage.startsWith('/') ? '' : '/'}${mainImage}`;
      }
      
      // Extraire le lien vers la propriété
      let propertyLink = card.find('a').attr('href') || '';
      if (propertyLink && !propertyLink.startsWith('http')) {
        // Convertir les liens relatifs en absolus
        propertyLink = `https://the-private-collection.com${propertyLink.startsWith('/') ? '' : '/'}${propertyLink}`;
      }
      
      // Extraire les caractéristiques de la propriété
      let bedrooms = null;
      let bathrooms = null;
      let area = "";
      
      card.find('.property-features .feature-item').each((_, featElement) => {
        const feat = $(featElement);
        const text = feat.text().trim();
        
        if (text.includes('bed') || text.includes('Bed')) {
          const bedroomsMatch = text.match(/(\d+)/);
          if (bedroomsMatch) {
            bedrooms = parseInt(bedroomsMatch[1]);
          }
        } else if (text.includes('bath') || text.includes('Bath')) {
          const bathroomsMatch = text.match(/(\d+)/);
          if (bathroomsMatch) {
            bathrooms = parseInt(bathroomsMatch[1]);
          }
        } else if (text.includes('m²') || text.includes('sqm')) {
          area = text;
        }
      });
      
      // Extraire le type de propriété
      let propertyType = "";
      const tagElement = card.find('.property-tag');
      if (tagElement.length > 0) {
        propertyType = tagElement.text().trim();
      } else {
        // Essayer de déterminer le type à partir du titre
        const titleLower = title.toLowerCase();
        if (titleLower.includes('villa')) {
          propertyType = "Villa";
        } else if (titleLower.includes('apartment')) {
          propertyType = "Apartment";
        } else if (titleLower.includes('house')) {
          propertyType = "House";
        } else if (titleLower.includes('penthouse')) {
          propertyType = "Penthouse";
        }
      }

      // Vérifier si la propriété est marquée comme exclusive
      const isExclusive = card.find('.ribbon.exclusive').length > 0;
      
      // Vérifier si la propriété est marquée comme nouvelle
      const isNew = card.find('.ribbon.new').length > 0;
      
      // Créer l'objet de propriété pour correspondre à la structure Gadait_Listings_Buy
      const property = {
        "Position": index + 1,
        "Title": title,
        "Main Image": mainImage,
        "Secondary Image": null,
        "Additional Image 1": null,
        "Additional Image 2": null,
        "Additional Image 3": null,
        "Additional Image 4": null,
        "Additional Image 5": null,
        "Additional Image 6": null,
        "Additional Image 7": null,
        "Additional Image 8": null,
        "Additional Image 9": null,
        "Additional Image 10": null,
        "Price and Location": `${price} ${location}`,
        "price": price,
        "Property Type": propertyType,
        "Bedrooms": bedrooms,
        "Area": area,
        "country": country,
        "city": city,
        "Property Link": propertyLink,
        "is_exclusive": isExclusive,
        "is_new": isNew
      };
      
      properties.push(property);
    } catch (error) {
      console.error(`Erreur lors de l'extraction de la propriété ${index}:`, error);
    }
  });
  
  return { properties };
}

// Fonction pour extraire les informations de pagination
function extractPagination(html: string) {
  const $ = cheerio.load(html);
  
  try {
    // Sélecteur pour la pagination sur The Private Collection
    const paginationContainer = $('.pagination');
    
    if (paginationContainer.length === 0) {
      return null;
    }
    
    // Trouver la page active
    const currentPage = parseInt(paginationContainer.find('.page-item.active .page-link').text()) || 1;
    
    // Trouver le nombre total de pages
    let totalPages = 1;
    
    // Parcourir tous les liens de pagination pour trouver la dernière page
    paginationContainer.find('.page-item .page-link').each((_, el) => {
      const pageText = $(el).text().trim();
      const pageNumber = parseInt(pageText);
      if (!isNaN(pageNumber) && pageNumber > totalPages) {
        totalPages = pageNumber;
      }
    });
    
    return {
      currentPage,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1
    };
  } catch (error) {
    console.error("Erreur lors de l'extraction de la pagination:", error);
    return null;
  }
}
