
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as cheerio from "https://esm.sh/cheerio@1.0.0-rc.12";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    const url = requestData.url || "https://gadait-international.com/en/search/";
    const debug = requestData.debug || false;

    console.log(`Starting Gadait property extraction from: ${url}`);

    // Validate that this is a Gadait URL
    if (!url.includes("gadait-international.com")) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Cette fonction ne supporte que les URLs de gadait-international.com",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Fetch the webpage with appropriate headers
    const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    
    const response = await fetch(url, {
      headers: {
        "User-Agent": userAgent,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération du site: ${response.status}`);
    }

    const html = await response.text();
    console.log(`HTML récupéré avec succès (${html.length} caractères)`);

    if (debug) {
      console.log(`Premiers 500 caractères du HTML: ${html.substring(0, 500)}`);
    }

    // Extract properties from the HTML
    const properties = await extractGadaitProperties(url, html, debug);
    console.log(`${properties.length} propriétés extraites`);

    // Store properties in database
    const storedCount = await storePropertiesInDatabase(properties);
    console.log(`${storedCount} propriétés stockées en base de données`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `${properties.length} propriétés extraites, ${storedCount} stockées en base`,
        properties,
        storedCount,
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

async function extractGadaitProperties(baseUrl: string, html: string, debug = false) {
  const $ = cheerio.load(html);
  const properties = [];
  
  console.log("Début de l'extraction des propriétés depuis la page Gadait avec les nouveaux sélecteurs");
  
  // Sélecteurs spécifiques basés sur la structure HTML réelle de Gadait
  const specificSelectors = [
    '.swiper-slide',
    '[data-testid="property-card"]',
    '.property-item',
    '.listing-item',
    '.gatsby-image-wrapper',
    '[class*="PropertyCard"]',
    '[class*="property"]'
  ];
  
  let propertyElements = $();
  
  // Essayer de trouver les éléments de propriété avec les sélecteurs spécifiques
  for (const selector of specificSelectors) {
    const elements = $(selector);
    if (elements.length > 0) {
      console.log(`Trouvé ${elements.length} éléments avec le sélecteur: ${selector}`);
      // Filtrer pour ne garder que les éléments qui semblent être des propriétés
      elements.each((index, element) => {
        const $element = $(element);
        // Vérifier si l'élément contient des indicateurs de propriété
        if ($element.find('img').length > 0 || 
            $element.find('a[href*="/property"]').length > 0 || 
            $element.find('a[href*="/buy"]').length > 0 ||
            $element.text().match(/€|EUR|\$|USD/)) {
          propertyElements = propertyElements.add(element);
        }
      });
      
      if (propertyElements.length > 0) {
        console.log(`${propertyElements.length} éléments de propriété valides trouvés avec ${selector}`);
        break;
      }
    }
  }
  
  // Si aucun sélecteur spécifique ne fonctionne, essayer une approche plus large
  if (propertyElements.length === 0) {
    console.log("Recherche d'éléments avec des liens de propriétés...");
    
    // Chercher des liens vers des pages de propriétés
    $('a[href*="/property"], a[href*="/buy"], a[href*="/listing"]').each((index, element) => {
      const $link = $(element);
      const href = $link.attr('href');
      
      if (href && !href.includes('#') && !href.includes('javascript:')) {
        // Remonter dans la hiérarchie pour trouver le conteneur de la propriété
        let propertyContainer = $link.closest('div, article, section, li').first();
        
        // Si le conteneur est trop petit, remonter encore
        if (propertyContainer.length && propertyContainer.text().trim().length < 50) {
          propertyContainer = propertyContainer.parent().closest('div, article, section').first();
        }
        
        if (propertyContainer.length && !propertyElements.is(propertyContainer[0])) {
          propertyElements = propertyElements.add(propertyContainer);
        }
      }
    });
    
    console.log(`Trouvé ${propertyElements.length} conteneurs de propriétés via les liens`);
  }
  
  // Extraire les données de chaque propriété trouvée
  if (propertyElements.length > 0) {
    propertyElements.each((index, element) => {
      try {
        if (debug && index < 3) {
          console.log(`\n--- Extraction propriété ${index + 1} ---`);
          console.log(`HTML: ${$(element).html()?.substring(0, 200)}...`);
        }
        
        const property = extractPropertyFromElement($(element), baseUrl, $, debug);
        if (property && property.title && property.title.trim() !== "" && property.title.length > 5) {
          properties.push(property);
          if (debug && index < 3) {
            console.log(`Propriété extraite: ${JSON.stringify(property, null, 2)}`);
          }
        }
      } catch (error) {
        console.error(`Erreur lors de l'extraction de la propriété ${index}:`, error);
      }
    });
  }
  
  if (debug) {
    console.log(`\nRésumé de l'extraction:`);
    console.log(`- Éléments trouvés: ${propertyElements.length}`);
    console.log(`- Propriétés valides extraites: ${properties.length}`);
    if (properties.length > 0) {
      console.log(`- Première propriété: ${properties[0].title}`);
    }
  }
  
  return properties.filter(p => p && p.title && p.title.trim() !== "" && p.title.length > 5);
}

