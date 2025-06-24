
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
    const url = requestData.url || "https://gadait-international.com/en/buy";
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
  
  console.log("Début de l'extraction des propriétés Gadait");
  
  // Look for property cards - try multiple possible selectors
  const propertySelectors = [
    '.property-card',
    '.listing-item',
    '.property-item',
    '.product-card',
    '[class*="property"]',
    '[class*="listing"]',
    'article',
    '.card'
  ];
  
  let propertyElements = $();
  for (const selector of propertySelectors) {
    const elements = $(selector);
    if (elements.length > 0) {
      console.log(`Trouvé ${elements.length} éléments avec le sélecteur: ${selector}`);
      propertyElements = elements;
      break;
    }
  }
  
  // If no specific property cards found, try to find individual links and content
  if (propertyElements.length === 0) {
    console.log("Aucun élément de propriété trouvé avec les sélecteurs standard, recherche de liens...");
    
    // Look for links that might be property pages
    $('a[href*="/property"], a[href*="/buy"], a[href*="/listing"]').each((index, element) => {
      const $element = $(element);
      const href = $element.attr('href');
      
      if (href && !href.includes('#') && !href.includes('javascript:')) {
        // Try to extract basic info from the link context
        const linkText = $element.text().trim();
        const parentElement = $element.parent();
        
        if (linkText.length > 5) { // Basic filter
          properties.push(extractPropertyFromElement($element, baseUrl, $));
        }
      }
    });
  } else {
    // Extract from found property elements
    propertyElements.each((index, element) => {
      const property = extractPropertyFromElement($(element), baseUrl, $);
      if (property && property.title) {
        properties.push(property);
      }
    });
  }
  
  // If still no properties found, try a more generic approach
  if (properties.length === 0) {
    console.log("Recherche générique de contenu de propriétés...");
    
    // Look for any elements containing price patterns (€, EUR, etc.)
    $("*").filter(function() {
      const text = $(this).text();
      return text.match(/€[\d\s,.]+|[\d\s,.]+\s*€|EUR[\d\s,.]+|[\d\s,.]+\s*EUR/i);
    }).each((index, element) => {
      if (index < 20) { // Limit to avoid too many results
        const $element = $(element);
        const property = extractPropertyFromElement($element, baseUrl, $);
        if (property && property.title && !properties.some(p => p.title === property.title)) {
          properties.push(property);
        }
      }
    });
  }
  
  if (debug) {
    console.log(`Propriétés extraites: ${JSON.stringify(properties, null, 2)}`);
  }
  
  return properties;
}

function extractPropertyFromElement($element, baseUrl: string, $: any) {
  // Extract title
  let title = "";
  const titleSelectors = ['h1', 'h2', 'h3', '.title', '.property-title', '.listing-title'];
  
  for (const selector of titleSelectors) {
    const titleElement = $element.find(selector).first();
    if (titleElement.length) {
      title = titleElement.text().trim();
      if (title) break;
    }
  }
  
  if (!title) {
    title = $element.text().trim().split('\n')[0].substring(0, 100);
  }
  
  // Extract price
  let price = "";
  const priceSelectors = ['.price', '.property-price', '[class*="price"]'];
  
  for (const selector of priceSelectors) {
    const priceElement = $element.find(selector).first();
    if (priceElement.length) {
      price = priceElement.text().trim();
      if (price) break;
    }
  }
  
  if (!price) {
    // Look for price patterns in text
    const text = $element.text();
    const priceMatch = text.match(/€[\d\s,.]+|[\d\s,.]+\s*€|EUR[\d\s,.]+|[\d\s,.]+\s*EUR/i);
    if (priceMatch) {
      price = priceMatch[0];
    }
  }
  
  // Extract location
  let location = "";
  const locationSelectors = ['.location', '.address', '.property-location', '[class*="location"]'];
  
  for (const selector of locationSelectors) {
    const locationElement = $element.find(selector).first();
    if (locationElement.length) {
      location = locationElement.text().trim();
      if (location) break;
    }
  }
  
  // Extract property URL
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
  
  // Extract image
  let mainImage = "";
  const imageElement = $element.find('img').first();
  if (imageElement.length) {
    const src = imageElement.attr('src') || imageElement.attr('data-src');
    if (src) {
      mainImage = src.startsWith('http') ? src : new URL(src, baseUrl).toString();
    }
  }
  
  // Extract basic characteristics
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
  
  // Generate external ID from URL or title
  const external_id = propertyUrl ? 
    propertyUrl.split('/').pop()?.replace(/[^a-zA-Z0-9]/g, '') || 
    title.replace(/[^a-zA-Z0-9]/g, '').substring(0, 50) :
    title.replace(/[^a-zA-Z0-9]/g, '').substring(0, 50);
  
  return {
    external_id,
    title: title || "Propriété Gadait",
    description: $element.text().trim().substring(0, 500) || "",
    price: price ? parseFloat(price.replace(/[^0-9.]/g, '')) || null : null,
    currency: "EUR",
    location: location || "",
    country: "Mauritius", // Default for Gadait
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
      // Check if property already exists
      const { data: existing } = await supabase
        .from('gadait_properties')
        .select('id')
        .eq('external_id', property.external_id)
        .single();
      
      if (existing) {
        // Update existing property
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
        // Insert new property
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
