
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
  
  // Afficher les informations de debug si demandé
  if (debug) {
    console.log("Structure HTML de base de la page:");
    console.log("body classes:", $('body').attr('class'));
    console.log("main sections:", $('main > *').length);
    
    // Recherche d'éléments qui pourraient contenir des propriétés
    const possibleContainers = [
      '.property-item', 
      '.property-card',
      '.listing-item',
      '.property',
      '.property-listing',
      '.card',
      '.property-box',
      '.property-container',
      '.property-grid-wrapper article',
      'div[class*="property-grid"] > article',
      'main article',
      '[class*="property-list"] > *',
      'article.property-card',
      'div.property-grid article',
      '.featured-properties .property',
      '.search-results .result-item'
    ];
    
    console.log("Recherche de sélecteurs possibles pour les propriétés:");
    possibleContainers.forEach(selector => {
      const count = $(selector).length;
      console.log(`- ${selector}: ${count} éléments trouvés`);
    });
    
    // Analyser la structure de la page
    console.log("Structure générale de la page:");
    $('body > *').slice(0, 5).each((i, el) => {
      console.log(`- Element ${i}: ${$(el).prop('tagName')} avec class="${$(el).attr('class')}"`);
    });

    console.log("Structure du main:");
    $('main > *').slice(0, 10).each((i, el) => {
      console.log(`- Main child ${i}: ${$(el).prop('tagName')} avec class="${$(el).attr('class')}"`);
    });
  }
  
  // Essayer de nouvelles méthodes pour trouver les propriétés
  // 1. Sélecteurs spécifiques pour The Private Collection
  let propertyCards = $('.datocms-gallery-grid .gatsby-image-wrapper');
  
  if (propertyCards.length > 0) {
    console.log(`Found ${propertyCards.length} properties using datocms gallery selector`);
  } else {
    // 2. Recherche de cartes de propriétés basées sur des critères génériques
    propertyCards = $('article, .card, [class*="property"], [class*="listing"]').filter(function() {
      // Filtrer pour les éléments qui ont une image et un texte avec un prix ou un emplacement
      const hasImage = $(this).find('img').length > 0;
      const text = $(this).text();
      const hasPriceOrLocation = /price|€|\$|location|address/i.test(text);
      return hasImage && hasPriceOrLocation;
    });
    
    console.log(`Found ${propertyCards.length} properties using generic filter criteria`);
  }

  // 3. Rechercher directement les liens vers les pages de propriétés
  if (propertyCards.length === 0) {
    const propertyLinks = $('a[href*="property"], a[href*="villa"], a[href*="apartment"]');
    console.log(`Found ${propertyLinks.length} property links`);
    
    propertyLinks.each((index, element) => {
      const link = $(element);
      const href = link.attr('href');
      const title = link.text().trim() || link.attr('title') || `Property ${index + 1}`;
      const img = link.find('img').first();
      const imgSrc = img.attr('src') || img.attr('data-src');
      
      // Extraire des informations basiques
      const card = link.closest('div, article');
      const priceText = card.find('[class*="price"]').text() || '€ Price on request';
      const locationText = card.find('[class*="location"]').text() || 'Mauritius';
      
      // Créer une entrée de propriété avec les informations disponibles
      properties.push({
        "Position": index + 1,
        "Title": title,
        "Property Type": "Villa", // Valeur par défaut
        "Area": "Not specified",
        "Bedrooms": 0,
        "price": priceText,
        "Price and Location": `${priceText} · ${locationText}`,
        "Property Link": href.startsWith('http') ? href : `https://the-private-collection.com${href.startsWith('/') ? '' : '/'}${href}`,
        "Main Image": imgSrc ? (imgSrc.startsWith('http') ? imgSrc : `https://the-private-collection.com${imgSrc.startsWith('/') ? '' : '/'}${imgSrc}`) : null,
        "city": locationText.split(',')[0] || 'Not specified',
        "country": "Mauritius",
        "is_new": false,
        "is_exclusive": false
      });
    });
  }
  
  // Si aucune méthode n'a fonctionné, essayer de parcourir tous les liens
  if (properties.length === 0) {
    console.log("Trying more aggressive extraction methods");
    
    // Analyser toute la page à la recherche d'images et de liens
    $('a').each((index, element) => {
      const link = $(element);
      const href = link.attr('href');
      
      // Filtrer uniquement les liens qui semblent être des propriétés
      if (href && (href.includes('property') || href.includes('villa') || href.includes('apartment') || href.includes('house'))) {
        const title = link.text().trim() || `Property ${index + 1}`;
        const img = link.find('img').first();
        const imgSrc = img.attr('src') || img.attr('data-src');
        
        properties.push({
          "Position": index + 1,
          "Title": title,
          "Property Type": "Villa",
          "Area": "Not specified",
          "Bedrooms": 0,
          "price": "Price on request",
          "Price and Location": `Price on request · Mauritius`,
          "Property Link": href.startsWith('http') ? href : `https://the-private-collection.com${href.startsWith('/') ? '' : '/'}${href}`,
          "Main Image": imgSrc ? (imgSrc.startsWith('http') ? imgSrc : `https://the-private-collection.com${imgSrc.startsWith('/') ? '' : '/'}${imgSrc}`) : null,
          "city": "Not specified",
          "country": "Mauritius",
          "is_new": false,
          "is_exclusive": false
        });
      }
    });
  }
  
  // Si toujours aucun résultat, journaliser le problème pour débogage futur
  if (properties.length === 0 && debug) {
    console.log("Aucune propriété trouvée. Voici les classes trouvées dans la page:");
    const classes = new Set();
    $('*').each((_, el) => {
      const className = $(el).attr('class');
      if (className) {
        className.split(' ').forEach(c => classes.add(c.trim()));
      }
    });
    console.log([...classes].join(', '));
    
    // Rechercher des termes liés à l'immobilier dans la page
    const pageText = $('body').text();
    const realEstateTerms = ['property', 'villa', 'apartment', 'house', 'bedroom', 'bathroom', 'price', 'sqm', 'm²', '€'];
    console.log("Termes immobiliers trouvés dans la page:");
    realEstateTerms.forEach(term => {
      if (pageText.toLowerCase().includes(term.toLowerCase())) {
        console.log(`- "${term}" trouvé`);
      } else {
        console.log(`- "${term}" NON trouvé`);
      }
    });
    
    // Vérifier si nous avons une page d'erreur ou de redirection
    if (pageText.toLowerCase().includes('404') || pageText.toLowerCase().includes('not found')) {
      console.log("Il s'agit probablement d'une page d'erreur 404");
    }
    if (pageText.toLowerCase().includes('redirect') || pageText.toLowerCase().includes('redirected')) {
      console.log("Il s'agit probablement d'une page de redirection");
    }
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