function extractPropertyFromElement($element, baseUrl: string, $: any, debug = false) {
  // Extraire le titre avec plus de priorité sur les vrais titres
  let title = "";
  const titleSelectors = [
    'h1', 'h2', 'h3', 'h4', 'h5',
    '[data-title]',
    '.title', '.property-title', '.listing-title', '.card-title',
    '.property-name', '.listing-name',
    '[class*="title"]', '[class*="name"]', '[class*="heading"]'
  ];
  
  for (const selector of titleSelectors) {
    const titleElement = $element.find(selector).first();
    if (titleElement.length) {
      const candidateTitle = titleElement.text().trim();
      if (candidateTitle && candidateTitle.length > 5 && candidateTitle.length < 200) {
        title = candidateTitle;
        if (debug) console.log(`Titre trouvé avec ${selector}: ${title}`);
        break;
      }
    }
  }
  
  // Si pas de titre trouvé, essayer depuis les liens
  if (!title) {
    const linkElement = $element.find('a').first();
    if (linkElement.length) {
      title = linkElement.attr('title') || linkElement.attr('aria-label') || linkElement.text().trim();
      if (debug) console.log(`Titre depuis lien: ${title}`);
    }
  }
  
  // Dernier recours : prendre du texte significatif
  if (!title || title.length < 5) {
    const textContent = $element.text().trim();
    const lines = textContent.split('\n').map(line => line.trim()).filter(line => line.length > 5);
    if (lines.length > 0) {
      title = lines[0].substring(0, 100);
      if (debug) console.log(`Titre par défaut: ${title}`);
    }
  }
  
  if (!title || title.length < 5) {
    if (debug) console.log("Aucun titre valide trouvé, élément ignoré");
    return null;
  }
  
  // Extraire le prix avec plus de précision
  let price = null;
  let currency = "EUR";
  const priceSelectors = [
    '[data-price]',
    '.price', '.property-price', '.listing-price', '.cost', '.amount',
    '[class*="price"]', '[class*="cost"]', '[class*="amount"]'
  ];
  
  for (const selector of priceSelectors) {
    const priceElement = $element.find(selector).first();
    if (priceElement.length) {
      const priceText = priceElement.text().trim();
      const priceMatch = priceText.match(/([\d\s,.]+)/);
      if (priceMatch) {
        const cleanPrice = priceMatch[1].replace(/[\s,]/g, '');
        const numPrice = parseFloat(cleanPrice);
        if (!isNaN(numPrice) && numPrice > 0) {
          price = numPrice;
          if (priceText.includes('$')) currency = "USD";
          if (debug) console.log(`Prix trouvé avec ${selector}: ${price} ${currency}`);
          break;
        }
      }
    }
  }
  
  // Recherche de prix dans le texte général si pas trouvé
  if (!price) {
    const text = $element.text();
    const pricePatterns = [
      /€\s*([\d\s,.]+)/,
      /([\d\s,.]+)\s*€/,
      /EUR\s*([\d\s,.]+)/,
      /([\d\s,.]+)\s*EUR/,
      /\$\s*([\d\s,.]+)/,
      /([\d\s,.]+)\s*\$/
    ];
    
    for (const pattern of pricePatterns) {
      const match = text.match(pattern);
      if (match) {
        const cleanPrice = match[1].replace(/[\s,]/g, '');
        const numPrice = parseFloat(cleanPrice);
        if (!isNaN(numPrice) && numPrice > 10000) { // Prix minimum réaliste
          price = numPrice;
          currency = text.includes('$') ? "USD" : "EUR";
          if (debug) console.log(`Prix trouvé dans le texte: ${price} ${currency}`);
          break;
        }
      }
    }
  }
  
  // Extraire la localisation
  let location = "";
  const locationSelectors = [
    '[data-location]', '[data-address]',
    '.location', '.address', '.place', '.city', '.area',
    '[class*="location"]', '[class*="address"]', '[class*="place"]', '[class*="city"]'
  ];
  
  for (const selector of locationSelectors) {
    const locationElement = $element.find(selector).first();
    if (locationElement.length) {
      const candidateLocation = locationElement.text().trim();
      if (candidateLocation && candidateLocation.length > 2 && candidateLocation.length < 100) {
        location = candidateLocation;
        if (debug) console.log(`Localisation trouvée: ${location}`);
        break;
      }
    }
  }
  
  // Extraire l'URL de la propriété
  let propertyUrl = "";
  const linkElement = $element.find('a').first();
  if (linkElement.length) {
    const href = linkElement.attr('href');
    if (href) {
      propertyUrl = href.startsWith('http') ? href : new URL(href, baseUrl).toString();
      if (debug) console.log(`URL trouvée: ${propertyUrl}`);
    }
  }
  
  if (!propertyUrl && $element.is('a')) {
    const href = $element.attr('href');
    if (href) {
      propertyUrl = href.startsWith('http') ? href : new URL(href, baseUrl).toString();
    }
  }
  
  // Extraire l'image principale
  let mainImage = "";
  const imageSelectors = [
    '.gatsby-image-wrapper img',
    '[data-main-image]',
    '[data-src]',
    'img[src]',
    'img[data-src]'
  ];
  
  for (const selector of imageSelectors) {
    const imageElement = $element.find(selector).first();
    if (imageElement.length) {
      const src = imageElement.attr('src') || imageElement.attr('data-src') || imageElement.attr('data-main-image');
      if (src && !src.includes('placeholder') && !src.includes('loading')) {
        mainImage = src.startsWith('http') ? src : new URL(src, baseUrl).toString();
        if (debug) console.log(`Image trouvée: ${mainImage}`);
        break;
      }
    }
  }
  
  // Extraire les caractéristiques de base
  const text = $element.text().toLowerCase();
  
  let bedrooms = null;
  const bedroomPatterns = [
    /(\d+)\s*(?:bed|bedroom|chambre|room)/i,
    /bed(?:room)?s?\s*:?\s*(\d+)/i,
    /(\d+)\s*br/i
  ];
  
  for (const pattern of bedroomPatterns) {
    const match = text.match(pattern);
    if (match) {
      bedrooms = parseInt(match[1]);
      if (debug) console.log(`Chambres trouvées: ${bedrooms}`);
      break;
    }
  }
  
  let bathrooms = null;
  const bathroomPatterns = [
    /(\d+)\s*(?:bath|bathroom|salle de bain)/i,
    /bath(?:room)?s?\s*:?\s*(\d+)/i,
    /(\d+)\s*ba/i
  ];
  
  for (const pattern of bathroomPatterns) {
    const match = text.match(pattern);
    if (match) {
      bathrooms = parseInt(match[1]);
      if (debug) console.log(`Salles de bain trouvées: ${bathrooms}`);
      break;
    }
  }
  
  let area = null;
  const areaPatterns = [
    /(\d+[\d,.]*)\s*m[²2]/i,
    /(\d+[\d,.]*)\s*sq\s*m/i,
    /area\s*:?\s*(\d+[\d,.]*)/i
  ];
  
  for (const pattern of areaPatterns) {
    const match = text.match(pattern);
    if (match) {
      area = parseFloat(match[1].replace(',', '.'));
      if (debug) console.log(`Surface trouvée: ${area}m²`);
      break;
    }
  }
  
  // Générer un ID externe plus robuste
  const external_id = propertyUrl ? 
    propertyUrl.split('/').filter(Boolean).pop()?.replace(/[^a-zA-Z0-9]/g, '') || 
    'gadait-' + title.replace(/[^a-zA-Z0-9]/g, '').substring(0, 30) + '-' + Date.now() :
    'gadait-' + title.replace(/[^a-zA-Z0-9]/g, '').substring(0, 30) + '-' + Date.now();
  
  const property = {
    external_id,
    title: title || "Propriété Gadait",
    description: $element.text().trim().substring(0, 500) || "",
    price,
    currency,
    location: location || "",
    country: "Mauritius", // Default pour Gadait
    property_type: extractPropertyType(text),
    bedrooms,
    bathrooms,
    area,
    area_unit: "m²",
    main_image: mainImage || "",
    images: mainImage ? [mainImage] : [],
    features: extractFeatures($element.text()),
    amenities: [],
    url: propertyUrl || baseUrl,
    is_available: true,
    is_featured: false
  };
  
  if (debug) {
    console.log(`Propriété créée: ${JSON.stringify(property, null, 2)}`);
  }
  
  return property;
}

