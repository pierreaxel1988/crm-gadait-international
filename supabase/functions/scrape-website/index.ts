
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
    const url = requestData.url || "https://the-private-collection.com/en/search/";
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

    console.log(`URL cible finale: ${targetUrl}`);

    // Liste des user-agents pour rotation
    const userAgents = [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 Edg/121.0.0.0",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
    ];
    
    // Choisir un user agent aléatoire
    const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
    
    console.log(`Utilisation du User-Agent: ${userAgent.substring(0, 30)}...`);
    
    // Ajouter un délai aléatoire avant la requête pour éviter les blocages
    const delay = Math.floor(Math.random() * 2000) + 1000;
    await new Promise(resolve => setTimeout(resolve, delay));
    console.log(`Délai de ${delay}ms avant la requête`);
    
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
        "Upgrade-Insecure-Requests": "1",
        "Referer": "https://www.google.com/"
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération du site: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    console.log(`HTML récupéré avec succès (${html.length} caractères)`);
    
    if (debug) {
      console.log(`Premiers 300 caractères du HTML: ${html.substring(0, 300).replace(/\n/g, ' ')}`);
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
  
  // Mode debug - afficher la structure HTML pour comprendre le problème
  if (debug) {
    console.log("DEBUT DEBUG - Structure HTML de base :");
    console.log("Titre de la page :", $('title').text());
    console.log("Nombre total d'articles :", $('article').length);
    console.log("Nombre total de divs :", $('div').length);
    console.log("Classes disponibles dans la page :", 
      [...new Set($('*').map((_, el) => $(el).attr('class')).get().filter(c => c).join(' ').split(' '))].join(', '));
  }
  
  // Essayer plusieurs sélecteurs possibles pour les cartes de propriété
  const possibleSelectors = [
    '.property-item',
    '.property-card',
    '.listing-item',
    'article',
    '.card',
    'div[class*="property"]',
    'div[class*="listing"]',
    '.gatsby-image-wrapper',
    '.datocms-gallery-grid .gatsby-image-wrapper',
    '[class*="estate"] article',
    '[class*="property"] article'
  ];
  
  let propertyCards = $();
  let usedSelector = '';
  
  for (const selector of possibleSelectors) {
    const cards = $(selector);
    if (cards.length > 0) {
      propertyCards = cards;
      usedSelector = selector;
      break;
    }
  }
  
  console.log(`Sélecteur utilisé: "${usedSelector}" - ${propertyCards.length} cartes trouvées`);
  
  // Si aucun sélecteur n'a fonctionné, chercher des éléments avec des prix
  if (propertyCards.length === 0) {
    console.log("Aucun sélecteur standard n'a fonctionné, recherche par contenu...");
    propertyCards = $('*').filter(function() {
      const text = $(this).text();
      return text.includes('€') && $(this).find('img').length > 0;
    });
    console.log(`Trouvé ${propertyCards.length} éléments contenant des prix et des images`);
  }
  
  // Si toujours rien trouvé, chercher des liens qui ressemblent à des propriétés
  if (propertyCards.length === 0) {
    console.log("Recherche des liens vers des propriétés...");
    const propertyLinks = $('a[href*="property"], a[href*="villa"], a[href*="apartment"], a[href*="estate"]');
    console.log(`Trouvé ${propertyLinks.length} liens qui semblent être des propriétés`);
    
    propertyLinks.each((index, element) => {
      try {
        const link = $(element);
        const href = link.attr('href');
        if (!href) return;
        
        const title = link.text().trim() || link.attr('title') || `Property ${index + 1}`;
        let mainImage = '';
        const img = link.find('img').first();
        if (img.length) {
          mainImage = img.attr('src') || img.attr('data-src') || img.attr('data-lazy-src') || '';
        }
        
        // Convertir l'URL en absolue si nécessaire
        let propertyLink = href;
        if (!propertyLink.startsWith('http')) {
          propertyLink = `https://the-private-collection.com${propertyLink.startsWith('/') ? '' : '/'}${propertyLink}`;
        }
        
        // Convertir l'image en URL absolue si nécessaire
        if (mainImage && !mainImage.startsWith('http')) {
          mainImage = `https://the-private-collection.com${mainImage.startsWith('/') ? '' : '/'}${mainImage}`;
        }
        
        const property = {
          "Position": index + 1,
          "Title": title || `Property #${index + 1}`,
          "Main Image": mainImage || "",
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
          "Price and Location": "Price on request · Mauritius",
          "price": "Price on request",
          "Property Type": "Villa",
          "Bedrooms": 0,
          "Area": "Not specified",
          "country": "Mauritius",
          "city": "Unknown",
          "Property Link": propertyLink,
          "is_exclusive": false,
          "is_new": false
        };
        
        properties.push(property);
      } catch (error) {
        console.error(`Erreur lors de l'extraction du lien ${index}:`, error);
      }
    });
  } else {
    // Traiter les cartes de propriété trouvées
    propertyCards.each((index, element) => {
      try {
        const card = $(element);
        
        // Extraction du titre - multiples approches
        let title = "";
        const titleSelectors = [
          '.property-title h5',
          '.property-title',
          'h2', 'h3', 'h4', 'h5',
          '.title', '.heading',
          '[class*="title"]'
        ];
        
        for (const selector of titleSelectors) {
          const titleEl = card.find(selector).first();
          if (titleEl.length) {
            title = titleEl.text().trim();
            if (title) break;
          }
        }
        
        // Fallback pour le titre
        if (!title) {
          title = card.text().split('\n')[0].trim() || `Property #${index + 1}`;
        }
        
        // Extraction du prix - multiples approches
        let price = "";
        const priceSelectors = [
          '.property-price .price-tag',
          '.property-price',
          '.price',
          '.cost',
          '[class*="price"]'
        ];
        
        for (const selector of priceSelectors) {
          const priceEl = card.find(selector).first();
          if (priceEl.length) {
            price = priceEl.text().trim();
            if (price) break;
          }
        }
        
        // Si pas de prix trouvé, chercher dans le texte avec €
        if (!price) {
          const priceMatch = card.text().match(/€[0-9,. ]+|[0-9,. ]+€/);
          if (priceMatch) {
            price = priceMatch[0].trim();
          } else {
            price = "Price on request";
          }
        }
        
        // Extraction de la localisation
        let location = "";
        const locationSelectors = [
          '.property-location',
          '.location',
          '.address',
          '[class*="location"]',
          '[class*="address"]'
        ];
        
        for (const selector of locationSelectors) {
          const locEl = card.find(selector).first();
          if (locEl.length) {
            location = locEl.text().trim();
            if (location) break;
          }
        }
        
        // Extraction du pays et de la ville
        let country = "Mauritius";
        let city = "";
        
        // Chercher des noms de villes communes à Maurice
        const mauritiusCities = [
          'Rivière Noire', 'Black River', 'Grand Baie', 'Flic en Flac',
          'Tamarin', 'Mont Calme', 'Mont Mascal', 'Belle Mare', 
          'Trou aux Biches', 'Port Louis', 'Quatre Bornes', 'Trou d\'Eau Douce'
        ];
        
        for (const cityName of mauritiusCities) {
          if (card.text().includes(cityName) || location.includes(cityName)) {
            city = cityName;
            break;
          }
        }
        
        // Extraction des images
        let mainImage = "";
        const imgSelectors = [
          'img',
          'img.lazy',
          '.gatsby-image-wrapper img',
          '[class*="image"] img',
          '[data-src]'
        ];
        
        for (const selector of imgSelectors) {
          const imgEl = card.find(selector).first();
          if (imgEl.length) {
            mainImage = imgEl.attr('src') || imgEl.attr('data-src') || imgEl.attr('data-lazy-src') || '';
            if (mainImage) break;
          }
        }
        
        // Convertir l'image en URL absolue si nécessaire
        if (mainImage && !mainImage.startsWith('http')) {
          mainImage = `https://the-private-collection.com${mainImage.startsWith('/') ? '' : '/'}${mainImage}`;
        }
        
        // Extraction des caractéristiques
        let bedrooms = null;
        let bathrooms = null;
        let area = "";
        
        // Chercher dans le texte général
        const bedroomMatch = card.text().match(/(\d+)\s*(?:bed|bedroom|chambre)/i);
        if (bedroomMatch) bedrooms = parseInt(bedroomMatch[1]);
        
        const areaMatch = card.text().match(/(\d+(?:\.\d+)?)\s*(?:m²|sqm)/i);
        if (areaMatch) area = `${areaMatch[1]} m²`;
        
        // Extraction du type de propriété
        let propertyType = "Villa"; // Par défaut
        
        if (title) {
          const titleLower = title.toLowerCase();
          if (titleLower.includes('apartment')) propertyType = "Apartment";
          else if (titleLower.includes('house')) propertyType = "House";
          else if (titleLower.includes('penthouse')) propertyType = "Penthouse";
          else if (titleLower.includes('condo')) propertyType = "Condo";
        }
        
        // Extraction du lien
        let propertyLink = card.find('a').attr('href') || '';
        if (!propertyLink) {
          const parentLink = card.closest('a');
          if (parentLink.length) {
            propertyLink = parentLink.attr('href') || '';
          }
        }
        
        if (propertyLink && !propertyLink.startsWith('http')) {
          propertyLink = `https://the-private-collection.com${propertyLink.startsWith('/') ? '' : '/'}${propertyLink}`;
        }
        
        // Propriétés exclusive/nouvelle
        const isExclusive = card.find('.exclusive, [class*="exclusive"]').length > 0 || 
                           title.toLowerCase().includes('exclusive');
        const isNew = card.find('.new, [class*="new"]').length > 0 || 
                     title.toLowerCase().includes('new');
        
        // Créer l'objet propriété
        const property = {
          "Position": index + 1,
          "Title": title || `Property #${index + 1}`,
          "Main Image": mainImage || "",
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
          "Price and Location": `${price} · ${location || 'Mauritius'}`.trim(),
          "price": price || "Price on request",
          "Property Type": propertyType,
          "Bedrooms": bedrooms || 0,
          "Area": area || "Not specified",
          "country": country,
          "city": city || "Unknown",
          "Property Link": propertyLink || "",
          "is_exclusive": isExclusive,
          "is_new": isNew
        };
        
        properties.push(property);
      } catch (error) {
        console.error(`Erreur lors de l'extraction de la propriété ${index}:`, error);
      }
    });
  }
  
  // Si toujours aucune propriété trouvée, enregistrer plus de détails pour le débogage
  if (properties.length === 0 && debug) {
    console.log("Aucune propriété trouvée après toutes les tentatives.");
    console.log("Contenu HTML complet de la page:");
    console.log(html.substring(0, 5000) + "...[tronqué]");
  }
  
  return { properties };
}

