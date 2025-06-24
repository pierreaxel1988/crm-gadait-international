
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
  
  console.log("Début de l'extraction des propriétés depuis la page de recherche Gadait");
  
  // Sélecteurs spécifiques pour la page de recherche Gadait
  const propertySelectors = [
    '.property-item',
    '.listing-card',
    '.search-result-item',
    '.property-card',
    '.property-listing',
    '.grid-item',
    '[data-property]',
    '.card.property',
    '.result-item'
  ];
  
  let propertyElements = $();
  
  // Essayer de trouver les éléments de propriété avec différents sélecteurs
  for (const selector of propertySelectors) {
    const elements = $(selector);
    if (elements.length > 0) {
      console.log(`Trouvé ${elements.length} propriétés avec le sélecteur: ${selector}`);
      propertyElements = elements;
      break;
    }
  }
  
  // Si aucun sélecteur spécifique ne fonctionne, chercher des patterns plus génériques
  if (propertyElements.length === 0) {
    console.log("Recherche de patterns génériques pour les propriétés...");
    
    // Chercher des éléments contenant des liens vers des pages de propriétés
    $('a[href*="/property"], a[href*="/listing"], a[href*="/buy"]').each((index, element) => {
      const $element = $(element);
      const href = $element.attr('href');
      
      if (href && !href.includes('#') && !href.includes('javascript:')) {
        const parentCard = $element.closest('div, article, section').first();
        if (parentCard.length && !propertyElements.is(parentCard[0])) {
          propertyElements = propertyElements.add(parentCard);
        }
      }
    });
    
    console.log(`Trouvé ${propertyElements.length} éléments potentiels de propriétés`);
  }
  
  // Extraire les données de chaque propriété trouvée
  if (propertyElements.length > 0) {
    propertyElements.each((index, element) => {
      try {
        const property = extractPropertyFromElement($(element), baseUrl, $);
        if (property && property.title && property.title.trim() !== "") {
          properties.push(property);
        }
      } catch (error) {
        console.error(`Erreur lors de l'extraction de la propriété ${index}:`, error);
      }
    });
  }
  
  // Si toujours aucune propriété trouvée, essayer une approche plus large
  if (properties.length === 0) {
    console.log("Recherche de contenu avec des prix pour identifier les propriétés...");
    
    $("*").filter(function() {
      const text = $(this).text();
      return text.match(/€[\d\s,.]+|[\d\s,.]+\s*€|EUR[\d\s,.]+|[\d\s,.]+\s*EUR|\$[\d\s,.]+/i);
    }).each((index, element) => {
      if (index < 50) { // Limiter pour éviter trop de résultats
        try {
          const $element = $(element);
          const property = extractPropertyFromElement($element, baseUrl, $);
          if (property && property.title && !properties.some(p => p.title === property.title)) {
            properties.push(property);
          }
        } catch (error) {
          console.error(`Erreur lors de l'extraction générique ${index}:`, error);
        }
      }
    });
  }
  
  if (debug) {
    console.log(`Propriétés extraites: ${JSON.stringify(properties.slice(0, 3), null, 2)}`);
  }
  
  return properties.filter(p => p && p.title && p.title.trim() !== "");
}

function extractPropertyFromElement($element, baseUrl: string, $: any) {
  // Extraire le titre
  let title = "";
  const titleSelectors = [
    'h1', 'h2', 'h3', 'h4',
    '.title', '.property-title', '.listing-title', '.card-title',
    '[class*="title"]', '[class*="name"]'
  ];
  
  for (const selector of titleSelectors) {
    const titleElement = $element.find(selector).first();
    if (titleElement.length) {
      title = titleElement.text().trim();
      if (title && title.length > 5) break;
    }
  }
  
  if (!title) {
    // Essayer de récupérer le titre depuis un lien
    const linkElement = $element.find('a').first();
    if (linkElement.length) {
      title = linkElement.attr('title') || linkElement.text().trim();
    }
  }
  
  if (!title || title.length < 5) {
    return null; // Skip if no meaningful title
  }
  
  // Extraire le prix
  let price = null;
  let currency = "EUR";
  const priceSelectors = [
    '.price', '.property-price', '.listing-price', '.cost',
    '[class*="price"]', '[class*="cost"]'
  ];
  
  for (const selector of priceSelectors) {
    const priceElement = $element.find(selector).first();
    if (priceElement.length) {
      const priceText = priceElement.text().trim();
      const priceMatch = priceText.match(/([\d\s,.]+)/);
      if (priceMatch) {
        price = parseFloat(priceMatch[1].replace(/[\s,]/g, ''));
        if (priceText.includes('$')) currency = "USD";
        break;
      }
    }
  }
  
  if (!price) {
    // Recherche de prix dans le texte général
    const text = $element.text();
    const priceMatch = text.match(/€\s*([\d\s,.]+)|(\d[\d\s,.]*)\s*€|\$\s*([\d\s,.]+)|(\d[\d\s,.]*)\s*\$/);
    if (priceMatch) {
      const numStr = priceMatch[1] || priceMatch[2] || priceMatch[3] || priceMatch[4];
      price = parseFloat(numStr.replace(/[\s,]/g, ''));
      currency = text.includes('$') ? "USD" : "EUR";
    }
  }
  
  // Extraire la localisation
  let location = "";
  const locationSelectors = [
    '.location', '.address', '.place', '.city',
    '[class*="location"]', '[class*="address"]', '[class*="place"]'
  ];
  
  for (const selector of locationSelectors) {
    const locationElement = $element.find(selector).first();
    if (locationElement.length) {
      location = locationElement.text().trim();
      if (location && location.length > 2) break;
    }
  }
  
  // Extraire l'URL de la propriété
  let propertyUrl = "";
  const linkElement = $element.find('a').first();
  if (linkElement.length) {
    const href = linkElement.attr('href');
    if (href) {
      propertyUrl = href.startsWith('http') ? href : new URL(href, baseUrl).toString();
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
  const imageElement = $element.find('img').first();
  if (imageElement.length) {
    const src = imageElement.attr('src') || imageElement.attr('data-src');
    if (src) {
      mainImage = src.startsWith('http') ? src : new URL(src, baseUrl).toString();
    }
  }
  
  // Extraire les caractéristiques de base
  const text = $element.text().toLowerCase();
  
  let bedrooms = null;
  const bedroomMatch = text.match(/(\d+)\s*(bed|chambre|room)/i);
  if (bedroomMatch) {
    bedrooms = parseInt(bedroomMatch[1]);
  }
  
  let bathrooms = null;
  const bathroomMatch = text.match(/(\d+)\s*(bath|salle de bain)/i);
  if (bathroomMatch) {
    bathrooms = parseInt(bathroomMatch[1]);
  }
  
  let area = null;
  const areaMatch = text.match(/(\d+[\d,.]*)\s*m²/i);
  if (areaMatch) {
    area = parseFloat(areaMatch[1].replace(',', '.'));
  }
  
  // Générer un ID externe
  const external_id = propertyUrl ? 
    propertyUrl.split('/').pop()?.replace(/[^a-zA-Z0-9]/g, '') || 
    title.replace(/[^a-zA-Z0-9]/g, '').substring(0, 50) :
    title.replace(/[^a-zA-Z0-9]/g, '').substring(0, 50) + '_' + Date.now();
  
  return {
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