function extractPropertyType(text: string): string {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('villa') || lowerText.includes('luxury')) {
    return 'Villa';
  } else if (lowerText.includes('apartment') || lowerText.includes('flat')) {
    return 'Apartment';
  } else if (lowerText.includes('house') || lowerText.includes('maison')) {
    return 'House';
  } else if (lowerText.includes('penthouse')) {
    return 'Penthouse';
  } else if (lowerText.includes('land') || lowerText.includes('plot')) {
    return 'Land';
  }
  
  return 'Property';
}

function extractFeatures(text: string): string[] {
  const features = [];
  const lowerText = text.toLowerCase();
  
  const featureKeywords = [
    'pool', 'swimming pool', 'garden', 'terrace', 'balcony', 'garage',
    'parking', 'sea view', 'mountain view', 'furnished', 'air conditioning',
    'elevator', 'security', 'gym', 'spa'
  ];
  
  for (const keyword of featureKeywords) {
    if (lowerText.includes(keyword)) {
      features.push(keyword.charAt(0).toUpperCase() + keyword.slice(1));
    }
  }
  
  return features;
}

async function storePropertiesInDatabase(properties: any[]): Promise<number> {
  if (properties.length === 0) {
    return 0;
  }
  
  console.log(`Tentative de stockage de ${properties.length} propriétés en base`);
  
  let storedCount = 0;
  
  for (const property of properties) {
    try {
      // Vérifier si la propriété existe déjà
      const { data: existing } = await supabase
        .from('gadait_properties')
        .select('id')
        .eq('external_id', property.external_id)
        .single();
      
      if (existing) {
        // Mettre à jour la propriété existante
        const { error: updateError } = await supabase
          .from('gadait_properties')
          .update({
            ...property,
            scraped_at: new Date().toISOString()
          })
          .eq('external_id', property.external_id);
        
        if (updateError) {
          console.error(`Erreur lors de la mise à jour de la propriété ${property.external_id}:`, updateError);
        } else {
          console.log(`Propriété mise à jour: ${property.title}`);
          storedCount++;
        }
      } else {
        // Insérer une nouvelle propriété
        const { error: insertError } = await supabase
          .from('gadait_properties')
          .insert(property);
        
        if (insertError) {
          console.error(`Erreur lors de l'insertion de la propriété ${property.external_id}:`, insertError);
        } else {
          console.log(`Nouvelle propriété insérée: ${property.title}`);
          storedCount++;
        }
      }
    } catch (error) {
      console.error(`Erreur lors du traitement de la propriété ${property.external_id}:`, error);
    }
  }
  
  console.log(`${storedCount} propriétés traitées avec succès`);
  return storedCount;
}
