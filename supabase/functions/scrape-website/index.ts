
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

    console.log(`Scraping de l'URL: ${url} (pays: ${country || 'tous'}, région: ${region || 'toutes'}, page: ${page})`);

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

// Nouvelle fonction spécifique pour extraire les propriétés de The Private Collection
function extractPropertiesFromPrivateCollection(html: string, debug = false) {
  const $ = cheerio.load(html);
  const properties = [];
  
  // Sélecteur pour les cartes de propriété sur The Private Collection
  const propertyCards = $('.card--wide, .property-card, .listing-card, article');
  
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
      const title = card.find('.card__title, .property-title, h2, h3').first().text().trim();
      const priceElement = card.find('.card__price, .property-price, .price').first();
      const price = priceElement.text().trim();
      
      // Extraire les détails de localisation
      let location = card.find('.card__location, .property-location, .location').first().text().trim();
      if (!location) {
        // Si pas de classe spécifique, chercher dans les métadonnées
        location = card.find('[itemprop="addressLocality"], [data-location]').first().text().trim();
      }
      
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
      const mainImage = card.find('img').attr('src') || card.find('img').attr('data-src') || '';
      
      // Extraire le lien vers la propriété
      let propertyLink = card.find('a').attr('href') || '';
      if (propertyLink && !propertyLink.startsWith('http')) {
        // Convertir les liens relatifs en absolus
        propertyLink = `https://the-private-collection.com${propertyLink.startsWith('/') ? '' : '/'}${propertyLink}`;
      }
      
      // Extraire le nombre de chambres
      let bedrooms = null;
      const bedroomsText = card.find('.card__rooms, .bedrooms, [data-bedrooms]').first().text().trim();
      if (bedroomsText) {
        const bedroomsMatch = bedroomsText.match(/(\d+)/);
        if (bedroomsMatch) {
          bedrooms = parseInt(bedroomsMatch[1]);
        }
      }
      
      // Extraire la surface
      let area = "";
      const areaText = card.find('.card__area, .area, [data-area]').first().text().trim();
      if (areaText) {
        area = areaText;
      }
      
      // Extraire le type de propriété
      let propertyType = "";
      const typeText = card.find('.card__type, .property-type, [data-type]').first().text().trim();
      if (typeText) {
        propertyType = typeText;
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
        "is_exclusive": false,
        "is_new": false
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
    // Sélecteur commun pour la pagination
    const paginationContainer = $('.pagination, .pager, nav[aria-label="Pagination"]').first();
    
    if (paginationContainer.length === 0) {
      return null;
    }
    
    // Trouver la page active
    const currentPage = parseInt(paginationContainer.find('.active, .current, [aria-current="page"]').first().text()) || 1;
    
    // Trouver le nombre total de pages
    let totalPages = 1;
    
    // Méthode 1: Chercher le dernier lien de pagination (souvent le nombre total de pages)
    const lastPageLink = paginationContainer.find('a').last();
    if (lastPageLink.length) {
      const href = lastPageLink.attr('href') || '';
      const pageMatch = href.match(/page=(\d+)/);
      if (pageMatch) {
        totalPages = parseInt(pageMatch[1]);
      } else {
        // Si pas de paramètre page, essayer de prendre le texte du lien
        const pageNumber = parseInt(lastPageLink.text());
        if (!isNaN(pageNumber)) {
          totalPages = pageNumber;
        }
      }
    }
    
    // Méthode 2: Chercher tous les liens et prendre la valeur maximum
    if (totalPages === 1) {
      paginationContainer.find('a').each((_, el) => {
        const pageText = $(el).text().trim();
        const pageNumber = parseInt(pageText);
        if (!isNaN(pageNumber) && pageNumber > totalPages) {
          totalPages = pageNumber;
        }
      });
    }
    
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
