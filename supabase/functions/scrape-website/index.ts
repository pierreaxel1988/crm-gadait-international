
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
        "Upgrade-Insecure-Requests": "1"
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération du site: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    console.log(`HTML récupéré avec succès (${html.length} caractères)`);
    console.log(`Premiers 300 caractères du HTML: ${html.substring(0, 300).replace(/\n/g, ' ')}`);

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
  
  // Afficher les 3 premiers nœuds qui pourraient contenir des informations de propriétés
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
      '[class*="property-list"] > *'
    ];
    
    console.log("Recherche de sélecteurs possibles pour les propriétés:");
    possibleContainers.forEach(selector => {
      const count = $(selector).length;
      console.log(`- ${selector}: ${count} éléments trouvés`);
    });
    
    // Analyser la structure de la page pour aider à déterminer les bons sélecteurs
    console.log("Structure générale de la page:");
    $('body > *').slice(0, 5).each((i, el) => {
      console.log(`- Element ${i}: ${$(el).prop('tagName')} avec class="${$(el).attr('class')}"`);
    });

    // Analyser la structure du main
    console.log("Structure du main:");
    $('main > *').slice(0, 10).each((i, el) => {
      console.log(`- Main child ${i}: ${$(el).prop('tagName')} avec class="${$(el).attr('class')}"`);
    });
  }
  
  // Essayer différents sélecteurs pour les cartes de propriété
  const propertySelectors = [
    '.property-item',
    '.property-card',
    '.listing-item',
    '.property',
    '.property-listing',
    '.card',
    // Nouveaux sélecteurs basés sur la structure actuelle
    '.property-grid-wrapper article',
    'div[class*="property-grid"] > article',
    'main article',
    '[class*="property-list"] > *',
    'div[class*="property"] > div'
  ];
  
  let propertyCards = $();
  for (const selector of propertySelectors) {
    const elements = $(selector);
    if (elements.length > 0) {
      console.log(`Utilisation du sélecteur "${selector}" - ${elements.length} éléments trouvés`);
      propertyCards = elements;
      break;
    }
  }
  
  if (propertyCards.length === 0) {
    console.log("Aucun sélecteur standard n'a fonctionné. Recherche d'éléments avec des attributs communs...");
    
    // Recherche plus générique basée sur des attributs/classes communs
    const genericContainers = $('[class*="property"], [class*="listing"], [class*="card"]').filter(function() {
      // Filtrer uniquement les éléments qui semblent être des cartes de propriété
      const html = $(this).html();
      return html && (
        html.includes('price') || 
        html.includes('€') || 
        html.includes('$') || 
        html.includes('bed') || 
        html.includes('bath')
      );
    });
    
    if (genericContainers.length > 0) {
      console.log(`Trouvé ${genericContainers.length} éléments génériques qui ressemblent à des propriétés`);
      propertyCards = genericContainers;
    }

    // Si toujours aucun résultat, essayer avec des sélecteurs directs
    if (propertyCards.length === 0) {
      console.log("Essai de sélecteurs directs pour le site actuel...");
      
      // Recherche directe d'articles qui contiennent des prix et des images
      propertyCards = $('article:has(img)');
      console.log(`Trouvé ${propertyCards.length} articles avec images`);
      
      if (propertyCards.length === 0) {
        // Dernière tentative: chercher des éléments avec des attributs de prix
        propertyCards = $('*:contains("€"):has(img)').filter(function() {
          const text = $(this).text();
          return /\d+,\d+/.test(text) || /€\d+/.test(text);
        });
        console.log(`Dernière tentative: ${propertyCards.length} éléments contenant des prix et images`);
      }
    }
  }
  
  console.log(`Nombre final de cartes de propriété trouvées: ${propertyCards.length}`);
  
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
  
  propertyCards.each((index, element) => {
    try {
      const card = $(element);
      
      // Extraire les informations de base
      const titleElement = card.find('h2, h3, h4, h5, .title, [class*="title"]').first();
      const title = titleElement.text().trim() || card.find('*:contains("Villa"), *:contains("Apartment")').first().text().trim();
      
      // Extraire le prix (adapter aux formats €X,XXX,XXX)
      const priceElement = card.find('.price, [class*="price"], *:contains("€")').first();
      let price = priceElement.text().trim();
      if (!price) {
        const priceMatch = card.text().match(/€[0-9,. ]+/);
        if (priceMatch) price = priceMatch[0].trim();
      }
      
      // Extraire les détails de localisation
      let location = card.find('.property-location, .location, [class*="location"], .address, [class*="address"]').first().text().trim();
      if (!location) {
        // Essayer d'autres sélecteurs pour la localisation
        const locationElements = card.find('p, span, div').filter(function() {
          const text = $(this).text().trim();
          return text.includes('Mauritius') || text.includes('Morocco') || text.includes('Spain');
        });
        if (locationElements.length > 0) {
          location = locationElements.first().text().trim();
        }
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
      let mainImage = "";
      const imgElement = card.find('img').first();
      
      // Essayer différents attributs d'image
      mainImage = imgElement.attr('src') || imgElement.attr('data-src') || imgElement.attr('data-lazy-src') || '';
      
      // Vérifier également srcset
      if (!mainImage && imgElement.attr('srcset')) {
        mainImage = imgElement.attr('srcset').split(' ')[0];
      }
      
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
      
      // Rechercher des features dans différents formats possibles
      const featureSelectors = [
        '.property-features .feature-item', 
        '.features .feature', 
        '.details .detail',
        '[class*="features"] [class*="item"]',
        '[class*="detail"]',
        '[class*="meta"]'
      ];
      
      let featureElements = $();
      for (const selector of featureSelectors) {
        const elements = card.find(selector);
        if (elements.length > 0) {
          featureElements = elements;
          break;
        }
      }
      
      featureElements.each((_, featElement) => {
        const feat = $(featElement);
        const text = feat.text().trim();
        
        if (text.toLowerCase().includes('bed') || feat.find('[class*="bed"]').length > 0) {
          const bedroomsMatch = text.match(/(\d+)/);
          if (bedroomsMatch) {
            bedrooms = parseInt(bedroomsMatch[1]);
          }
        } else if (text.toLowerCase().includes('bath') || feat.find('[class*="bath"]').length > 0) {
          const bathroomsMatch = text.match(/(\d+)/);
          if (bathroomsMatch) {
            bathrooms = parseInt(bathroomsMatch[1]);
          }
        } else if (text.includes('m²') || text.includes('sqm') || feat.find('[class*="area"]').length > 0) {
          area = text;
        }
      });
      
      // Si on n'a pas trouvé de features spécifiques, essayer de les extraire du texte général
      if (bedrooms === null) {
        const bedroomMatch = card.text().match(/(\d+)\s*(?:bed|bedroom|chambres?)/i);
        if (bedroomMatch) {
          bedrooms = parseInt(bedroomMatch[1]);
        }
      }
      
      if (bathrooms === null) {
        const bathroomMatch = card.text().match(/(\d+)\s*(?:bath|bathroom|salle de bain)/i);
        if (bathroomMatch) {
          bathrooms = parseInt(bathroomMatch[1]);
        }
      }
      
      if (!area) {
        const areaMatch = card.text().match(/(\d+)\s*(?:m²|sqm|square meters)/i);
        if (areaMatch) {
          area = areaMatch[0];
        }
      }
      
      // Extraire le type de propriété
      let propertyType = "";
      const tagElement = card.find('.property-tag, .tag, .type, [class*="tag"], [class*="type"]').first();
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
      const isExclusive = card.find('.ribbon.exclusive, .exclusive, [class*="exclusive"]').length > 0 
                          || title.toLowerCase().includes('exclusive');
      
      // Vérifier si la propriété est marquée comme nouvelle
      const isNew = card.find('.ribbon.new, .new, [class*="new"]').length > 0 
                    || title.toLowerCase().includes('new');
      
      // Log détaillé des informations extraites en mode debug
      if (debug) {
        console.log(`
          Propriété #${index + 1}:
          - Titre: ${title}
          - Prix: ${price}
          - Localisation: ${location}
          - Pays: ${country}
          - Ville: ${city}
          - Chambres: ${bedrooms}
          - Salles de bain: ${bathrooms}
          - Surface: ${area}
          - Type: ${propertyType}
          - Lien: ${propertyLink}
          - Image: ${mainImage}
          - Exclusive: ${isExclusive}
          - Nouvelle: ${isNew}
        `);
      }
      
      // Créer l'objet de propriété pour correspondre à la structure Gadait_Listings_Buy
      const property = {
        "Position": index + 1,
        "Title": title || `Property #${index + 1}`,
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
    // Essayer différents sélecteurs pour la pagination
    const paginationSelectors = [
      '.pagination',
      '.nav-links',
      '.pager',
      '[class*="pagination"]',
      '[class*="paging"]',
      'ul.page-numbers',
      '.nav-pagination',
      'nav ul'
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
    
    if (paginationContainer.length === 0) {
      console.log("Aucun élément de pagination trouvé");
      return null;
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
    
    console.log(`Pagination: page actuelle ${currentPage}, total ${totalPages} pages`);
    
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
