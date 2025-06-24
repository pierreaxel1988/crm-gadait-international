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

    // Try multiple URLs to find properties
    const urlsToTry = [
      url,
      "https://gadait-international.com/en/properties/",
      "https://gadait-international.com/properties/",
      "https://gadait-international.com/en/buy/",
      "https://gadait-international.com/buy/"
    ];

    let allProperties = [];
    
    for (const testUrl of urlsToTry) {
      console.log(`Tentative avec l'URL: ${testUrl}`);
      
      try {
        const properties = await extractFromUrl(testUrl, debug);
        if (properties.length > 0) {
          console.log(`Trouvé ${properties.length} propriétés sur ${testUrl}`);
          allProperties.push(...properties);
          break; // Arrêter dès qu'on trouve des propriétés
        }
      } catch (error) {
        console.log(`Erreur avec l'URL ${testUrl}:`, error.message);
        continue;
      }
    }

    // Si aucune propriété trouvée, essayer d'analyser le contenu plus en détail
    if (allProperties.length === 0 && debug) {
      console.log("Aucune propriété trouvée, analyse détaillée du contenu...");
      await debugContentAnalysis(url);
    }

    // Store properties in database
    const storedCount = await storePropertiesInDatabase(allProperties);
    console.log(`${storedCount} propriétés stockées en base de données`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `${allProperties.length} propriétés extraites, ${storedCount} stockées en base`,
        properties: allProperties,
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

async function extractFromUrl(url: string, debug = false) {
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
    throw new Error(`Erreur HTTP ${response.status} pour ${url}`);
  }

  const html = await response.text();
  console.log(`HTML récupéré avec succès pour ${url} (${html.length} caractères)`);

  if (debug) {
    console.log(`Premiers 1000 caractères du HTML de ${url}: ${html.substring(0, 1000)}`);
  }

  return await extractGadaitProperties(url, html, debug);
}

async function debugContentAnalysis(url: string) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);
    
    console.log("=== ANALYSE DÉTAILLÉE DU CONTENU ===");
    
    // Rechercher tous les éléments qui pourraient contenir des propriétés
    const potentialContainers = [
      'div[class*="property"]',
      'div[class*="listing"]',
      'div[class*="card"]',
      'div[class*="item"]',
      'article',
      '[data-testid]',
      '.swiper-slide'
    ];
    
    potentialContainers.forEach(selector => {
      const elements = $(selector);
      if (elements.length > 0) {
        console.log(`Trouvé ${elements.length} éléments avec sélecteur: ${selector}`);
      }
    });
    
    // Rechercher des liens
    const links = $('a[href]');
    console.log(`Total de ${links.length} liens trouvés`);
    
    let propertyLinks = 0;
    links.each((index, element) => {
      const href = $(element).attr('href');
      if (href && (
        href.includes('/property') || 
        href.includes('/buy') || 
        href.includes('/listing') ||
        href.includes('/real-estate')
      )) {
        propertyLinks++;
        if (propertyLinks <= 5) { // Montrer seulement les 5 premiers
          console.log(`Lien de propriété trouvé: ${href}`);
        }
      }
    });
    
    console.log(`Total de ${propertyLinks} liens de propriétés potentiels`);
    
    // Rechercher des images
    const images = $('img[src]');
    console.log(`Total de ${images.length} images trouvées`);
    
    // Rechercher du texte contenant des prix
    const textWithPrices = $('*:contains("€"), *:contains("EUR"), *:contains("$")');
    console.log(`Éléments contenant des prix: ${textWithPrices.length}`);
    
    // Vérifier si c'est du contenu généré par JavaScript
    const scripts = $('script[src]');
    console.log(`Scripts externes: ${scripts.length}`);
    
    // Rechercher des indicateurs de contenu dynamique
    const gatsbyIndicators = $('[data-gatsby], .gatsby-image-wrapper, [class*="gatsby"]');
    console.log(`Indicateurs Gatsby trouvés: ${gatsbyIndicators.length}`);
    
    console.log("=== FIN ANALYSE DÉTAILLÉE ===");
    
  } catch (error) {
    console.error("Erreur lors de l'analyse de débogage:", error);
  }
}

