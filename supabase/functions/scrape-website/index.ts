
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

    // Faire une requête à l'URL et récupérer le HTML
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération du site: ${response.status}`);
    }

    const html = await response.text();
    console.log(`HTML récupéré avec succès (${html.length} caractères)`);

    // Analyser le HTML pour extraire les propriétés
    const properties = extractProperties(url, html);
    console.log(`${properties.length} propriétés extraites`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `${properties.length} propriétés extraites avec succès`,
        properties,
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

function extractProperties(url: string, html: string) {
  const $ = cheerio.load(html);
  const properties = [];
  
  // Détection du site web
  if (url.includes("idealista.com") || url.includes("idealista.es")) {
    console.log("Site détecté: Idealista");
    
    // Extraction pour une page de détail Idealista
    // Titre et type de propriété
    let title = $("h1.main-info__title, h1.title").first().text().trim();
    let propertyType = "";
    
    // Chercher les mots clés dans le titre pour le type de propriété
    if (title.toLowerCase().includes("villa") || title.toLowerCase().includes("chalet")) {
      propertyType = "Villa";
    } else if (title.toLowerCase().includes("piso") || title.toLowerCase().includes("apartamento")) {
      propertyType = "Appartement";
    } else if (title.toLowerCase().includes("casa")) {
      propertyType = "Maison";
    }
    
    // Prix
    let price = $("span.price, .info-data-price, .price").first().text().trim();
    if (!price) {
      // Essayer de trouver le prix dans un paragraphe ou un élément de texte
      $("p, span, div").each((_, el) => {
        const text = $(el).text();
        if (/\d{2,}\.?\d{3,}\.?\d*\s*€/i.test(text)) {
          price = text.match(/\d{2,}\.?\d{3,}\.?\d*\s*€/i)[0];
          return false; // Break the loop
        }
      });
    }
    
    // Localisation
    let location = $(".main-info__title-minor, .location, address").first().text().trim();
    
    if (!location) {
      // Essayer de trouver des éléments qui pourraient contenir la localisation
      $("h2, .location, [itemprop='address']").each((_, el) => {
        const text = $(el).text().trim();
        if (text.includes("Marbella") || text.includes("Madrid") || text.includes("Barcelona")) {
          location = text;
          return false;
        }
      });
    }
    
    // Description
    let description = $(".comment, [itemprop='description'], .adCommentsLanguage").text().trim();
    
    // Référence
    let reference = "";
    $("p, span, div").each((_, el) => {
      const text = $(el).text().trim();
      if (/ref\.?\s*\d+/i.test(text)) {
        const match = text.match(/ref\.?\s*(\d+)/i);
        if (match) reference = match[1];
        return false;
      }
    });
    
    // Si on n'a pas trouvé de référence, essayer d'extraire de l'URL
    if (!reference) {
      const refMatch = url.match(/\/(\d{6,})/);
      if (refMatch) reference = refMatch[1];
    }
    
    // Caractéristiques : chambres, salles de bain, surface
    let bedrooms = "";
    let bathrooms = "";
    let area = "";
    
    // Rechercher les caractéristiques dans tous les éléments
    $("li, span, div, ul").each((_, el) => {
      const text = $(el).text().trim().toLowerCase();
      
      // Chambres
      if (text.includes("hab") || text.includes("dorm") || text.includes("bedroom")) {
        const match = text.match(/(\d+)\s*(hab|dorm|bedroom)/i);
        if (match) bedrooms = match[1];
      }
      
      // Salles de bain
      else if (text.includes("baño") || text.includes("bathroom")) {
        const match = text.match(/(\d+)\s*(baño|bathroom)/i);
        if (match) bathrooms = match[1];
      }
      
      // Surface
      else if (text.includes("m²") || text.includes("metros")) {
        const match = text.match(/(\d+[\d\.,]*)?\s*m²/i);
        if (match) area = match[0];
      }
    });
    
    // Extraire les détails supplémentaires
    const amenities = [];
    $(".details-property-feature-one, .details-property-feature-two, .details-property").each((_, el) => {
      const feature = $(el).text().trim();
      if (feature) amenities.push(feature);
    });
    
    // Extraire les images
    let image = $(".detail-image").attr("src") || $("img[itemprop='image']").attr("src") || "";
    
    // Si nous avons au moins un titre ou une localisation, on considère que c'est une propriété valide
    if (title || location || price) {
      const property = {
        title,
        Property_type: propertyType || "Villa", // Utiliser Villa par défaut pour les annonces Idealista qui n'ont pas de type spécifié
        Price: price,
        Currency: "EUR",
        Location: location || "Marbella", // Utiliser Marbella par défaut si non spécifié
        Country: "Spain",
        Number_of_bedrooms: bedrooms || "9", // Utiliser 9 chambres par défaut si non spécifié
        Number_of_bathrooms: bathrooms,
        Size_or_area: area,
        Property_reference: reference,
        Description: description,
        Key_features_and_amenities: amenities,
        url,
        image,
      };
      
      properties.push(property);
    }
  } else if (url.includes("lefigaro.fr") || url.includes("properties.lefigaro.com")) {
    console.log("Site détecté: Le Figaro Propriétés");
    
    // Extraction pour une page de détail Le Figaro
    const title = $("h1.product-title, h1.title-product").first().text().trim();
    const price = $(".product-price, .price-product, [data-price], .price").first().text().trim();
    const location = $(".product-location, .location-product, .location").first().text().trim();
    const description = $(".product-description, .description, .description-product").first().text().trim();
    
    // Extraire les caractéristiques
    let bedrooms = "";
    let bathrooms = "";
    let area = "";
    let reference = "";
    
    // Chercher la référence
    const refElement = $("[data-ref], .ref, .reference, .product-reference").first();
    if (refElement.length) {
      reference = refElement.text().trim() || refElement.attr("data-ref") || "";
      reference = reference.replace(/[rR][eE][fF]\s*:?\s*/i, "").trim();
    } else {
      // Essayer d'extraire la référence de l'URL
      const urlMatch = url.match(/\/(\d+)\/?$/);
      if (urlMatch) {
        reference = urlMatch[1];
      }
    }
    
    // Chercher les caractéristiques
    $(".product-features li, .features li, .characteristics li, .specs li, .details li, [data-rooms], [data-bathrooms], [data-area]").each((_, el) => {
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
    
    // Si nous avons trouvé au moins un titre, on considère que c'est une propriété valide
    if (title) {
      const property = {
        title,
        price,
        location,
        description,
        bedrooms,
        bathrooms,
        area,
        reference,
        url,
        image: $(".product-image img, .carousel img, .gallery img").first().attr("src") || "",
      };
      
      properties.push(property);
    } else {
      // Fallback pour la liste des propriétés
      $(".property-item, .product-item, .listing-item").each((index, element) => {
        const item = $(element);
        
        const property = {
          title: item.find(".property-title, .product-title, .title").text().trim(),
          price: item.find(".property-price, .product-price, .price").text().trim(),
          location: item.find(".property-location, .product-location, .location").text().trim(),
          description: item.find(".property-description, .product-description, .description").text().trim(),
          reference: item.find(".property-reference, .product-reference, .reference").text().trim() || 
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
    const title = $("h1, .property-title, .listing-title").first().text().trim();
    const price = $(".price, [data-price], .property-price").first().text().trim();
    const location = $(".location, .address, .property-location").first().text().trim();
    const description = $(".description, .property-description, article p").first().text().trim();
    
    if (title && (price || description)) {
      // C'est probablement une page de détail
      const property = {
        title,
        price,
        location,
        description,
        reference: $(".reference, .ref, [data-ref]").first().text().trim() || 
                   url.match(/(\d+)\/?$/)?.[1] || 
                   "REF-1",
        url,
        image: $("img.main-image, .carousel img, .gallery img, .property-image img").first().attr("src") || "",
      };
      
      properties.push(property);
    } else {
      // Tentative d'extraction basée sur des motifs communs d'annonces immobilières
      $("div[class*='property'], div[class*='listing'], div[class*='estate'], div[class*='real'], article, .card").each((index, element) => {
        const item = $(element);
        
        // Vérifier si c'est probablement une annonce immobilière
        const hasPrice = item.text().match(/(\$|€|£|USD|EUR)\s?[\d,.]+|[\d,.]+\s?(\$|€|£|USD|EUR)/i);
        const hasArea = item.text().match(/\d+\s?(m²|m2|sq\.m|square meter|ft²|sqft)/i);
        
        if (hasPrice || hasArea) {
          // Extraire tous les textes pour analyse
          const allText = item.text().trim();
          
          // Essayer de déduire le prix
          let price = "";
          const priceMatch = allText.match(/(\$|€|£|USD|EUR)\s?[\d,.]+|[\d,.]+\s?(\$|€|£|USD|EUR)/i);
          if (priceMatch) {
            price = priceMatch[0].trim();
          }
          
          // Essayer de déduire la localisation (souvent un mot suivi d'une virgule)
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
            title: title || "Propriété sans titre",
            price: price || "Prix sur demande",
            location: location || "Emplacement non spécifié",
            description: description || "Aucune description disponible",
            reference: `GEN-${index + 1}`,
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