// Fonction pour extraire les informations de pagination
function extractPagination(html: string) {
  const $ = cheerio.load(html);
  
  try {
    // Essayer différents sélecteurs pour la pagination
    const paginationSelectors = [
      '.pagination',
      '.nav-links',
      '.pager',
      '[class*="pagination"]',
      '[class*="paging"]',
      'ul.page-numbers',
      '.nav-pagination',
      'nav ul',
      '.page-navigation'
    ];
    
    let paginationContainer = $();
    for (const selector of paginationSelectors) {
      const elements = $(selector);
      if (elements.length > 0) {
        console.log(`Sélecteur de pagination trouvé: ${selector}`);
        paginationContainer = elements;
        break;
      }
    }
    
    // Si aucun élément de pagination n'est trouvé, supposer qu'il y a une seule page
    if (paginationContainer.length === 0) {
      console.log("Aucun élément de pagination trouvé");
      return { currentPage: 1, totalPages: 1, hasNextPage: false, hasPrevPage: false };
    }
    
    // Trouver la page active
    let currentPage = 1;
    const activeSelectors = ['.active', '.current', '.selected', '[aria-current="page"]'];
    
    for (const selector of activeSelectors) {
      const activeElement = paginationContainer.find(selector);
      if (activeElement.length > 0) {
        currentPage = parseInt(activeElement.text()) || 1;
        break;
      }
    }
    
    // Trouver le nombre total de pages
    let totalPages = 1;
    
    // Parcourir tous les liens de pagination pour trouver la dernière page
    paginationContainer.find('a, span').each((_, el) => {
      const pageText = $(el).text().trim();
      const pageNumber = parseInt(pageText);
      if (!isNaN(pageNumber) && pageNumber > totalPages) {
        totalPages = pageNumber;
      }
    });
    
    // Chercher aussi des indicateurs de dernière page
    const lastPageLink = paginationContainer.find('a:contains("Last"), a:contains("»"), a:contains("Dernière")');
    if (lastPageLink.length > 0) {
      const href = lastPageLink.attr('href');
      if (href) {
        const match = href.match(/page=(\d+)/);
        if (match && match[1]) {
          const lastPage = parseInt(match[1]);
          if (lastPage > totalPages) {
            totalPages = lastPage;
          }
        }
      }
    }
    
    // Si aucune page n'est trouvée, supposer qu'il y a au moins 10 pages
    if (totalPages <= 1) {
      totalPages = 10;
    }
    
    console.log(`Pagination: page actuelle ${currentPage}, total ${totalPages} pages`);
    
    return {
      currentPage,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1
    };
  } catch (error) {
    console.error("Erreur lors de l'extraction de la pagination:", error);
    return { currentPage: 1, totalPages: 10, hasNextPage: true, hasPrevPage: false };
  }
}