async function extractGadaitProperties(baseUrl: string, html: string, debug = false) {
  const $ = cheerio.load(html);
  const properties = [];
  
  console.log("Début de l'extraction des propriétés avec analyse approfondie");
  
  // Sélecteurs étendus et plus spécifiques
  const allSelectors = [
    // Sélecteurs Gatsby spécifiques
    '.gatsby-image-wrapper',
    '[data-gatsby-image-wrapper]',
    
    // Sélecteurs de cartes de propriétés
    '.property-card',
    '.listing-card',
    '.real-estate-card',
    '[class*="PropertyCard"]',
    '[class*="ListingCard"]',
    
    // Sélecteurs génériques de cartes
    '.card',
    '[class*="card"]',
    
    // Sélecteurs de grille et slides
    '.grid-item',
    '.swiper-slide',
    '.slide',
    
    // Sélecteurs par attributs data
    '[data-testid*="property"]',
    '[data-testid*="listing"]',
    '[data-testid*="card"]',
    
    // Sélecteurs par structure
    'article',
    '.item',
    '[class*="item"]'
  ];
  
  let propertyElements = $();
  
  // Essayer chaque sélecteur
  for (const selector of allSelectors) {
    const elements = $(selector);
    if (elements.length > 0) {
      console.log(`Sélecteur "${selector}": ${elements.length} éléments trouvés`);
      
      // Filtrer les éléments qui semblent être des propriétés
      elements.each((index, element) => {
        const $element = $(element);
        const text = $element.text().toLowerCase();
        
        // Critères pour identifier une propriété
        const hasPropertyIndicators = (
          text.includes('€') || 
          text.includes('eur') || 
          text.includes('bedroom') || 
          text.includes('bed') ||
          text.includes('bath') ||
          text.includes('m²') ||
          text.includes('villa') ||
          text.includes('apartment') ||
          text.includes('house') ||
          $element.find('img').length > 0 ||
          $element.find('a[href*="property"]').length > 0 ||
          $element.find('a[href*="buy"]').length > 0
        );
        
        if (hasPropertyIndicators) {
          propertyElements = propertyElements.add(element);
          if (debug && propertyElements.length <= 3) {
            console.log(`Élément de propriété potentiel trouvé avec "${selector}": ${text.substring(0, 100)}...`);
          }
        }
      });
    }
  }
  
  console.log(`Total d'éléments de propriétés potentiels: ${propertyElements.length}`);
  
  // Si aucun élément trouvé, essayer une approche différente
  if (propertyElements.length === 0) {
    console.log("Aucun élément trouvé avec les sélecteurs, recherche par contenu...");
    
    // Rechercher par contenu de prix
    const priceElements = $('*').filter(function() {
      const text = $(this).text();
      return text.match(/€\s*[\d\s,.]+|[\d\s,.]+\s*€|EUR\s*[\d\s,.]+/);
    });
    
    console.log(`Éléments avec prix trouvés: ${priceElements.length}`);
    
    priceElements.each((index, element) => {
      const $element = $(element);
      // Remonter dans la hiérarchie pour trouver le conteneur parent
      const container = $element.closest('div, article, section').first();
      if (container.length && !propertyElements.is(container[0])) {
        propertyElements = propertyElements.add(container);
      }
    });
  }
  
  console.log(`Éléments finaux pour extraction: ${propertyElements.length}`);
  
  // Extraire les données de chaque propriété
  propertyElements.each((index, element) => {
    try {
      if (debug && index < 5) {
        console.log(`\n--- Extraction propriété ${index + 1} ---`);
      }
      
      const property = extractPropertyFromElement($(element), baseUrl, $, debug);
      if (property && isValidProperty(property)) {
        properties.push(property);
        if (debug && index < 3) {
          console.log(`Propriété valide extraite: ${property.title.substring(0, 50)}...`);
        }
      } else if (debug && index < 3) {
        console.log(`Propriété rejetée (données insuffisantes)`);
      }
    } catch (error) {
      console.error(`Erreur lors de l'extraction de la propriété ${index}:`, error);
    }
  });
  
  console.log(`Propriétés valides extraites: ${properties.length}`);
  return properties;
}

function isValidProperty(property: any): boolean {
  return (
    property &&
    property.title &&
    property.title.trim().length > 5 &&
    property.title.trim().length < 300 &&
    property.external_id &&
    property.url &&
    !property.title.toLowerCase().includes('search') &&
    !property.title.toLowerCase().includes('filter') &&
    !property.title.toLowerCase().includes('menu')
  );
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
