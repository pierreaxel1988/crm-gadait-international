
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
    // Récupérer l'URL à partir de la requête
    const requestData = await req.json();
    const url = requestData.url;
    const debug = requestData.debug || false;

    if (!url) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "URL manquante dans la requête",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Tentative d'extraction des données depuis: ${url}`);

    // Faire une requête à l'URL avec plusieurs user-agents différents pour contourner les protections
    const userAgents = [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
    ];
    
    // Choisir un user agent aléatoire
    const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
    
    // Faire la requête avec le user agent choisi
    const response = await fetch(url, {
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
      throw new Error(`Erreur lors de la récupération du site: ${response.status}`);
    }

    const html = await response.text();
    console.log(`HTML récupéré avec succès (${html.length} caractères)`);

    // En mode debug, renvoyer un extrait du HTML
    if (debug) {
      console.log(`Premiers 500 caractères du HTML: ${html.substring(0, 500)}`);
    }

    // Analyser le HTML pour extraire les propriétés
    const properties = extractProperties(url, html, debug);
    console.log(`${properties.length} propriétés extraites`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `${properties.length} propriétés extraites avec succès`,
        properties,
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

function extractProperties(url: string, html: string, debug = false) {
  const $ = cheerio.load(html);
  const properties = [];
  
  // Détection du site web
  if (url.includes("idealista.com") || url.includes("idealista.es")) {
    console.log("Site détecté: Idealista");
    
    // Extraction améliorée pour les pages de détail Idealista
    // Titre et type de propriété
    let title = "";
    const titleSelectors = [
      "h1.main-info__title", 
      "h1.title", 
      "span[data-testid='title']",
      "h1.container-title",
      "h1.property-title",
      "h1"
    ];
    
    for (const selector of titleSelectors) {
      const element = $(selector).first();
      if (element.length) {
        title = element.text().trim();
        if (title) break;
      }
    }
    
    if (debug) {
      console.log(`Titre trouvé: "${title}"`);
    }
    
    let propertyType = "";
    
    // Chercher les mots clés dans le titre pour le type de propriété
    const titleLower = title.toLowerCase();
    if (titleLower.includes("villa") || titleLower.includes("chalet") || titleLower.includes("luxury")) {
      propertyType = "Villa";
    } else if (titleLower.includes("piso") || titleLower.includes("apartamento") || titleLower.includes("flat") || titleLower.includes("apartment")) {
      propertyType = "Appartement";
    } else if (titleLower.includes("casa") || titleLower.includes("house")) {
      propertyType = "Maison";
    } else if (titleLower.includes("penthouse") || titleLower.includes("ático") || titleLower.includes("atico")) {
      propertyType = "Penthouse";
    } else {
      // Si on ne peut pas déterminer à partir du titre, chercher dans d'autres éléments
      const breadcrumbs = $(".breadcrumb, .bread-crumb, nav.breadcrumbs, .re-Breadcrumb");
      if (breadcrumbs.length) {
        const breadcrumbText = breadcrumbs.text().toLowerCase();
        if (breadcrumbText.includes("villa") || breadcrumbText.includes("chalet")) {
          propertyType = "Villa";
        } else if (breadcrumbText.includes("piso") || breadcrumbText.includes("apartamento")) {
          propertyType = "Appartement";
        } else if (breadcrumbText.includes("casa")) {
          propertyType = "Maison";
        } else if (breadcrumbText.includes("penthouse") || breadcrumbText.includes("atico")) {
          propertyType = "Penthouse";
        }
      }
    }
    
    // Essayer une autre approche si toujours pas de type
    if (!propertyType) {
      const metaDescription = $('meta[name="description"]').attr('content') || '';
      if (metaDescription.toLowerCase().includes('villa') || metaDescription.toLowerCase().includes('chalet')) {
        propertyType = "Villa";
      } else if (metaDescription.toLowerCase().includes('piso') || metaDescription.toLowerCase().includes('apartamento')) {
        propertyType = "Appartement";
      } else if (metaDescription.toLowerCase().includes('casa')) {
        propertyType = "Maison";
      }
    }
    
    // Par défaut pour les URLs de Marbella ou les propriétés de luxe
    if (!propertyType && (url.toLowerCase().includes('marbella') || url.toLowerCase().includes('luxury'))) {
      propertyType = "Villa";
    }
    
    if (debug) {
      console.log(`Type de propriété détecté: "${propertyType}"`);
    }
    
    // Prix - chercher dans de multiples sélecteurs
    let price = "";
    const priceSelectors = [
      "span.price", 
      ".info-data-price", 
      ".price", 
      "[data-testid='price']",
      ".re-DetailHeader-price",
      "span[itemprop='price']",
      "div.price-container"
    ];
    
    for (const selector of priceSelectors) {
      const element = $(selector).first();
      if (element.length) {
        price = element.text().trim();
        if (price) break;
      }
    }
    
    if (!price) {
      // Chercher le prix dans tout élément contenant "€"
      $("p, span, div").each((_, el) => {
        const text = $(el).text().trim();
        if (text.includes("€")) {
          const priceMatch = text.match(/[\d\.]{1,3}(?:\.?\d{3})*(?:,\d+)?\s*€/);
          if (priceMatch) {
            price = priceMatch[0];
            return false; // Break the loop
          }
        }
      });
    }
    
    if (debug) {
      console.log(`Prix trouvé: "${price}"`);
    }
    
    // Localisation - chercher dans de multiples sélecteurs
    let location = "";
    const locationSelectors = [
      ".main-info__title-minor", 
      ".location", 
      "address", 
      "[data-testid='mapTitle']", 
      ".property-location",
      ".re-DetailMap-address",
      "span[itemprop='address']",
      ".address"
    ];
    
    for (const selector of locationSelectors) {
      const element = $(selector).first();
      if (element.length) {
        location = element.text().trim();
        if (location) break;
      }
    }
    
    // Si toujours pas de localisation, essayer d'autres méthodes
    if (!location) {
      // Vérifier les métadonnées
      const metaLocation = $('meta[property="og:locality"], meta[name="geo.placename"]').attr('content');
      if (metaLocation) location = metaLocation;
    }
    
    // Si toujours pas de localisation, extraire de l'URL
    if (!location) {
      const urlParts = url.toLowerCase().split('/');
      for (const part of urlParts) {
        if (['marbella', 'madrid', 'barcelona', 'valencia', 'malaga', 'sevilla', 'ibiza'].includes(part)) {
          location = part.charAt(0).toUpperCase() + part.slice(1);
          break;
        }
      }
    }
    
    if (debug) {
      console.log(`Localisation trouvée: "${location}"`);
    }
    
    // Description - chercher dans de multiples sélecteurs
    let description = "";
    const descriptionSelectors = [
      ".comment", 
      "[itemprop='description']", 
      ".adCommentsLanguage", 
      ".detail-description", 
      ".description",
      ".re-DetailDescription",
      "div[data-testid='description']",
      "p.description"
    ];
    
    for (const selector of descriptionSelectors) {
      const element = $(selector).first();
      if (element.length) {
        description = element.text().trim();
        if (description) break;
      }
    }
    
    if (debug) {
      console.log(`Description trouvée: ${description ? "Oui" : "Non"}`);
    }
    
    // Référence - chercher dans de multiples sélecteurs et patterns
    let reference = "";
    
    // Essayer de trouver un élément contenant la référence
    $("p, span, div, small").each((_, el) => {
      const text = $(el).text().trim();
      const refMatch = text.match(/\b(?:ref|reference|referencia|código|codigo|id)[\.:]?\s*(\w+[\d]+\w*)/i);
      if (refMatch && refMatch[1]) {
        reference = refMatch[1];
        return false; // Break the loop
      }
    });
    
    // Si pas de référence trouvée, extraire de l'URL
    if (!reference) {
      const refMatch = url.match(/\/(\d{6,})/);
      if (refMatch) reference = refMatch[1];
    }
    
    if (debug) {
      console.log(`Référence trouvée: "${reference}"`);
    }
    
    // Caractéristiques : chambres, salles de bain, surface
    let bedrooms = "";
    let bathrooms = "";
    let area = "";
    
    // Approche 1: Rechercher dans les détails spécifiques
    const featureSelectors = [
      ".detail-info li", 
      ".details-property-feature li", 
      ".details-property li", 
      ".property-features li", 
      "[data-testid='feature']",
      ".re-DetailFeatures li",
      ".features-container li",
      ".specs li"
    ];
    
    let detailItems = $();
    for (const selector of featureSelectors) {
      const elements = $(selector);
      if (elements.length) {
        detailItems = elements;
        break;
      }
    }
    
    detailItems.each((_, el) => {
      const text = $(el).text().trim().toLowerCase();
      
      // Chambres
      if (text.includes("hab") || text.includes("dorm") || text.includes("bedroom") || text.includes("dormitorio")) {
        const match = text.match(/(\d+)/);
        if (match) bedrooms = match[1];
      }
      
      // Salles de bain
      else if (text.includes("baño") || text.includes("bathroom") || text.includes("bath")) {
        const match = text.match(/(\d+)/);
        if (match) bathrooms = match[1];
      }
      
      // Surface
      else if (text.includes("m²") || text.includes("metros") || text.includes("superficie")) {
        const match = text.match(/(\d+[\d\.,]*)?\s*m²/i);
        if (match) area = match[0];
      }
    });
    
    // Approche 2: Chercher des éléments spécifiques
    if (!bedrooms) {
      const bedroomSelectors = [
        ".re-DetailHeader-features .re-DetailHeader-featuresItem:nth-child(1)",
        "[data-testid='rooms']",
        "span.rooms"
      ];
      
      for (const selector of bedroomSelectors) {
        const element = $(selector).first();
        if (element.length) {
          const text = element.text().trim();
          const match = text.match(/(\d+)/);
          if (match) {
            bedrooms = match[1];
            break;
          }
        }
      }
    }
    
    if (!bathrooms) {
      const bathroomSelectors = [
        ".re-DetailHeader-features .re-DetailHeader-featuresItem:nth-child(2)",
        "[data-testid='bathrooms']",
        "span.bathrooms"
      ];
      
      for (const selector of bathroomSelectors) {
        const element = $(selector).first();
        if (element.length) {
          const text = element.text().trim();
          const match = text.match(/(\d+)/);
          if (match) {
            bathrooms = match[1];
            break;
          }
        }
      }
    }
    
    if (!area) {
      const areaSelectors = [
        ".re-DetailHeader-features .re-DetailHeader-featuresItem:nth-child(3)",
        "[data-testid='area']",
        "span.area"
      ];
      
      for (const selector of areaSelectors) {
        const element = $(selector).first();
        if (element.length) {
          const text = element.text().trim();
          const match = text.match(/(\d+[\d\.,]*)?\s*m²/i);
          if (match) {
            area = match[0];
            break;
          }
        }
      }
    }
    
    // Approche 3: Si toujours pas trouvé, chercher dans le titre ou la description
    if (!bedrooms && title) {
      const titleMatch = title.match(/(\d+)\s*(hab|dorm|bedroom|dormitorio)/i);
      if (titleMatch) bedrooms = titleMatch[1];
    }
    
    if (!bedrooms && description) {
      const descMatch = description.match(/(\d+)\s*(hab|dorm|bedroom|dormitorio)/i);
      if (descMatch) bedrooms = descMatch[1];
    }
    
    if (debug) {
      console.log(`Chambres trouvées: "${bedrooms}"`);
      console.log(`Salles de bain trouvées: "${bathrooms}"`);
      console.log(`Surface trouvée: "${area}"`);
    }
    
    // Extraire les amenities
    const amenities: string[] = [];
    
    // Parcourir tous les éléments qui pourraient contenir des aménités
    const amenitySelectors = [
      ".details-property-feature-one li", 
      ".details-property-feature-two li", 
      ".details-property li", 
      ".feature-container li", 
      ".property-features li", 
      "[data-testid='feature']",
      ".re-DetailFeatures-feature",
      ".amenities li"
    ];
    
    for (const selector of amenitySelectors) {
      $(selector).each((_, el) => {
        const feature = $(el).text().trim();
        if (feature && 
            !feature.includes("m²") && 
            !feature.includes("hab") && 
            !feature.includes("baño") && 
            !amenities.includes(feature)) {
          amenities.push(feature);
        }
      });
    }
    
    if (debug) {
      console.log(`Amenities trouvées: ${amenities.length > 0 ? amenities.join(", ") : "Aucune"}`);
    }
    
    // Extraire l'image principale
    let image = "";
    const imageSelectors = [
      ".detail-image",
      "img[itemprop='image']",
      ".gallery img",
      ".main-multimedia img",
      ".media-container img",
      ".bigPhotos img",
      ".re-DetailMosaicPhoto img",
      "picture img",
      "img.main-image"
    ];
    
    for (const selector of imageSelectors) {
      const element = $(selector).first();
      if (element.length) {
        image = element.attr("src") || element.attr("data-src") || "";
        if (image) break;
      }
    }
    
    if (!image) {
      // Essayer d'extraire du contenu du style background-image
      $("[style*='background-image']").each((_, el) => {
        const style = $(el).attr("style") || "";
        const match = style.match(/background-image:\s*url\(['"]?([^'"]+)['"]?\)/i);
        if (match) {
          image = match[1];
          return false;
        }
      });
    }
    
    if (debug) {
      console.log(`Image trouvée: ${image ? "Oui" : "Non"}`);
    }
    
    // Si nous avons au moins un titre ou une localisation, on considère que c'est une propriété valide
    if (title || location || price) {
      // Le pays sera l'Espagne pour Idealista par défaut
      const country = "Spain";
      
      const property = {
        title: title || "Villa de luxe",
        Property_type: propertyType || "Villa",
        Price: price || "Prix sur demande",
        Currency: "EUR",
        Location: location || "Espagne",
        Country: country,
        Number_of_bedrooms: bedrooms || "4",
        Number_of_bathrooms: bathrooms || "3",
        Size_or_area: area || "",
        Property_reference: reference || url.split('/').pop() || "REF-IDEALISTA",
        Description: description || "Propriété en Espagne",
        Key_features_and_amenities: amenities.length > 0 ? amenities : [],
        url,
        image,
      };
      
      properties.push(property);
    }
  } else if (url.includes("lefigaro.fr") || url.includes("properties.lefigaro.com")) {
    console.log("Site détecté: Le Figaro Propriétés");
    
    // Extraction pour une page de détail Le Figaro
    let title = "";
    const titleSelectors = ["h1.product-title", "h1.title-product", "h1.property-title", "h1"];
    
    for (const selector of titleSelectors) {
      const element = $(selector).first();
      if (element.length) {
        title = element.text().trim();
        if (title) break;
      }
    }
    
    let price = "";
    const priceSelectors = [".product-price", ".price-product", "[data-price]", ".price", "span.price"];
    
    for (const selector of priceSelectors) {
      const element = $(selector).first();
      if (element.length) {
        price = element.text().trim();
        if (price) break;
      }
    }
    
    let location = "";
    const locationSelectors = [".product-location", ".location-product", ".location", "span.location"];
    
    for (const selector of locationSelectors) {
      const element = $(selector).first();
      if (element.length) {
        location = element.text().trim();
        if (location) break;
      }
    }
    
    let description = "";
    const descriptionSelectors = [".product-description", ".description", ".description-product", "div.description"];
    
    for (const selector of descriptionSelectors) {
      const element = $(selector).first();
      if (element.length) {
        description = element.text().trim();
        if (description) break;
      }
    }
    
    // Extraire les caractéristiques
    let bedrooms = "";
    let bathrooms = "";
    let area = "";
    let reference = "";
    
    // Chercher la référence
    const refSelectors = ["[data-ref]", ".ref", ".reference", ".product-reference"];
    
    for (const selector of refSelectors) {
      const element = $(selector).first();
      if (element.length) {
        reference = element.text().trim() || element.attr("data-ref") || "";
        if (reference) {
          reference = reference.replace(/[rR][eE][fF]\s*:?\s*/i, "").trim();
          break;
        }
      }
    }
    
    if (!reference) {
      // Essayer d'extraire la référence de l'URL
      const urlMatch = url.match(/\/([a-zA-Z0-9-]+)\/?$/);
      if (urlMatch) {
        reference = urlMatch[1];
      }
    }
    
    // Chercher les caractéristiques dans divers sélecteurs
    const featureSelectors = [".product-features li", ".features li", ".characteristics li", ".specs li", ".details li"];
    
    let featureElements = $();
    for (const selector of featureSelectors) {
      const elements = $(selector);
      if (elements.length) {
        featureElements = elements;
        break;
      }
    }
    
    featureElements.each((_, el) => {
      const text = $(el).text().trim().toLowerCase();
      
      if (text.includes("chambre") || text.includes("bedroom")) {
        const match = text.match(/(\d+)/);
        if (match) bedrooms = match[1];
      } else if (text.includes("salle de bain") || text.includes("bathroom")) {
        const match = text.match(/(\d+)/);
        if (match) bathrooms = match[1];
      } else if (text.includes("surface") || text.includes("area") || text.includes("m²")) {
        const match = text.match(/(\d+[\d\s,.]*)/);
        if (match) area = match[1].trim();
      }
    });
    
    // Pour les éléments data-spécifiques
    bedrooms = bedrooms || $("[data-rooms]").attr("data-rooms") || "";
    bathrooms = bathrooms || $("[data-bathrooms]").attr("data-bathrooms") || "";
    area = area || $("[data-area]").attr("data-area") || "";
    
    // Extraire l'image
    let image = "";
    const imageSelectors = [".product-image img", ".carousel img", ".gallery img", "img.main-image"];
    
    for (const selector of imageSelectors) {
      const element = $(selector).first();
      if (element.length) {
        image = element.attr("src") || element.attr("data-src") || "";
        if (image) break;
      }
    }
    
    // Si nous avons trouvé au moins un titre, on considère que c'est une propriété valide
    if (title || location || price) {
      const property = {
        title: title || "Propriété en France",
        Property_type: "Villa",
        Price: price || "Prix sur demande",
        Currency: "EUR",
        Location: location || "France",
        Country: "France",
        Number_of_bedrooms: bedrooms || "",
        Number_of_bathrooms: bathrooms || "",
        Size_or_area: area || "",
        Property_reference: reference || "REF-FIGARO",
        Description: description || "",
        Key_features_and_amenities: [],
        url,
        image,
      };
      
      properties.push(property);
    } else {
      // Fallback pour la liste des propriétés
      $(".property-item, .product-item, .listing-item").each((index, element) => {
        const item = $(element);
        
        const property = {
          title: item.find(".property-title, .product-title, .title").text().trim() || "Propriété en France",
          Property_type: "Villa",
          Price: item.find(".property-price, .product-price, .price").text().trim() || "Prix sur demande",
          Currency: "EUR",
          Location: item.find(".property-location, .product-location, .location").text().trim() || "France",
          Country: "France",
          Description: item.find(".property-description, .product-description, .description").text().trim() || "",
          Property_reference: item.find(".property-reference, .product-reference, .reference").text().trim() || 
                    item.attr("data-ref") || 
                    `LF-${index + 1}`,
          url: item.find("a").attr("href") || "",
          image: item.find("img").attr("src") || "",
        };
        
        properties.push(property);
      });
    }
  } else {
    // Extraction générique pour d'autres sites immobiliers
    console.log("Site non spécifiquement supporté, tentative d'extraction générique");
    
    // D'abord essayer de voir si c'est une page de détail
    let title = "";
    const titleSelectors = ["h1", ".property-title", ".listing-title", "h1.title"];
    
    for (const selector of titleSelectors) {
      const element = $(selector).first();
      if (element.length) {
        title = element.text().trim();
        if (title) break;
      }
    }
    
    let price = "";
    const priceSelectors = [".price", "[data-price]", ".property-price", "span.price"];
    
    for (const selector of priceSelectors) {
      const element = $(selector).first();
      if (element.length) {
        price = element.text().trim();
        if (price) break;
      }
    }
    
    let location = "";
    const locationSelectors = [".location", ".address", ".property-location", "span.location", "address"];
    
    for (const selector of locationSelectors) {
      const element = $(selector).first();
      if (element.length) {
        location = element.text().trim();
        if (location) break;
      }
    }
    
    let description = "";
    const descriptionSelectors = [".description", ".property-description", "article p", "div.description"];
    
    for (const selector of descriptionSelectors) {
      const element = $(selector).first();
      if (element.length) {
        description = element.text().trim();
        if (description) break;
      }
    }
    
    // Référence
    let reference = "";
    const refSelectors = [".reference", ".ref", "[data-ref]"];
    
    for (const selector of refSelectors) {
      const element = $(selector).first();
      if (element.length) {
        reference = element.text().trim() || element.attr("data-ref") || "";
        if (reference) break;
      }
    }
    
    if (!reference) {
      // Essayer d'extraire la référence de l'URL
      const urlMatch = url.match(/\/([a-zA-Z0-9-]+)\/?$/);
      if (urlMatch) {
        reference = urlMatch[1];
      }
    }
    
    // Caractéristiques
    let bedrooms = "";
    let bathrooms = "";
    let area = "";
    
    const featureSelectors = [".features li", ".specifications li", ".details li", ".property-details li"];
    
    let featureElements = $();
    for (const selector of featureSelectors) {
      const elements = $(selector);
      if (elements.length) {
        featureElements = elements;
        break;
      }
    }
    
    featureElements.each((_, el) => {
      const text = $(el).text().trim().toLowerCase();
      
      if (text.includes("chambre") || text.includes("bedroom") || text.includes("room")) {
        const match = text.match(/(\d+)/);
        if (match) bedrooms = match[1];
      } else if (text.includes("salle de bain") || text.includes("bathroom") || text.includes("bath")) {
        const match = text.match(/(\d+)/);
        if (match) bathrooms = match[1];
      } else if (text.includes("surface") || text.includes("area") || text.includes("m²") || text.includes("sqm")) {
        const match = text.match(/(\d+[\d\s,.]*)/);
        if (match) area = match[1].trim();
      }
    });
    
    // Image
    let image = "";
    const imageSelectors = ["img.main-image", ".carousel img", ".gallery img", ".property-image img", ".listing-image img"];
    
    for (const selector of imageSelectors) {
      const element = $(selector).first();
      if (element.length) {
        image = element.attr("src") || element.attr("data-src") || "";
        if (image) break;
      }
    }
    
    if (title && (price || description)) {
      // C'est probablement une page de détail
      const property = {
        title: title || "Propriété immobilière",
        Property_type: "",
        Price: price || "Prix sur demande",
        Location: location || "",
        Country: "",
        Number_of_bedrooms: bedrooms || "",
        Number_of_bathrooms: bathrooms || "",
        Size_or_area: area || "",
        Property_reference: reference || url.split('/').pop() || "REF-1",
        Description: description || "",
        Key_features_and_amenities: [],
        url,
        image: image || "",
      };
      
      properties.push(property);
    } else {
      // Tentative d'extraction basée sur des motifs communs d'annonces immobilières
      $("div[class*='property'], div[class*='listing'], div[class*='estate'], div[class*='real'], article, .card").each((index, element) => {
        const item = $(element);
        
        // Vérifier si c'est probablement une annonce immobilière
        const itemText = item.text();
        const hasPrice = itemText.match(/(\$|€|£|USD|EUR)\s?[\d,.]+|[\d,.]+\s?(\$|€|£|USD|EUR)/i);
        const hasArea = itemText.match(/\d+\s?(m²|m2|sq\.m|square meter|ft²|sqft)/i);
        
        if (hasPrice || hasArea) {
          // Extraire tous les textes pour analyse
          const allText = item.text().trim();
          
          // Essayer de déduire le prix
          let price = "";
          const priceMatch = allText.match(/(\$|€|£|USD|EUR)\s?[\d,.]+|[\d,.]+\s?(\$|€|£|USD|EUR)/i);
          if (priceMatch) {
            price = priceMatch[0].trim();
          }
          
          // Essayer de déduire la localisation
          let location = "";
          const locationElem = item.find("[class*='location'], [class*='address'], [class*='city'], address");
          if (locationElem.length) {
            location = locationElem.first().text().trim();
          }
          
          // Extraire le titre et la description
          let title = "";
          const titleElem = item.find("h1, h2, h3, h4, [class*='title']");
          if (titleElem.length) {
            title = titleElem.first().text().trim();
          }
          
          let description = "";
          const descElem = item.find("p, [class*='description'], [class*='excerpt']");
          if (descElem.length) {
            description = descElem.first().text().trim();
          }
          
          // Extraire l'URL de l'image principale
          let image = "";
          const imgElem = item.find("img");
          if (imgElem.length) {
            image = imgElem.first().attr("src") || "";
          }
          
          // Extraire l'URL de l'annonce
          let propertyUrl = "";
          const linkElem = item.find("a");
          if (linkElem.length) {
            propertyUrl = linkElem.first().attr("href") || "";
            
            // Convertir en URL absolue si nécessaire
            if (propertyUrl && !propertyUrl.startsWith("http")) {
              const urlObj = new URL(url);
              propertyUrl = `${urlObj.origin}${propertyUrl.startsWith("/") ? "" : "/"}${propertyUrl}`;
            }
          }
          
          const property = {
            title: title || "Propriété immobilière",
            Price: price || "Prix sur demande",
            Location: location || "",
            Description: description || "",
            Property_reference: `GEN-${index + 1}`,
            url: propertyUrl || url,
            image: image,
          };
          
          properties.push(property);
        }
      });
    }
  }
  
  return properties;
}
